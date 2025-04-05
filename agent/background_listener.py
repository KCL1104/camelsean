# background_listener.py
import asyncio
import json
import os
import time
from web3 import Web3
from web3.exceptions import ContractLogicError # To catch reverts cleanly
from agent.config import BASE_WSS_URL, ABI_DIR
from agent.tools import contract_manager

def load_tracking_targets_from_storage():
    global TRACKING_TARGETS
    contracts = contract_manager.load_contracts()
    TRACKING_TARGETS.clear()
    for addr, data in contracts.items():
        TRACKING_TARGETS[addr] = {
            "abi_path": data.get("abi_path"),
            "tracked_events": data.get("tracked_events", []),
            "actions": data.get("actions", []),
            "client_id": data.get("client_id"),
            "extra_info": data.get("extra_info", {})
        }
    print(f"Loaded {len(TRACKING_TARGETS)} contract(s) from persistent storage.")

# --- Configuration (Managed via agent tools later) ---
# In-memory storage for simplicity. Use DB/file for persistence.
TRACKING_TARGETS = {
    # "contract_address_lowercase": {
    #     "abi_path": "path/to/abi.json",
    #     "tracked_events": ["EventName1", "EventName2"], # Events to monitor
    #     "tracked_functions": ["functionName1"], # Less reliable via logs, events are better
    #     "actions": ["log_event", "check_value"] # Simple action identifiers
    # }
}
RECENT_EVENTS_LOG = [] # Store recent detected events for agent queries
RECENT_EVENTS_FILE = os.path.join(os.path.dirname(__file__), "recent_events.json")

async def persist_recent_events_periodically(interval_seconds=5):
    while True:
        try:
            with open(RECENT_EVENTS_FILE, "w") as f:
                json.dump(RECENT_EVENTS_LOG[-100:], f, indent=2)
        except Exception as e:
            print(f"Error persisting recent events: {e}")
        await asyncio.sleep(interval_seconds)
MAX_LOG_SIZE = 100

# --- Action Functions ---
# Define simple functions the listener can trigger
def log_event_action(event_data):
    client_info = f" (Client: {event_data.get('client_id')})" if event_data.get('client_id') else ""
    log_entry = f"{time.strftime('%Y-%m-%d %H:%M:%S')} DETECTED: {event_data['event']} on {event_data['address']} - Args: {event_data['args']} (Tx: {event_data['transactionHash']}){client_info}"
    print(log_entry)
    RECENT_EVENTS_LOG.append(log_entry)
    if len(RECENT_EVENTS_LOG) > MAX_LOG_SIZE:
        RECENT_EVENTS_LOG.pop(0) # Keep log size manageable

def check_value_action(event_data):
    # Example: Check value in a 'Transfer' event (adjust args based on actual event)
    if event_data['event'] == 'Transfer' and 'value' in event_data['args']:
        try:
            # Assuming standard ERC20 Transfer event: Transfer(address indexed from, address indexed to, uint256 value)
            value = event_data['args']['value']
            # Note: Need contract decimals to interpret value correctly! Add to TRACKING_TARGETS if needed.
            print(f"  CHECK_VALUE: Transfer on {event_data['address']} involved value: {value}")
            # Add more logic: if value > threshold... send notification, etc.
        except Exception as e:
            print(f"  CHECK_VALUE: Error processing value: {e}")

ACTION_DISPATCHER = {
    "log_event": log_event_action,
    "check_value": check_value_action,
    # Add more complex actions here
}


# --- Core Listener Logic ---
async def listen_for_events():
    # Start background task to persist recent events
    asyncio.create_task(persist_recent_events_periodically())
    load_tracking_targets_from_storage()
    if not BASE_WSS_URL:
        print("Listener Error: Base WSS URL not configured.")
        return

    print(f"Connecting to Base network via WebSocket: {BASE_WSS_URL[:30]}...")
    w3 = Web3(Web3.LegacyWebSocketProvider(BASE_WSS_URL))
    if not w3.is_connected():
        print("Listener Error: Failed to connect to WebSocket.")
        return
    print("Connected to WebSocket.")

    # Prepare contracts and filters (can be updated dynamically via tools)
    active_contracts = {}
    all_target_addresses = list(TRACKING_TARGETS.keys())

    if not all_target_addresses:
         print("Listener Info: No contracts configured for tracking yet.")
         # Keep listening for config updates? Or exit? For now, just wait.
         while True: await asyncio.sleep(60)


    print(f"Loading ABIs for: {all_target_addresses}")
    for addr, config in TRACKING_TARGETS.items():
        try:
            full_abi_path = config.get("abi_path")
            if not full_abi_path or not os.path.exists(full_abi_path):
                 print(f"Warning: ABI file not found for {addr} at {full_abi_path}. Skipping contract.")
                 continue
            with open(full_abi_path, 'r') as f:
                abi = json.load(f)
            contract = w3.eth.contract(address=Web3.to_checksum_address(addr), abi=abi)
            active_contracts[addr] = {"contract": contract, "config": config}
            print(f"  - Loaded ABI for {addr}")
        except Exception as e:
            print(f"Listener Error: Failed to load ABI or create contract for {addr}: {e}")


    # --- Create Event Filter ---
    # Subscribe to logs for all configured addresses
    # Note: Filtering by specific event topics here is more efficient if possible
    print(f"Subscribing to logs for addresses: {list(active_contracts.keys())}")
    try:
        event_filter = await w3.eth.subscribe('logs', {
            'address': [Web3.to_checksum_address(a) for a in active_contracts.keys()]
        })
    except Exception as e:
         print(f"Listener Error: Failed to subscribe to logs: {e}")
         return


    print("Listener started. Waiting for events...")
    while True:
        try:
            async for event in event_filter:
                await handle_event(event, active_contracts, w3) # Pass w3 for decoding help
                # Add a small sleep to prevent blocking event loop if handling is too fast
                await asyncio.sleep(0.1)
        except Exception as e:
            print(f"Listener Error in main loop: {e}. Reconnecting attempt needed...")
            # Implement reconnect logic here (e.g., recreate subscription)
            await asyncio.sleep(10) # Wait before retrying


async def handle_event(raw_log, active_contracts, w3):
    """Decodes and processes a single log event."""
    event_address_lower = raw_log.address.lower()

    if event_address_lower not in active_contracts:
        return # Should not happen if filter is correct, but good check

    contract_info = active_contracts[event_address_lower]
    contract_obj = contract_info["contract"]
    config = contract_info["config"]

    try:
        # Attempt to decode the log using the contract's ABI
        # Note: contract_obj.events is a list/iterable of event types defined in ABI
        # Need to find the matching event type based on log topics
        matched_event_types = [e for e in contract_obj.events if hasattr(e, 'abi') and e.abi.get('name') in config.get('tracked_events', [])]

        decoded_event = None
        for event_type in matched_event_types:
            try:
                 # process_log decodes based on topics and data
                 event_data = event_type().process_log(raw_log)
                 # Success!
                 decoded_event = { # Standardize output
                  'address': event_data.address,
                  'event': event_data.event,
                  'args': dict(event_data.args), # Convert AttributeDict to dict
                  'logIndex': event_data.logIndex,
                  'transactionIndex': event_data.transactionIndex,
                  'transactionHash': event_data.transactionHash.hex(),
                  'blockHash': event_data.blockHash.hex(),
                  'blockNumber': event_data.blockNumber,
                  'client_id': config.get('client_id')
              }
                 break # Found matching decoder
            except (ContractLogicError, ValueError, Exception):
                 # This event type didn't match, try next
                 continue

        if decoded_event:
            print(f"\n--- Event Detected on {event_address_lower} ---")
            # Trigger configured actions
            for action_id in config.get("actions", []):
                action_func = ACTION_DISPATCHER.get(action_id)
                if action_func:
                    try:
                        action_func(decoded_event)
                    except Exception as e:
                        print(f"  ACTION ERROR ({action_id}): {e}")
                else:
                    print(f"  Warning: Unknown action '{action_id}' configured.")

    except Exception as e:
        # Broad exception catch during decoding/handling
        print(f"Listener Error handling event for {event_address_lower} (Tx: {raw_log.transactionHash.hex()}): {e}")


def run_listener():
    # This function is intended to be run separately or in a background thread/process
    try:
        asyncio.run(listen_for_events())
    except KeyboardInterrupt:
        print("\nListener stopped by user.")

# Example of how to run directly (for testing)
# if __name__ == "__main__":
#    run_listener()

