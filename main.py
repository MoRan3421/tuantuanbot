import os
import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Any

import discord
from discord.ext import commands, tasks
from quart import Quart, render_template_string, request, jsonify, redirect, url_for
import google.generativeai as genai

# ==========================================
# 1. 基础配置与全局状态 (数据库模拟)
# ==========================================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TuanBot")

# 配置项 (生产环境应从环境变量获取)
TOKEN = os.getenv("DISCORD_TOKEN", "")
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
OWNER_ID = int(os.getenv("OWNER_ID", "0"))
PREFIX = "!"

# 模拟持久化数据库 (实际建议使用 Firestore)
db_state = {
    "bot_profile": {
        "nickname": "团团助手",
        "activity": "正在处理指令...",
        "status": "online"
    },
    "modules": {
        "ai_chat": True,
        "admin_tools": True,
        "billing_system": True
    },
    "premium_users": {},  # {user_id: expire_timestamp}
    "prices": {
        "monthly": 9.9,
        "yearly": 89.0
    },
    "system_logs": []
}

def add_log(msg):
    time_str = datetime.now().strftime("%H:%M:%S")
    db_state["system_logs"].insert(0, f"[{time_str}] {msg}")
    if len(db_state["system_logs"]) > 20: db_state["system_logs"].pop()

# ==========================================
# 2. Discord 机器人核心类
# ==========================================
class TuanTuanBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.members = True
        super().__init__(command_prefix=PREFIX, intents=intents, help_command=None)

    async def setup_hook(self):
        # 注册所有 Cog 模块
        await self.add_cog(AICog(self))
        await self.add_cog(ManagementCog(self))
        await self.add_cog(BillingCog(self))
        add_log("所有功能模块 (Cogs) 已加载完毕")

    async def on_ready(self):
        logger.info(f"Bot 登录成功: {self.user}")
        await self.sync_settings()

    async def sync_settings(self):
        """同步网页端的设置到 Discord 资料"""
        try:
            profile = db_state["bot_profile"]
            # 更新状态
            activity = discord.Game(name=profile["activity"])
            status_map = {
                "online": discord.Status.online,
                "idle": discord.Status.idle,
                "dnd": discord.Status.dnd
            }
            await self.change_presence(status=status_map.get(profile["status"]), activity=activity)
            add_log("机器人 Profile 已同步更新")
        except Exception as e:
            logger.error(f"同步设置失败: {e}")

# ==========================================
# 3. Cog: AI 对话模块
# ==========================================
class AICog(commands.Cog, name="AI功能"):
    def __init__(self, bot):
        self.bot = bot
        genai.configure(api_key=GEMINI_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.bot or not db_state["modules"]["ai_chat"]:
            return

        if self.bot.user.mentioned_in(message):
            # 检查是否为付费用户 (简单的逻辑展示)
            is_premium = str(message.author.id) in db_state["premium_users"]
            
            clean_text = message.content.replace(f'<@!{self.bot.user.id}>', '').replace(f'<@{self.bot.user.id}>', '').strip()
            
            async with message.channel.typing():
                try:
                    response = self.model.generate_content(f"User: {clean_text}\nPremium Status: {is_premium}")
                    await message.reply(f"{'🌟 [VIP] ' if is_premium else ''}{response.text}")
                except Exception as e:
                    await message.reply(f"抱歉，AI 模块遇到了点问题: {e}")

# ==========================================
# 4. Cog: 管理与前缀指令模块
# ==========================================
class ManagementCog(commands.Cog, name="管理系统"):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="ping")
    async def ping(self, ctx):
        """查看机器人延迟"""
        await ctx.send(f"🏓 延迟: {round(self.bot.latency * 1000)}ms")

    @commands.command(name="stats")
    @commands.has_permissions(administrator=True)
    async def stats(self, ctx):
        """查看服务器统计"""
        embed = discord.Embed(title="📊 系统统计", color=discord.Color.blue())
        embed.add_field(name="服务器数量", value=len(self.bot.guilds))
        embed.add_field(name="Premium 用户", value=len(db_state["premium_users"]))
        await ctx.send(embed=embed)

# ==========================================
# 5. Cog: 付费与订阅模块
# ==========================================
class BillingCog(commands.Cog, name="付费系统"):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="pay")
    async def pay_info(self, ctx):
        """获取订阅链接"""
        if not db_state["modules"]["billing_system"]:
            return await ctx.send("❌ 付费系统当前已关闭。")
            
        embed = discord.Embed(title="🚀 升级 Premium 会员", color=discord.Color.gold())
        embed.description = "解锁更快的响应速度和专属功能！"
        embed.add_field(name="月费", value=f"${db_state['prices']['monthly']}", inline=True)
        embed.add_field(name="年费", value=f"${db_state['prices']['yearly']}", inline=True)
        
        # 指向网页管理端的模拟支付页面
        pay_url = f"http://localhost:5000/checkout?uid={ctx.author.id}"
        await ctx.send(embed=embed, content=f"点击链接订阅: {pay_url}")

# ==========================================
# 6. Quart Web 管理后台
# ==========================================
app = Quart(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>Bot 管理后台</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white p-8">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">🐾 {{ profile.nickname }} 终端控制台</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 机器人资料调节 -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl mb-4 font-semibold text-blue-400">机器人资料</h2>
                <form action="/save_profile" method="POST">
                    <label class="block mb-2">状态文字:</label>
                    <input type="text" name="activity" value="{{ profile.activity }}" class="w-full p-2 mb-4 bg-gray-700 rounded border-none">
                    
                    <label class="block mb-2">在线状态:</label>
                    <select name="status" class="w-full p-2 mb-4 bg-gray-700 rounded border-none">
                        <option value="online" {% if profile.status == 'online' %}selected{% endif %}>在线</option>
                        <option value="idle" {% if profile.status == 'idle' %}selected{% endif %}>闲置</option>
                        <option value="dnd" {% if profile.status == 'dnd' %}selected{% endif %}>请勿打扰</option>
                    </select>
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded">更新资料</button>
                </form>
            </div>

            <!-- 功能开关 -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl mb-4 font-semibold text-green-400">功能开关</h2>
                <form action="/toggle_module" method="POST" class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span>AI 对话功能</span>
                        <input type="checkbox" name="ai_chat" {% if modules.ai_chat %}checked{% endif %} onchange="this.form.submit()">
                    </div>
                    <div class="flex justify-between items-center">
                        <span>管理工具 (!ping 等)</span>
                        <input type="checkbox" name="admin_tools" {% if modules.admin_tools %}checked{% endif %} onchange="this.form.submit()">
                    </div>
                    <div class="flex justify-between items-center">
                        <span>付费/订阅系统</span>
                        <input type="checkbox" name="billing_system" {% if modules.billing_system %}checked{% endif %} onchange="this.form.submit()">
                    </div>
                </form>
            </div>
        </div>

        <!-- 日志窗口 -->
        <div class="mt-8 bg-black p-4 rounded-lg font-mono text-sm border border-gray-700 h-48 overflow-y-auto">
            <h3 class="text-gray-500 mb-2">系统日志:</h3>
            {% for log in logs %}
            <div class="mb-1"><span class="text-green-500">>>></span> {{ log }}</div>
            {% endfor %}
        </div>
    </div>
</body>
</html>
"""

@app.route("/")
async def index():
    return await render_template_string(
        HTML_TEMPLATE, 
        profile=db_state["bot_profile"], 
        modules=db_state["modules"],
        logs=db_state["system_logs"]
    )

@app.route("/save_profile", methods=["POST"])
async def save_profile():
    form = await request.form
    db_state["bot_profile"]["activity"] = form.get("activity")
    db_state["bot_profile"]["status"] = form.get("status")
    await bot_instance.sync_settings()
    return redirect("/")

@app.route("/toggle_module", methods=["POST"])
async def toggle_module():
    form = await request.form
    # 更新开关状态
    db_state["modules"]["ai_chat"] = "ai_chat" in form
    db_state["modules"]["admin_tools"] = "admin_tools" in form
    db_state["modules"]["billing_system"] = "billing_system" in form
    add_log(f"模块状态更新: {db_state['modules']}")
    return redirect("/")

@app.route("/checkout")
async def checkout():
    uid = request.args.get("uid")
    if uid:
        db_state["premium_users"][str(uid)] = "Permanent"
        add_log(f"用户 {uid} 成功支付并升级 Premium")
        return "<h1>支付成功！</h1><p>您已获得会员身份，请返回 Discord 使用。</p>"
    return "无效的请求"

# ==========================================
# 7. 启动程序
# ==========================================
bot_instance = TuanTuanBot()

async def run_services():
    # 同时启动 Bot 和 Web 服务器
    port = int(os.environ.get("PORT", 5000))
    
    # 封装 Bot 启动任务
    bot_task = asyncio.create_task(bot_instance.start(TOKEN))
    # 封装 Web 启动任务
    web_task = asyncio.create_task(app.run_task(host="0.0.0.0", port=port))
    
    await asyncio.gather(bot_task, web_task)

if __name__ == "__main__":
    try:
        asyncio.run(run_services())
    except KeyboardInterrupt:
        pass
