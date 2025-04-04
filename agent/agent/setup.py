# agent/setup.py
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from config import OPENROUTER_API_KEY, YOUR_SITE_URL, YOUR_APP_NAME
from .prompts import get_agent_prompt

def create_agent_executor(tools):
    if not OPENROUTER_API_KEY:
        raise ValueError("OpenRouter API Key missing")

    llm = ChatOpenAI(
        model="google/gemini-2.5-pro-exp-03-25:free", # Or your preferred model
        openai_api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        temperature=0.0,
        default_headers={
            "HTTP-Referer": YOUR_SITE_URL,
            "X-Title": YOUR_APP_NAME,
        }
    )

    tool_names = [t.name for t in tools]
    prompt = get_agent_prompt(tool_names)

    agent = create_openai_tools_agent(llm, tools, prompt)
    executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
    )
    print(f"Agent Executor created with tools: {[t.name for t in tools]}")
    return executor
