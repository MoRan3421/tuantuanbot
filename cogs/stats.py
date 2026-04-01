import discord
from discord.ext import commands, tasks
import aiosqlite
import datetime

class StatsCog(commands.Cog):
    """
    负责服务器数据统计和持久化存储
    """
    def __init__(self, bot):
        self.bot = bot
        self.db_path = "bot_stats.db"
        self.update_stats.start()

    def cog_unload(self):
        self.update_stats.cancel()

    async def init_db(self):
        """初始化数据库"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                CREATE TABLE IF NOT EXISTS msg_stats (
                    date TEXT PRIMARY KEY,
                    count INTEGER DEFAULT 0
                )
            ''')
            await db.commit()

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.bot:
            return
            
        today = datetime.date.today().isoformat()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                INSERT INTO msg_stats (date, count) VALUES (?, 1)
                ON CONFLICT(date) DO UPDATE SET count = count + 1
            ''', (today,))
            await db.commit()

    @tasks.loop(minutes=30)
    async def update_stats(self):
        """定期执行的任务，例如清理过期数据"""
        print(f"[{datetime.datetime.now()}] 统计数据同步中...")

    @commands.command(name="server_info")
    async def server_info(self, ctx):
        """获取服务器详细信息"""
        guild = ctx.guild
        embed = discord.Embed(title=f"📊 {guild.name} 统计", color=discord.Color.blue())
        embed.add_field(name="总成员", value=guild.member_count)
        embed.add_field(name="频道数量", value=len(guild.channels))
        embed.set_footer(text=f"ID: {guild.id}")
        await ctx.send(embed=embed)

async def setup(bot):
    cog = StatsCog(bot)
    await cog.init_db()
    await bot.add_cog(cog)
