import json
import os

class Database:
    """团团的记忆管理系统 (持久化存储)"""
    
    def __init__(self, db_file="tuantuan_memory.json"):
        self.db_file = db_file
        self.data = self._load_data()

    def _load_data(self):
        """从本地文件加载团团的记忆"""
        if os.path.exists(self.db_file):
            with open(self.db_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"guilds": {}, "users": {}, "settings": {}}

    def save(self):
        """将当前的记忆保存到硬盘"""
        with open(self.db_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=4, ensure_ascii=False)

    def set_guild_prefix(self, guild_id, prefix):
        """为特定服务器设置团团的指令前缀"""
        if str(guild_id) not in self.data["guilds"]:
            self.data["guilds"][str(guild_id)] = {}
        self.data["guilds"][str(guild_id)]["prefix"] = prefix
        self.save()

    def get_user_stats(self, user_id):
        """获取用户与团团的互动数据"""
        return self.data["users"].get(str(user_id), {"level": 1, "exp": 0})

# 初始化数据库实例
tuantuan_db = Database()
print("💾 [Database] 团团的记忆模块已加载。")
