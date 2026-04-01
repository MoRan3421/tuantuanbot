import requests
import time

class TuanTuanAI:
    """
    团团的 AI 核心 - 接入 Google Gemini 2.5
    支持指数退避错误处理与结构化对话管理
    """
    def __init__(self, api_key=""):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent"
        self.system_instruction = "你是一只名叫'团团'的可爱 Discord 机器人，性格活泼，喜欢用语气词'喵'或'哒'。你需要协助主人管理服务器，并用温柔俏皮的方式回答问题。"

    async def chat(self, user_query, retries=5):
        """
        带有指数退避机制的聊天接口
        """
        payload = {
            "contents": [{"parts": [{"text": user_query}]}],
            "systemInstruction": {"parts": [{"text": self.system_instruction}]}
        }
        
        delay = 1
        for i in range(retries):
            try:
                response = requests.post(f"{self.base_url}?key={self.api_key}", json=payload)
                if response.status_code == 200:
                    result = response.json()
                    return result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', "团团脑袋卡住了，等会儿再问我吧~")
                elif response.status_code == 429:
                    # 触发 429 频率限制时，进行指数退避
                    time.sleep(delay)
                    delay *= 2
                else:
                    return f"呜呜，团团出错了 (Error: {response.status_code})"
            except Exception as e:
                time.sleep(delay)
                delay *= 2
        
        return "主人，团团连接不到大脑了（连接超时）..."

# 示例：
# ai = TuanTuanAI(apiKey)
# response = await ai.chat("今天天气怎么样？")
