import os
import asyncio
import discord
import google.generativeai as genai
from discord import app_commands
from discord.ext import commands

class AIChat(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.api_key = os.getenv("GEMINI_API_KEY")
        
        # 初始化 Gemini
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash-preview-09-2025",
            system_instruction="你叫'团团'，是 Discord 里的可爱猫娘。说话要带'喵'，性格开朗贴心。"
        )
        # 存储对话上下文 {user_id: chat_session}
        self.sessions = {}

    def get_session(self, user_id):
        if user_id not in self.sessions:
            self.sessions[user_id] = self.model.start_chat(history=[])
        return self.sessions[user_id]

    async def call_gemini(self, user_id, text, use_search=False):
        """调用 AI，支持指数退避重试"""
        for i in range(3): # 最多尝试3次
            try:
                if use_search:
                    # 搜索模式使用一次性生成，不计入上下文
                    search_model = genai.GenerativeModel("gemini-2.5-flash-preview-09-2025")
                    response = await asyncio.to_thread(
                        search_model.generate_content,
                        contents=text,
                        tools=[{"google_search": {}}]
                    )
                else:
                    chat = self.get_session(user_id)
                    response = await asyncio.to_thread(chat.send_message, text)
                
                return response
            except Exception as e:
                await asyncio.sleep(2 ** i)
        return None

    # --- 事件监听：处理普通艾特对话 ---
    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.bot:
            return

        # 判定是否在私聊或被艾特
        is_mentioned = self.bot.user.mentioned_in(message)
        is_dm = isinstance(message.channel, discord.DMChannel)

        if is_mentioned or is_dm:
            clean_content = message.content.replace(f'<@!{self.bot.user.id}>', '').replace(f'<@{self.bot.user.id}>', '').strip()
            
            if not clean_content:
                await message.reply("主人有什么吩咐喵？🐾")
                return

            async with message.channel.typing():
                res = await self.call_gemini(str(message.author.id), clean_content)
                if res:
                    await message.reply(res.text)
                else:
                    await message.reply("呜...团团现在有点头晕，连接不上大脑喵...")

    # --- 斜杠指令：搜索 ---
    @app_commands.command(name="ask", description="向团团提问（可开启实时搜索）")
    @app_commands.describe(query="你想问的问题", search="是否使用谷歌搜索（默认否）")
    async def ask(self, interaction: discord.Interaction, query: str, search: bool = False):
        await interaction.response.defer(thinking=True)
        
        res = await self.call_gemini(str(interaction.user.id), query, use_search=search)
        
        if not res:
            await interaction.followup.send("喵...出错了，请稍后再试。")
            return

        reply_text = res.text
        
        # 处理搜索来源
        source_links = []
        if search and hasattr(res.candidates[0], 'grounding_metadata'):
            metadata = res.candidates[0].grounding_metadata
            if metadata.grounding_attributions:
                for attr in metadata.grounding_attributions:
                    source_links.append(f"• [{attr.web.title}]({attr.web.uri})")
        
        if source_links:
            reply_text += "\n\n**🔍 团团找到的相关线索：**\n" + "\n".join(source_links[:3])
            
        await interaction.followup.send(reply_text)

    # --- 斜杠指令：清除记忆 ---
    @app_commands.command(name="reset", description="让团团忘记之前的聊天记录")
    async def reset(self, interaction: discord.Interaction):
        uid = str(interaction.user.id)
        if uid in self.sessions:
            del self.sessions[uid]
            await interaction.response.send_message("✨ 团团的大脑已经清空了喵！现在我们是第一次见面喵？")
        else:
            await interaction.response.send_message("团团本来就没有记住什么呀喵~")

async def setup(bot):
    await bot.add_cog(AIChat(bot))
