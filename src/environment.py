from mesa import Model
# from mesa.space import MultiGrid # Removing 2D grid
from src.agents import Cell, NanoBot
from src.config import GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH, CELL_COUNT, INITIAL_CANCER_PCT, NANO_BOT_COUNT
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
