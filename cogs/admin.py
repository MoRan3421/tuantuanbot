import discord
from discord import app_commands
from discord.ext import commands
import datetime

class AdminCog(commands.Cog):
    """
    团团的【管家模式】
    专门处理服务器管理、成员处分、频道清理等严肃事务。
    """
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    # 创建一个指令组 /admin
    admin_group = app_commands.Group(name="admin", description="管理员专属的高级权限指令")

    @admin_group.command(name="kick", description="👞 将不听话的成员踢出服务器")
    @app_commands.checks.has_permissions(kick_members=True)
    @app_commands.describe(member="要踢出的成员", reason="踢出的理由")
    async def kick(self, interaction: discord.Interaction, member: discord.Member, reason: str = "没给团团带好吃的"):
        try:
            await member.kick(reason=reason)
            embed = discord.Embed(
                title="👞 成员已被请离",
                description=f"**{member.name}** 被踢出了服务器。\n**操作员:** {interaction.user.mention}\n**理由:** {reason}",
                color=0xFF0000 # 红色警告
            )
            await interaction.response.send_message(embed=embed)
        except Exception as e:
            await interaction.response.send_message(f"❌ 团团踢不动他：{e}", ephemeral=True)

    @admin_group.command(name="ban", description="🔨 永久封禁某位成员")
    @app_commands.checks.has_permissions(ban_members=True)
    async def ban(self, interaction: discord.Interaction, member: discord.Member, reason: str = "触犯了团团的底线"):
        await member.ban(reason=reason)
        await interaction.response.send_message(f"🔨 啪！**{member.name}** 已经被团团永久封印了！")

    @admin_group.command(name="mute", description="🤐 禁言成员（禁闭室）")
    @app_commands.checks.has_permissions(moderate_members=True)
    @app_commands.describe(minutes="禁言分钟数")
    async def mute(self, interaction: discord.Interaction, member: discord.Member, minutes: int):
        duration = datetime.timedelta(minutes=minutes)
        await member.timeout(duration, reason="禁言处罚")
        await interaction.response.send_message(f"🤐 **{member.mention}** 被团团关进了禁闭室，**{minutes}** 分钟内不许说话哦！")

    @admin_group.command(name="unmute", description="🔓 解除成员的禁言")
    @app_commands.checks.has_permissions(moderate_members=True)
    async def unmute(self, interaction: discord.Interaction, member: discord.Member):
        await member.timeout(None)
        await interaction.response.send_message(f"🔓 团团把 **{member.mention}** 的封条撕掉啦，可以说话了~")

    @admin_group.command(name="clear", description="🧹 批量清理频道消息")
    @app_commands.checks.has_permissions(manage_messages=True)
    async def clear(self, interaction: discord.Interaction, amount: int):
        if amount > 100:
            return await interaction.response.send_message("❌ 团团一次最多只能扫 100 条消息哦！", ephemeral=True)
        
        await interaction.response.defer(ephemeral=True)
        deleted = await interaction.channel.purge(limit=amount)
        await interaction.followup.send(f"🧹 团团挥舞扫帚，清理了 **{len(deleted)}** 条脏消息！")

    @admin_group.command(name="slowmode", description="🐢 开启频道慢速模式")
    @app_commands.checks.has_permissions(manage_channels=True)
    async def slowmode(self, interaction: discord.Interaction, seconds: int):
        await interaction.channel.edit(slowmode_delay=seconds)
        if seconds == 0:
            await interaction.response.send_message("🐇 慢速模式已关闭，大家可以尽情聊天啦！")
        else:
            await interaction.response.send_message(f"🐢 慢速模式已开启，每条消息间隔 **{seconds}** 秒。")

    @admin_group.command(name="nick", description="🏷️ 修改成员在服务器的昵称")
    @app_commands.checks.has_permissions(manage_nicknames=True)
    async def nick(self, interaction: discord.Interaction, member: discord.Member, new_name: str):
        await member.edit(nick=new_name)
        await interaction.response.send_message(f"✨ 团团把 **{member.name}** 的名字改成了 **{new_name}**！")

async def setup(bot: commands.Bot):
    await bot.add_cog(AdminCog(bot))
