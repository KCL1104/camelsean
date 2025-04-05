import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .tools.monitoring_tools import add_contract_tracking_target
from .background_listener import RECENT_EVENTS_LOG

app = FastAPI()

class TrackRequest(BaseModel):
    contract_address: str

@app.post("/add_contract")
def add_contract(req: TrackRequest):
    contract_address = req.contract_address
    abi_filename = f"abi_{contract_address.lower()}.json"
    events_to_track = ["Transfer", "Approval"]
    actions = ["log_event", "check_value"]

    result = add_contract_tracking_target(
        contract_address=contract_address,
        abi_filename=abi_filename,
        events_to_track=events_to_track,
        actions=actions
    )
    if result.startswith("Error"):
        raise HTTPException(status_code=400, detail=result)
    return {"message": result}

@app.get("/get_events")
def get_events():
    return {"events": RECENT_EVENTS_LOG[-100:]}

if __name__ == "__main__":
    uvicorn.run("agent.api_server:app", host="0.0.0.0", port=8000)