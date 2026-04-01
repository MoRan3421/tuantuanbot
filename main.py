import os
import asyncio
import json
import logging
from datetime import datetime
from discord.ext import commands
import discord
from quart import Quart, request, jsonify
from quart_cors import cors

# 日志配置
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TuanBot")

# 全局配置
TOKEN = os.getenv("DISCORD_TOKEN", "")
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
PREFIX = "!"
APP_ID = "tuan-bot-v1"

# 模拟数据库
db_state = {
    "profile": {"nickname": "团团", "activity": "正在测试新版本", "status": "online"},
    "modules": {"ai": True, "billing": True, "fun": True},
    "stats": {"commands_run": 0, "users_served": 0}
}

class TuanTuanBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.all()
        super().__init__(command_prefix=PREFIX, intents=intents)

    async def setup_hook(self):
        # 自动加载 cogs 文件夹下的所有 py 文件
        if not os.path.exists("./cogs"):
            os.makedirs("./cogs")
            
        # 这里模拟加载过程，实际部署请确保文件存在
        # for filename in os.listdir("./cogs"):
        #    if filename.endswith(".py"):
        #        await self.load_extension(f"cogs.{filename[:-3]}")
        
        # 演示用：手动加载内置 Cog (代码见下方文件)
        await self.add_cog(UtilityCog(self))
        logger.info("模块化插件加载完成")

# Quart API 接口 (为 React 前端服务)
app = Quart(__name__)
app = cors(app, allow_origin="*") # 允许 React 跨域访问

@app.route("/api/status", methods=["GET"])
async def get_status():
    return jsonify({
        "bot_name": bot.user.name if bot.user else "离线",
        "latency": f"{round(bot.latency * 1000)}ms",
        "db": db_state
    })

@app.route("/api/update_profile", methods=["POST"])
async def update_profile():
    data = await request.get_json()
    db_state["profile"].update(data)
    # 同步到 Discord
    activity = discord.Game(name=db_state["profile"]["activity"])
    await bot.change_presence(activity=activity)
    return jsonify({"status": "success"})

bot = TuanTuanBot()

async def main():
    # 运行 Quart 和 Discord
    await asyncio.gather(
        bot.start(TOKEN),
        app.run_task(host="0.0.0.0", port=5000)
    )

if __name__ == "__main__":
    asyncio.run(main())

# --- 演示 Cog 结构 (UtilityCog) ---
class UtilityCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def hello(self, ctx):
        db_state["stats"]["commands_run"] += 1
        await ctx.send(f"你好 {ctx.author.name}！我是由 React 后台控制的机器人。")

    @commands.command()
    async def clear(self, ctx, amount: int = 5):
        """清理消息"""
        await ctx.channel.purge(limit=amount)
        await ctx.send(f"已清理 {amount} 条消息", delete_after=3)
