import discord
from discord import app_commands
from discord.ext import commands
import random

class SocialCog(commands.Cog):
    """
    团团的【贴贴模式】
    专门处理成员之间的情感互动、可爱动作等。
    """
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    social_group = app_commands.Group(name="social", description="团团的软萌互动指令")

    @social_group.command(name="hug", description="🧸 抱抱对方")
    async def hug(self, interaction: discord.Interaction, target: discord.Member):
        if target == interaction.user:
            return await interaction.response.send_message("团团抱抱你！(づ｡◕‿‿◕｡)づ")
            
        embed = discord.Embed(
            description=f"**{interaction.user.display_name}** 给了 **{target.display_name}** 一个超级大抱抱！",
            color=0xFFC0CB
        )
        embed.set_image(url="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueW94bmZ3Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4Znd4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/lrr93v07vM9iM/giphy.gif")
        await interaction.response.send_message(embed=embed)

    @social_group.command(name="pat", description="✋ 摸摸头")
    async def pat(self, interaction: discord.Interaction, target: discord.Member):
        await interaction.response.send_message(f"₍ᐢ..ᐢ₎⊹ **{interaction.user.display_name}** 摸了摸 **{target.display_name}** 的小脑袋，真乖~")

    @social_group.command(name="feed", description="🍰 喂食对方")
    async def feed(self, interaction: discord.Interaction, target: discord.Member):
        foods = ["草莓蛋糕 🍰", "甜甜圈 🍩", "糯米糍 🍡", "热咖啡 ☕", "小鱼干 🐟"]
        food = random.choice(foods)
        await interaction.response.send_message(f"🍴 **{interaction.user.display_name}** 喂给 **{target.display_name}** 一个 **{food}**！好次吗？")

async def setup(bot: commands.Bot):
    await bot.add_cog(SocialCog(bot))
