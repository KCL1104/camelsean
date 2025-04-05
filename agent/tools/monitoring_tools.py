# tools/monitoring_tools.py
import json
import os
from agent.tools.utils import fetch_and_save_abi
from agent.config import BASESCAN_API_KEY
from langchain.tools import tool

# --- In-memory simulation - NEEDS PROPER IPC FOR SEPARATE PROCESSES ---
from agent.background_listener import TRACKING_TARGETS, RECENT_EVENTS_LOG, ABI_DIR

@tool
def add_contract_tracking_target(
    contract_address: str,
    abi_filename: str,
    events_to_track: list[str],
    actions: list[str] = ["log_event"]
) -> str:
    """
    Adds or updates a contract configuration for the background event listener.
    Args:
        contract_address (str): The Base network contract address ('0x...').
        abi_filename (str): The filename of the ABI JSON file located in the ABI directory (e.g., 'MyToken.json').
        events_to_track (list[str]): A list of exact event names from the ABI to monitor (e.g., ['Transfer', 'Approval']).
        actions (list[str]): A list of action identifiers to trigger (e.g., ['log_event', 'check_value']). Defaults to ['log_event'].
    Returns a success or error message. The listener needs a restart or dynamic update mechanism to apply changes.
    """
    address_lower = contract_address.lower()
    if not contract_address or not contract_address.startswith("0x") or len(contract_address) != 42:
        return f"Error: Invalid contract address format: {contract_address}."
    if not abi_filename or not abi_filename.endswith(".json"):
        return "Error: abi_filename must be a valid JSON filename (e.g., 'Contract.json')."
    if not events_to_track:
        return "Error: You must specify at least one event name in events_to_track."

    abi_path = os.path.join(ABI_DIR, abi_filename)
    if not os.path.exists(abi_path):
        try:
            print(f"ABI file not found at {abi_path}. Attempting to fetch from Basescan...")
            fetched_path = fetch_and_save_abi(contract_address, BASESCAN_API_KEY, ABI_DIR)
            abi_path = fetched_path
            print(f"Successfully fetched and saved ABI to {abi_path}")
        except Exception as e:
            return f"Error: ABI file not found and failed to fetch from Basescan: {e}"

    # Check if actions are valid (simple check against known keys)
    from background_listener import ACTION_DISPATCHER # Needs access to action keys
    valid_actions = list(ACTION_DISPATCHER.keys())
    invalid_actions = [a for a in actions if a not in valid_actions]
    if invalid_actions:
        return f"Error: Invalid action(s) specified: {invalid_actions}. Valid actions are: {valid_actions}"


    # --- SIMULATED UPDATE ---
    # In production: Send message via IPC to listener process
    print(f"[Tool Simulation] Updating tracking target: {address_lower}")
    TRACKING_TARGETS[address_lower] = {
        "abi_path": abi_path,
        "tracked_events": events_to_track,
        "actions": actions
    }
    # --- END SIMULATION ---

    return f"Success: Added/Updated tracking for contract {contract_address} targeting events {events_to_track} with actions {actions}. Listener restart/update may be needed."


@tool
def list_tracked_targets() -> str:
    """
    Lists the contracts currently configured for tracking by the background listener.
    Returns a JSON string representation of the tracked targets or a message if none are tracked.
    """
     # --- SIMULATED READ ---
    print("[Tool Simulation] Reading tracking targets")
    if not TRACKING_TARGETS:
        return "No contracts are currently configured for tracking."
    # Make it JSON serializable (convert complex objects if any)
    serializable_targets = json.dumps(TRACKING_TARGETS, indent=2)
     # --- END SIMULATION ---
    return serializable_targets

@tool
def get_recent_tracked_events(count: int = 10) -> str:
    """
    Retrieves the most recent events detected and logged by the background listener.
    Args:
        count (int): The maximum number of recent events to retrieve (default 10).
    Returns a list of log strings or a message if no events have been logged recently.
    """
    # --- SIMULATED READ ---
    print(f"[Tool Simulation] Reading last {count} logged events")
    if not RECENT_EVENTS_LOG:
        return "No events detected recently by the listener."
    # Get the last 'count' items
    start_index = max(0, len(RECENT_EVENTS_LOG) - count)
    recent_logs = RECENT_EVENTS_LOG[start_index:]
     # --- END SIMULATION ---
    # Return as newline-separated string for readability, or JSON
    return "\n".join(recent_logs) if recent_logs else "No events found in log."

