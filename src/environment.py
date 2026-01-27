from mesa import Model
from mesa.space import MultiGrid
from src.agents import Cell, NanoBot
from src.config import GRID_WIDTH, GRID_HEIGHT, CELL_COUNT, INITIAL_CANCER_PCT, NANO_BOT_COUNT
import random

class Bloodstream(Model):
    """
    Bloodstream Simulation Model.
    """
    def __init__(self):
        super().__init__()
        self.grid = MultiGrid(GRID_WIDTH, GRID_HEIGHT, torus=False)
        self.agents_list = [] # Manual scheduler list
        self.running = True
        
        # Create Cells
        for i in range(CELL_COUNT):
            x = random.randrange(self.grid.width)
            y = random.randrange(self.grid.height)
            
            is_cancer = random.random() < INITIAL_CANCER_PCT
            
            while not self.grid.is_cell_empty((x, y)):
                x = random.randrange(self.grid.width)
                y = random.randrange(self.grid.height)

            cell = Cell(i, self, (x, y), is_cancer=is_cancer)
            self.grid.place_agent(cell, (x, y))
            self.agents_list.append(cell)

        # Create NanoBots
        for i in range(NANO_BOT_COUNT):
            bot = NanoBot(CELL_COUNT + i, self)
            x = random.randrange(self.grid.width)
            y = random.randrange(self.grid.height)
            self.grid.place_agent(bot, (x, y))
            self.agents_list.append(bot)

    @property
    def schedule(self):
        # Compatibility hack for visualization if it accesses model.schedule.agents
        class FakeSchedule:
            def __init__(self, agents):
                self.agents = agents
        return FakeSchedule(self.agents_list)

    def step(self):
        random.shuffle(self.agents_list)
        for agent in self.agents_list:
            agent.step()
        
        # Check end condition
        cancer_cells = [a for a in self.agents_list if isinstance(a, Cell) and a.is_cancer and a.damage_level < 1.0]
        if not cancer_cells:
            pass
