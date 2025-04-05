# main.py
from agent.tools.base_tools import get_base_native_balance
from agent.tools.x_tools import get_latest_tweets_from_user  # Import only if used
# from agent.tools.coinbase_tools import ... # Import only if used
from agent.agent.setup import create_agent_executor
from agent.config import BASESCAN_API_KEY, x_client  # Check if keys/clients are available
import threading

from agent.tools.monitoring_tools import (
    add_contract_tracking_target,
    list_tracked_targets,
    get_recent_tracked_events
)
from agent.background_listener import run_listener  # Import the listener function
from agent.config import BASE_WSS_URL

def run():
    print("Initializing agent and listener...")
    listener_thread = None
    active_tools = []
    
    if BASE_WSS_URL:
        print("Base WSS URL found. Adding monitoring control tools...")
        active_tools.append(add_contract_tracking_target)
        active_tools.append(list_tracked_targets)
        active_tools.append(get_recent_tracked_events)
        # --- Start Background Listener (Simple Threading Example) ---
        print("Starting background listener thread...")
        listener_thread = threading.Thread(target=run_listener, daemon=True) # daemon=True allows main to exit
        listener_thread.start()
        print("Listener thread started.")
        # --- NOTE: Robust apps use multiprocessing or task queues ---
    else:
        print("Warning: BASE_WSS_URL not found. Monitoring tools/listener disabled.")
    
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

    print("\n--- Base Monitoring Agent Ready ---")
    print("Use tools to add/list tracking targets or view recent events.")
    print("Type 'quit' to exit.")
    while True:
        try:
            user_input = input("You: ")
            if user_input.lower() == 'quit':
                break
            if not user_input:
                continue

            response = agent_executor.invoke({"input": user_input})
            print("Agent:", response.get('output'))
            
            if listener_thread and listener_thread.is_alive():
                print("Stopping listener thread (may take time)...")
                # Add proper shutdown signal mechanism to listener if needed
                # Example: listener_thread.join() or signal mechanism
                
        except Exception as e:
            print(f"An error occurred during interaction: {e}")
            # Optionally break or continue loop on error

if __name__ == "__main__":
    run()

