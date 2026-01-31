from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import sys
import os

# Add parent dir to path to import src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.environment import Bloodstream
from src.environment import Bloodstream
from src.agents import Cell, NanoBot, RechargeStation
from src.database import DatabaseManager

db_manager = DatabaseManager()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Simulation State
simulation = None
running = False
SIM_SPEED = 0.1 # Default delay in seconds

def get_sim():
    global simulation
    if simulation is None:
        simulation = Bloodstream()
    return simulation

async def run_simulation():
    global running, simulation, SIM_SPEED
    while True:
        if running and simulation:
            simulation.step()
            await asyncio.sleep(SIM_SPEED) # Control speed
        else:
            await asyncio.sleep(0.5)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_simulation())

@app.get("/status")
def get_status():
    sim = get_sim()
    cells = [a for a in sim.agents_list if isinstance(a, Cell)]
    bots = [a for a in sim.agents_list if isinstance(a, NanoBot)]
    stations = [a for a in sim.agents_list if isinstance(a, RechargeStation)]
    
    healthy = len([c for c in cells if not c.is_cancer])
    cancer = len([c for c in cells if c.is_cancer])
    bots_active = len([b for b in bots if b.state != "IDLE"])
    
    # Serialize Agents for Web Viz (limit to prevent lagging if too many)
    # Project 3D to 2D approximation or send full 3D
    agent_data = []
    
    # Send all bots
    for b in bots:
        agent_data.append({
            "id": b.unique_id,
            "type": "bot",
            "pos": b.pos,
            "state": b.state,
            "battery": b.battery
        })

    # Send stations
    for s in stations:
        agent_data.append({
            "id": s.unique_id,
            "type": "station",
            "pos": s.pos,
            "status": "active"
        })
        
    # Send cells (only cancer or changing ones? sending all might be heavy but ok for local)
    for c in cells:
        status = "healthy"
        if c.is_cancer: status = "cancer"
        elif c.being_repaired: status = "repair"
        
        agent_data.append({
            "id": c.unique_id,
            "type": "cell",
            "pos": c.pos,
            "status": status
        })

    return {
        "running": running,
        "healthy": healthy,
        "cancer": cancer,
        "total_cells": len(cells),
        "active_bots": bots_active,
        "total_bots": len(bots),
        "efficiency": int((bots_active / (len(bots)+1)) * 100) if len(bots) > 0 else 0,
        "agents": agent_data,
        "dims": sim.space_dims
    }

@app.post("/control/start")
def start_sim():
    global running
    get_sim() # Ensure initialized
    running = True
    return {"status": "started"}

@app.post("/control/stop")
def stop_sim():
    global running
    running = False
    return {"status": "stopped"}

@app.post("/control/reset")
def reset_sim():
    global simulation, running
    running = False
    if simulation:
        simulation.collector.stop_collection()
    simulation = Bloodstream()
    return {"status": "reset"}

@app.get("/api/history/runs")
def get_runs():
    return db_manager.get_all_runs()

@app.get("/api/history/runs/{run_id}")
def get_run_details(run_id: int):
    return db_manager.get_run_metrics(run_id)

@app.post("/spawn/cancer")
def spawn_cancer():
    sim = get_sim()
    sim.add_cancer()
    return {"status": "cancer injected"}

@app.post("/spawn/bot")
def spawn_bot():
    sim = get_sim()
    sim.add_bot()
    return {"status": "bot deployed"}

@app.post("/control/config")
def update_config(speed: float):
    global SIM_SPEED
    SIM_SPEED = max(0.01, min(2.0, speed)) # Clamp speed
    return {"status": "updated", "speed": SIM_SPEED}

@app.post("/control/bot/{bot_id}/command")
def packet_command(bot_id: int, command: str):
    sim = get_sim()
    bot = next((a for a in sim.agents_list if isinstance(a, NanoBot) and a.unique_id == bot_id), None)
    
    if not bot:
        return {"status": "error", "message": "Bot not found"}
    
    if command == "RECALL":
        bot.state = "LOW_BATTERY"
        bot.manual_override = True
        return {"status": "success", "message": "Bot recalled to base"}
    
    if command == "RELEASE":
        bot.manual_override = False
        bot.state = "IDLE"
        return {"status": "success", "message": "Bot returned to autonomous mode"}

    return {"status": "error", "message": "Unknown command"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
