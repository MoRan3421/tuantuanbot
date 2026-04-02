import discord
from discord import app_commands
from discord.ext import commands
import random
import datetime

# 注意：为了简单起见，这里使用字典存储。
# 在 Render 上，如果机器人重启，数据会重置。
# 如果需要持久化，建议后续接入我提到的数据库功能。
user_data = {}

class EconomyCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    eco_group = app_commands.Group(name="eco", description="团团金币系统")

    @eco_group.command(name="daily", description="📅 每日签到领金币")
    async def daily(self, interaction: discord.Interaction):
        user_id = str(interaction.user.id)
        today = str(datetime.date.today())
        
        if user_id not in user_data:
            user_data[user_id] = {"balance": 0, "last_daily": ""}
        
        if user_data[user_id]["last_daily"] == today:
            await interaction.response.send_message("❌ 你今天已经领过金币啦，明天再来吧！", ephemeral=True)
            return
        
        reward = random.randint(50, 200)
        user_data[user_id]["balance"] += reward
        user_data[user_id]["last_daily"] = today
        
        embed = discord.Embed(title="✨ 签到成功", color=0xFFD700)
        embed.description = f"恭喜 {interaction.user.mention} 获得 **{reward}** 枚金币！\n当前余额: 💰 `{user_data[user_id]['balance']}`"
        await interaction.response.send_message(embed=embed)

    @eco_group.command(name="balance", description="💰 查询我的金币余额")
    async def balance(self, interaction: discord.Interaction, member: discord.Member = None):
        target = member or interaction.user
        user_id = str(target.id)
        bal = user_data.get(user_id, {}).get("balance", 0)
        
        await interaction.response.send_message(f"💵 {target.display_name} 的钱包里有 **{bal}** 枚金币。")

    @eco_group.command(name="work", description="⚒️ 努力打工赚金币")
    @app_commands.checks.cooldown(1, 3600, key=lambda i: (i.user.id)) # 1小时冷却
    async def work(self, interaction: discord.Interaction):
        user_id = str(interaction.user.id)
        if user_id not in user_data:
            user_data[user_id] = {"balance": 0, "last_daily": ""}
            
        jobs = ["搬砖", "写代码", "送外卖", "修电脑", "当服务员"]
        earnings = random.randint(20, 100)
        user_data[user_id]["balance"] += earnings
        
        await interaction.response.send_message(f"👷 你去执行了 **{random.choice(jobs)}**，获得了 **{earnings}** 枚金币！")

    @work.error
    async def work_error(self, interaction: discord.Interaction, error: app_commands.AppCommandError):
        if isinstance(error, app_commands.CommandOnCooldown):
            await interaction.response.send_message(f"⏳ 太累了，请休息一下。剩余冷却时间: {int(error.retry_after/60)} 分钟", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(EconomyCog(bot))
