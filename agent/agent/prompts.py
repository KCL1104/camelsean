# agent/prompts.py
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def get_agent_prompt(available_tool_names: list[str]) -> ChatPromptTemplate:
    # Dynamically build parts of the prompt based on available tools
    capabilities = ["- Checking native ETH balances for addresses on the Base network using Basescan."]
    if "get_latest_tweets_from_user" in available_tool_names:
        capabilities.append("- Getting recent tweets from specific X users.")
    # Add other capabilities based on tools...

    system_message = f"""You are a helpful assistant. Your capabilities include:
    {' '.join(capabilities)}
    Use your tools ONLY for the network/service specified (Base network for blockchain queries). Be precise."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    return prompt
