# config.py
import os
from dotenv import load_dotenv
import tweepy
# from coinbase.rest import RESTClient # If using Coinbase

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
BASESCAN_API_KEY = os.getenv("BASESCAN_API_KEY")
X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN")
COINBASE_API_KEY = os.getenv("COINBASE_API_KEY") # If using
COINBASE_API_SECRET = os.getenv("COINBASE_API_SECRET") # If using

YOUR_SITE_URL = os.getenv("YOUR_SITE_URL", "http://unknown")
YOUR_APP_NAME = os.getenv("YOUR_APP_NAME", "CamelSean")

# Initialize clients (optional - could also be done when tools are loaded)
x_client = None
if X_BEARER_TOKEN:
    try:
        x_client = tweepy.Client(bearer_token=X_BEARER_TOKEN)
        print("X client initialized in config.")
    except Exception as e:
        print(f"Warning: Failed to init X client in config: {e}")

cb_client = None # Initialize Coinbase client if using
