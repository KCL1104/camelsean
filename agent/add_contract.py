import sys
import json
import os

# Setup Django-like path resolution
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tools.monitoring_tools import add_contract_tracking_target

def main():
    if len(sys.argv) < 2:
        print("Usage: python add_contract.py <contract_address>")
        sys.exit(1)

    contract_address = sys.argv[1]

    # Use default values for ABI filename (will trigger auto-fetch), events, actions
    abi_filename = f"abi_{contract_address.lower()}.json"
    events_to_track = ["Transfer", "Approval"]  # Default common events
    actions = ["log_event", "check_value"]

    result = add_contract_tracking_target(
        contract_address=contract_address,
        abi_filename=abi_filename,
        events_to_track=events_to_track,
        actions=actions
    )
    print(result)

if __name__ == "__main__":
    main()