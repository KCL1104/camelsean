# agent/prompts.py
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def get_agent_prompt(available_tool_names: list[str]) -> ChatPromptTemplate:
    # Dynamically build parts of the prompt based on available tools
    capabilities = ["- Checking native ETH balances for addresses on the Base network using Basescan."]
    if "get_latest_tweets_from_user" in available_tool_names:
        capabilities.append("- Getting recent tweets from specific X users.")
        # Inside get_agent_prompt function...
    if "add_contract_tracking_target" in available_tool_names:
         capabilities.append("- Configure monitoring for specific events on Base network contracts (requires contract address, ABI filename, event names).")
    if "list_tracked_targets" in available_tool_names:
         capabilities.append("- List contracts currently being monitored by the background listener.")
    if "get_recent_tracked_events" in available_tool_names:
         capabilities.append("- Show recent events detected by the background listener.")

    # Adjust system message wording...
    system_message = f"""You are an assistant that configures and queries a background service monitoring Base network contracts..."""

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
