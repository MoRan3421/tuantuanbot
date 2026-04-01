import discord
from discord.ext import commands
import time

class AdminCog(commands.Cog):
    """
    管理类插件：负责服务器维护、状态检查和消息清理。
    """
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="ping")
    async def ping(self, ctx):
        """检查机器人延迟"""
        start_time = time.time()
        message = await ctx.send("正在测试延迟...")
        end_time = time.time()
        
        api_latency = round(self.bot.latency * 1000)
        round_trip = round((end_time - start_time) * 1000)
        
        embed = discord.Embed(title="🏓 Pong!", color=0x2ecc71)
        embed.add_field(name="API 延迟", value=f"{api_latency}ms")
        embed.add_field(name="消息往返", value=f"{round_trip}ms")
        await message.edit(content=None, embed=embed)

    @commands.command(name="kick")
    @commands.has_permissions(kick_members=True)
    async def kick(self, ctx, member: discord.Member, *, reason=None):
        """踢出成员 (需要权限)"""
        await member.kick(reason=reason)
        await ctx.send(f"✅ 已踢出 {member.name}，原因: {reason}")

    @commands.command(name="info")
    async def info(self, ctx):
        """显示服务器基本信息"""
        guild = ctx.guild
        embed = discord.Embed(title=f"{guild.name} 服务器信息", color=0x3498db)
        embed.set_thumbnail(url=guild.icon.url if guild.icon else None)
        embed.add_field(name="成员总数", value=guild.member_count)
        embed.add_field(name="创建时间", value=guild.created_at.strftime("%Y-%m-%d"))
        await ctx.send(embed=embed)

    @commands.Cog.listener()
    async def on_command_error(self, ctx, error):
        """错误处理句柄"""
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("❌ 你没有权限执行此操作！")
        elif isinstance(error, commands.MemberNotFound):
            await ctx.send("❌ 找不到该成员。")

async def setup(bot):
    await bot.add_cog(AdminCog(bot))
