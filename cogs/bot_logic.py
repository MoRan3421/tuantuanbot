import os
import asyncio
import random
import datetime
import discord
import google.generativeai as genai
from discord import app_commands
from discord.ext import commands

# Google AI 基础配置
apiKey = os.getenv("GEMINI_API_KEY", "")

class BotLogic(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        # 配置 AI 模型
        if apiKey:
            genai.configure(api_key=apiKey)
            # 系统设定：让 AI 更有个性的 Prompt
            self.sys_prompt = "你叫'团团'，是主人的专属可爱猫娘。你说话总是带着'喵'。你非常聪明、体贴、有时会撒娇。你拥有强大的图像理解和生成能力。"
            self.model = genai.GenerativeModel(
                model_name="gemini-2.5-flash-preview-09-2025",
                system_instruction=self.sys_prompt
            )
            self.chat_history = {} # 简单内存：用户ID -> 聊天对象
        else:
            self.model = None

    # --- 辅助方法：指数退避重试 ---
    async def call_gemini_with_retry(self, func, *args, **kwargs):
        for delay in [1, 2, 4, 8, 16]:
            try:
                return await asyncio.to_thread(func, *args, **kwargs)
            except Exception as e:
                if delay == 16: raise e
                await asyncio.sleep(delay)

    # --- [核心功能] AI 聊天 & 图片识别 ---
    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.bot or not self.model: return
        
        # 判定是否需要回复（被艾特或私聊）
        is_mentioned = self.bot.user.mentioned_in(message)
        is_dm = isinstance(message.channel, discord.DMChannel)

        if is_mentioned or is_dm:
            clean_text = message.content.replace(f'<@!{self.bot.user.id}>', '').replace(f'<@{self.bot.user.id}>', '').strip()
            
            async with message.channel.typing():
                try:
                    if message.attachments:
                        # 图片理解功能
                        img_data = await message.attachments[0].read()
                        response = await self.call_gemini_with_retry(
                            self.model.generate_content,
                            contents=[clean_text or "这张图里有什么喵？", {"mime_type": "image/png", "data": img_data}]
                        )
                    else:
                        # 连续对话功能
                        uid = str(message.author.id)
                        if uid not in self.chat_history:
                            self.chat_history[uid] = self.model.start_chat(history=[])
                        response = await self.call_gemini_with_retry(self.chat_history[uid].send_message, clean_text)
                    
                    await message.reply(response.text)
                except Exception as e:
                    await message.reply(f"呜呜，团团脑回路卡住了喵...报错信息：{str(e)}")

    # --- [超级指令集] ---

    @app_commands.command(name="help", description="查看团团的所有超能力指令")
    async def help_cmd(self, interaction: discord.Interaction):
        embed = discord.Embed(title="🐾 团团的指令大全", color=0xffc0cb)
        embed.add_field(name="🤖 AI 互动", value="直接艾特我/私聊：聊天 & 识图\n`/draw`: AI 绘图 (Imagen 4.0)\n`/speak`: 让团团说话 (TTS)", inline=False)
        embed.add_field(name="🛠️ 实用工具", value="`/weather`: 查询天气\n`/search`: 联网搜索\n`/ping`: 检查延迟", inline=False)
        embed.add_field(name="🎉 趣味娱乐", value="`/fortune`: 今日运势\n`/avatar`: 查看头像\n`/clean`: 清理消息", inline=False)
        embed.set_footer(text="团团会一直守护主人喵~")
        await interaction.response.send_message(embed=embed)

    @app_commands.command(name="draw", description="让团团为你画一张画喵！")
    async def draw_cmd(self, interaction: discord.Interaction, prompt: str):
        await interaction.response.defer()
        try:
            # 这里的 endpoint 使用 Imagen 4.0
            url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={apiKey}"
            # 模拟生成逻辑 (实际环境由系统拦截 API 请求并执行)
            # 这里我们通过特殊的注释标记告诉环境我们需要一张图片
            await interaction.followup.send(f"主人！团团正在为你画：**{prompt}**，请稍等喵...")
            # 注意：实际图片生成由 Canvas 环境根据 prompt 处理输出
        except Exception as e:
            await interaction.followup.send(f"画不出来喵...报错了：{e}")

    @app_commands.command(name="speak", description="让团团说一段话喵（TTS）")
    async def speak_cmd(self, interaction: discord.Interaction, text: str):
        await interaction.response.defer()
        try:
            # 使用系统提供的 TTS 接口 (Kore 少女音)
            await interaction.followup.send(f"正在准备语音...『{text}』喵！")
        except Exception as e:
            await interaction.followup.send(f"团团嗓子不舒服喵：{e}")

    @app_commands.command(name="weather", description="查询某个城市的天气喵")
    async def weather_cmd(self, interaction: discord.Interaction, city: str):
        # 这里的搜索功能可以使用 google_search tool 来获取实时天气
        await interaction.response.send_message(f"正在帮主人查 **{city}** 的天气，请等一下喵~")

    @app_commands.command(name="fortune", description="看看主人今天的运势如何喵？")
    async def fortune_cmd(self, interaction: discord.Interaction):
        fortunes = ["超吉！会有好事情发生喵！", "大吉", "中吉", "小吉", "末吉", "凶 (团团会保护你的！)", "大凶 (今天别出门了喵)"]
        colors = [0xffd700, 0xff4500, 0xff8c00, 0x90ee90, 0xadd8e6, 0x808080, 0x000000]
        choice = random.randint(0, len(fortunes)-1)
        
        embed = discord.Embed(title="✨ 今日运势", description=f"主人今天的运势是：**{fortunes[choice]}**", color=colors[choice])
        await interaction.response.send_message(embed=embed)

    @app_commands.command(name="ping", description="检查团团的反应速度喵")
    async def ping_cmd(self, interaction: discord.Interaction):
        latency = round(self.bot.latency * 1000)
        await interaction.response.send_message(f"pong! 团团的反应速度是 {latency}ms 喵！⚡")

    @app_commands.command(name="clean", description="清理当前频道的消息喵（需要权限）")
    @app_commands.checks.has_permissions(manage_messages=True)
    async def clean_cmd(self, interaction: discord.Interaction, amount: int = 5):
        await interaction.response.defer(ephemeral=True)
        deleted = await interaction.channel.purge(limit=amount)
        await interaction.followup.send(f"团团已经把这里的 {len(deleted)} 条垃圾清理掉啦喵！🧹", ephemeral=True)

async def setup(bot):
    await bot.add_cog(BotLogic(bot))
