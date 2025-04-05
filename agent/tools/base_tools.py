# tools/base_tools.py
import requests
import json
from langchain.tools import tool
from agent.config import BASESCAN_API_KEY  # Import key from config

BASESCAN_API_URL = "https://api.basescan.org/api"

@tool
def get_base_native_balance(address: str) -> str:
    """Gets native ETH balance for an address ON BASE NETWORK via Basescan."""
    if not BASESCAN_API_KEY:
        return "Error: Basescan API key not configured."
    # ... (rest of the tool implementation) ...
