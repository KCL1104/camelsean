# Token Airdrop Agent

A full-stack platform for managing token airdrops, featuring a Python backend agent, a modern React frontend, and serverless integrations with blockchain and social APIs.

---

## Features

- **Airdrop Management**: Create, track, and manage token airdrops.
- **User Dashboard**: View tokens, airdrops, user info, and activity.
- **Blockchain Integration**: Interact with Ethereum smart contracts.
- **Social Integrations**: Twitter API support.
- **Background Processing**: Python agent for contract monitoring and automation.
- **Modern UI**: Built with React, Vite, Tailwind CSS.
- **API Endpoints**: Auth, event tracking, and more.

---

## Architecture Overview

```
/agent                # Python backend agent
/TokenAirdropAgent    # Frontend + serverless backend
```

### Backend (Python)

- **`agent/`**: Core agent logic, prompts, setup
- **`tools/`**: Contract management, Coinbase, monitoring, utilities
- **`api_server.py`**: API server entry point
- **`background_listener.py`**: Background task processor
- **`add_contract.py`**: Script to add new contracts
- **`requirements.txt`**: Python dependencies

### Frontend (React + Vite)

- **`client/`**: React app with pages, components, hooks, context
- **`pages/`**: Login, Signup, Dashboard, Airdrops, Tokens, Settings
- **`components/`**: UI components, dashboard widgets, layout
- **`shared/`**: Shared TypeScript schemas
- **`server/`**: Serverless functions (Ethereum, Twitter, API routes)
- **`api/`**: Auth and event tracking endpoints
- **Config**: Tailwind, Vite, tsconfig, vercel.json

---

## Setup Instructions

### Prerequisites

- **Node.js** (v16+ recommended)
- **Python 3.8+**
- **npm** or **yarn**

### Frontend

```bash
cd TokenAirdropAgent
npm install
npm run dev
```

- Runs the React app on `http://localhost:3000`

### Backend (Python Agent)

```bash
cd agent
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python api_server.py
```

- Starts the backend API server

---

## Usage

- Access the frontend at `http://localhost:3000`
- Use the dashboard to manage airdrops, tokens, and users
- Backend agent handles contract monitoring and automation

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, TypeScript
- **Backend**: Python (FastAPI or Flask, depending on implementation)
- **Blockchain**: Ethereum
- **Integrations**: Twitter API
- **Build Tools**: Vite, PostCSS
- **Styling**: Tailwind CSS

---

## Folder Structure (Simplified)

```
/agent
  ├── api_server.py
  ├── background_listener.py
  ├── add_contract.py
  ├── requirements.txt
  └── tools/
      ├── contract_manager.py
      ├── coinbase_tools.py
      ├── monitoring_tools.py
      └── utils.py

/TokenAirdropAgent
  ├── client/
  │   ├── src/
  │   │   ├── pages/
  │   │   ├── components/
  │   │   ├── hooks/
  │   │   ├── context/
  │   │   └── lib/
  │   └── index.html
  ├── server/
  ├── api/
  ├── package.json
  ├── tsconfig.json
  ├── tailwind.config.ts
  └── vite.config.ts
```

---

## License

This project is proprietary. All rights reserved.
