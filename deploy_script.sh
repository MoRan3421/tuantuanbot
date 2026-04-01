#!/bin/bash

echo "🍡 开始部署 团团 (TuanTuan) 全环境..."

# 1. 检查 Python
if ! command -v python3 &> /dev/null
then
    echo "❌ 错误: 未找到 Python3，请先安装。"
    exit
fi

# 2. 安装依赖
echo "📦 正在安装核心依赖库..."
pip install discord.py flask requests google-generativeai python-dotenv

# 3. 生成本地环境配置文件
if [ ! -f .env ]; then
    echo "📝 正在创建 .env 配置文件模板..."
    echo "DISCORD_TOKEN=your_token_here" >> .env
    echo "GEMINI_API_KEY=your_gemini_key_here" >> .env
    echo "WEB_PORT=8080" >> .env
fi

# 4. 权限设置
chmod +x main.py

echo "✅ 部署完成！"
echo "👉 请在 .env 中填入你的 API Key，然后运行: python3 main.py"
