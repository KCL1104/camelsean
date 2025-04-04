# main.py
from tools.base_tools import get_base_native_balance
from tools.x_tools import get_latest_tweets_from_user # Import only if used
# from tools.coinbase_tools import ... # Import only if used
from agent.setup import create_agent_executor
from config import BASESCAN_API_KEY, x_client # Check if keys/clients are available

def run():
    active_tools = []
    if BASESCAN_API_KEY:
        active_tools.append(get_base_native_balance)
        # Add other base tools if defined and key available
    if x_client: # Check if client initialized successfully
        active_tools.append(get_latest_tweets_from_user)
        # Add other X tools if defined and client available
    # Add Coinbase tools similarly if client available

    if not active_tools:
        print("Error: No tools could be initialized. Agent cannot run.")
        return

    try:
        agent_executor = create_agent_executor(active_tools)
    except ValueError as e:
         print(f"Error setting up agent: {e}")
         return

    print("\n--- Agent Interaction Loop (type 'quit' to exit) ---")
    while True:
        try:
            user_input = input("You: ")
            if user_input.lower() == 'quit':
                break
            if not user_input:
                continue

            response = agent_executor.invoke({"input": user_input})
            print("Agent:", response.get('output'))

        except Exception as e:
            print(f"An error occurred during interaction: {e}")
            # Optionally break or continue loop on error

if __name__ == "__main__":
    run()

