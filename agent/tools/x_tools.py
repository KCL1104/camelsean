# tools/x_tools.py
import json
from langchain.tools import tool
from config import x_client # Import the initialized client from config

@tool
def get_latest_tweets_from_user(username: str, count: int = 5) -> str:
    """Gets latest tweets from X user. Requires X client initialized in config."""
    if not x_client:
        return "Error: X client not available."
    # ... (rest of the tool implementation using x_client) ...
