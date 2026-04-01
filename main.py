import discord
from discord import app_commands
from discord.ext import commands

class BotCommands(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    # --- 基础斜杠命令示例 ---
    
    @app_commands.command(name="ping", description="检查机器人的延迟")
    async def ping(self, interaction: discord.Interaction):
        latency = round(self.bot.latency * 1000)
        await interaction.response.send_message(f"🏓 砰！延迟是 {latency}ms")

    @app_commands.command(name="hello", description="让团团跟你打个招呼")
    async def hello(self, interaction: discord.Interaction):
        await interaction.response.send_message(f"你好呀 {interaction.user.mention}！我是团团，很高兴见到你！🌸")

    @app_commands.command(name="clear", description="清理频道消息 (需要权限)")
    @app_commands.checks.has_permissions(manage_messages=True)
    async def clear(self, interaction: discord.Interaction, amount: int):
        if amount < 1 or amount > 100:
            await interaction.response.send_message("只能清理 1 到 100 条之间的消息哦！", ephemeral=True)
            return
            
        await interaction.response.defer(ephemeral=True)
        deleted = await interaction.channel.purge(limit=amount)
        await interaction.followup.send(f"🧹 成功清理了 {len(deleted)} 条消息！")

    # 错误处理逻辑
    @clear.error
    async def clear_error(self, interaction: discord.Interaction, error: app_commands.AppCommandError):
        if isinstance(error, app_commands.MissingPermissions):
            await interaction.response.send_message("你没有管理消息的权限，不能用这个命令哦！", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(BotCommands(bot))