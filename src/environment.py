from mesa import Model
# from mesa.space import MultiGrid # Removing 2D grid
from src.agents import Cell, NanoBot, RechargeStation
from src.config import GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH, CELL_COUNT, INITIAL_CANCER_PCT, NANO_BOT_COUNT
from src.database import DatabaseManager
from src.data_collector import DataCollector
import random

class Bloodstream(Model):
    """
    Bloodstream Simulation Model (3D).
    """
    def __init__(self):
        super().__init__()
        # self.grid = MultiGrid(GRID_WIDTH, GRID_HEIGHT, torus=False) # Removed
        self.space_dims = (GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH)
        self.agents_list = [] # Manual scheduler list
        self.running = True
        
        # Data Collection
        self.db = DatabaseManager()
        self.collector = DataCollector(self.db)
        self.collector.start_collection({
            "cell_count": CELL_COUNT,
            "bot_count": NANO_BOT_COUNT,
            "cancer_pct": INITIAL_CANCER_PCT
        })
        
        # Create Cells
        for i in range(CELL_COUNT):
            x = random.randrange(GRID_WIDTH)
            y = random.randrange(GRID_HEIGHT)
            z = random.randrange(GRID_DEPTH)
            
            is_cancer = random.random() < INITIAL_CANCER_PCT
            
            # Simple overlap check (optional in 3D sparse space)
            pos = (x, y, z)
            
            cell = Cell(i, self, pos, is_cancer=is_cancer)
            self.agents_list.append(cell)

        # Create NanoBots
        for i in range(NANO_BOT_COUNT):
            bot = NanoBot(CELL_COUNT + i, self)
            x = random.randrange(GRID_WIDTH)
            y = random.randrange(GRID_HEIGHT)
            z = random.randrange(GRID_DEPTH)
            bot.pos = (x, y, z)
            self.agents_list.append(bot)

        # Create Recharge Stations (2 Stations at opposite corners)
        station1 = RechargeStation(CELL_COUNT + NANO_BOT_COUNT + 1, self, (10, 10, 10))
        station2 = RechargeStation(CELL_COUNT + NANO_BOT_COUNT + 2, self, (GRID_WIDTH-10, GRID_HEIGHT-10, GRID_DEPTH-10))
        self.agents_list.append(station1)
        self.agents_list.append(station2)

    @property
    def schedule(self):
        class FakeSchedule:
            def __init__(self, agents):
                self.agents = agents
        return FakeSchedule(self.agents_list)

    def step(self):
        random.shuffle(self.agents_list)
        for agent in self.agents_list:
            agent.step()
        
        self.collector.log_step(self)

    def add_cancer(self):
        # Spawn new cancer cell
        idx = len(self.agents_list) + 1
        x = random.randrange(self.space_dims[0])
        y = random.randrange(self.space_dims[1])
        z = random.randrange(self.space_dims[2])
        cell = Cell(idx, self, (x, y, z), is_cancer=True)
        self.agents_list.append(cell)

    def add_bot(self):
        idx = len(self.agents_list) + 1
        x = random.randrange(self.space_dims[0])
        y = random.randrange(self.space_dims[1])
        z = random.randrange(self.space_dims[2])
        bot = NanoBot(idx, self)
        bot.pos = (x, y, z)
        self.agents_list.append(bot)
