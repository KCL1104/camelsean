import json
import os
from typing import List, Dict, Optional

CONTRACTS_FILE = os.path.join(os.path.dirname(__file__), "contracts.json")

def load_contracts() -> Dict[str, dict]:
    if not os.path.exists(CONTRACTS_FILE):
        return {}
    with open(CONTRACTS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def save_contracts(contracts: Dict[str, dict]) -> None:
    with open(CONTRACTS_FILE, "w") as f:
        json.dump(contracts, f, indent=2)

def add_or_update_contract(
    contract_address: str,
    abi_path: str,
    events_to_track: List[str],
    actions: List[str],
    client_id: str,
    extra_info: Optional[dict] = None
) -> str:
    contract_address = contract_address.lower()
    contracts = load_contracts()
    contracts[contract_address] = {
        "abi_path": abi_path,
        "tracked_events": events_to_track,
        "actions": actions,
        "client_id": client_id,
        "extra_info": extra_info or {}
    }
    save_contracts(contracts)
    return f"Contract {contract_address} added/updated for client {client_id}."

def remove_contract(contract_address: str) -> str:
    contract_address = contract_address.lower()
    contracts = load_contracts()
    if contract_address in contracts:
        del contracts[contract_address]
        save_contracts(contracts)
        return f"Contract {contract_address} removed."
    else:
        return f"Contract {contract_address} not found."

def list_contracts(client_id: Optional[str] = None) -> List[dict]:
    contracts = load_contracts()
    result = []
    for addr, data in contracts.items():
        if client_id is None or data.get("client_id") == client_id:
            entry = {"address": addr}
            entry.update(data)
            result.append(entry)
    return result

def get_contract(contract_address: str) -> Optional[dict]:
    contract_address = contract_address.lower()
    contracts = load_contracts()
    return contracts.get(contract_address)