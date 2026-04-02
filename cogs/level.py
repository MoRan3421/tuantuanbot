import discord
from discord import app_commands
from discord.ext import commands
import math

class LevelCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.db = bot.db

    def get_level_ref(self, user_id):
        if self.db:
            app_id = "tuantuan-bot"
            return self.db.collection('artifacts').document(app_id).collection('users').document(str(user_id)).collection('data').document('levels')
        return None

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.bot or not message.guild:
            return

        ref = self.get_level_ref(message.author.id)
        if not ref: return

        doc = ref.get()
        data = doc.to_dict() if doc.exists else {"xp": 0, "lv": 1}
        
        # 增加随机经验值
        data["xp"] += random.randint(5, 15)
        
        # 计算升级所需经验：5 * (lv^2) + 50 * lv + 100
        next_lv_xp = 5 * (data["lv"]**2) + 50 * data["lv"] + 100
        
        if data["xp"] >= next_lv_xp:
            data["lv"] += 1
            data["xp"] = 0
            # 这里可以选择发送升级通知
            # await message.channel.send(f"🎊 恭喜 {message.author.mention} 升级到 **Lv.{data['lv']}**！")
            
        ref.set(data)

    @app_commands.command(name="rank", description="📊 查看我的等级信息")
    async def rank(self, interaction: discord.Interaction, user: discord.Member = None):
        target = user or interaction.user
        ref = self.get_level_ref(target.id)
        
        data = {"xp": 0, "lv": 1}
        if ref:
            doc = ref.get()
            if doc.exists: data = doc.to_dict()
            
        next_lv_xp = 5 * (data["lv"]**2) + 50 * data["lv"] + 100
        progress = int((data["xp"] / next_lv_xp) * 10)
        bar = "🟩" * progress + "⬜" * (10 - progress)

        embed = discord.Embed(title=f"📊 {target.display_name} 的成长档案", color=0x3498DB)
        embed.add_field(name="等级", value=f"🆙 `Lv.{data['lv']}`", inline=True)
        embed.add_field(name="经验", value=f"✨ `{data['xp']}/{next_lv_xp}`", inline=True)
        embed.add_field(name="进度", value=f"{bar} ({int(data['xp']/next_lv_xp*100)}%)", inline=False)
        
        await interaction.response.send_message(embed=embed)

async def setup(bot):
    await bot.add_cog(LevelCog(bot))
