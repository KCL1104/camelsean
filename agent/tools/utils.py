import os
import json
import requests

def fetch_and_save_abi(contract_address: str, api_key: str, abi_dir: str) -> str:
    """
    Fetches the verified contract ABI from Basescan and saves it to a file.
    Returns the path to the saved ABI JSON file.
    Raises an exception if fetching fails.
    """
    url = f"https://api.basescan.org/api"
    params = {
        "module": "contract",
        "action": "getabi",
        "address": contract_address,
        "apikey": api_key
    }
    response = requests.get(url, params=params, timeout=10)
    if response.status_code != 200:
        raise RuntimeError(f"Basescan API request failed with status {response.status_code}")
    data = response.json()
    if data.get("status") != "1":
        raise RuntimeError(f"Basescan API error: {data.get('result')}")
    abi_json = json.loads(data["result"])

    # Save ABI to file
    os.makedirs(abi_dir, exist_ok=True)
    filename = f"abi_{contract_address.lower()}.json"
    filepath = os.path.join(abi_dir, filename)
    with open(filepath, "w") as f:
        json.dump(abi_json, f, indent=2)
    return filepath