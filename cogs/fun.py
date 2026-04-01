import discord
from discord.ext import commands
import random

class FunCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def roll(self, ctx, dice: str = "1d6"):
        """掷骰子，例如 !roll 2d20"""
        try:
            rolls, limit = map(int, dice.split('d'))
            result = ', '.join(str(random.randint(1, limit)) for r in range(rolls))
            await ctx.send(f"🎲 结果: {result}")
        except Exception:
            await ctx.send("格式错误！请使用像 `!roll 2d20` 这样的格式。")

    @commands.command()
    async def coin(self, ctx):
        """抛硬币"""
        res = random.choice(["正面", "反面"])
        await ctx.send(f"🪙 结果是: **{res}**")

async def setup(bot):
    await bot.add_cog(FunCog(bot))
