#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- 正在开始构建团团机器人喵 ---"

# 1. 升级 pip
pip install --upgrade pip

# 2. 安装依赖库
pip install -r requirements.txt

#启动机器人
python main.py
