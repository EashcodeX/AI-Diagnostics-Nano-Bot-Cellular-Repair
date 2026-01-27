from mesa import Model
from mesa.space import MultiGrid
from mesa.time import RandomActivation
from agents import Cell, NanoBot
from config import GRID_WIDTH, GRID_HEIGHT, CELL_COUNT, INITIAL_CANCER_PCT, NANO_BOT_COUNT
import random

class Bloodstream(Model):
    """
    Bloodstream Simulation Model.
    """
    def __init__(self):
        self.grid = MultiGrid(GRID_WIDTH, GRID_HEIGHT, torus=False)
        self.schedule = RandomActivation(self)
        self.running = True
        
        # Create Cells
        for i in range(CELL_COUNT):
            x = random.randrange(self.grid.width)
            y = random.randrange(self.grid.height)
            
            # Determine if cancer
            is_cancer = random.random() < INITIAL_CANCER_PCT
            
            # We need to make sure we don't put multiple cells on top of each other ideally, 
            # but MultiGrid allows it. For viz, spread them out.
            while not self.grid.is_cell_empty((x, y)):
                x = random.randrange(self.grid.width)
                y = random.randrange(self.grid.height)

            cell = Cell(i, self, (x, y), is_cancer=is_cancer)
            self.grid.place_agent(cell, (x, y))
            self.schedule.add(cell)

        # Create NanoBots
        for i in range(NANO_BOT_COUNT):
            bot = NanoBot(CELL_COUNT + i, self)
            x = random.randrange(self.grid.width)
            y = random.randrange(self.grid.height)
            self.grid.place_agent(bot, (x, y))
            self.schedule.add(bot)

    def step(self):
        self.schedule.step()
        
        # Check end condition (all cancer neutralized)
        cancer_cells = [a for a in self.schedule.agents if isinstance(a, Cell) and a.is_cancer and a.damage_level < 1.0]
        if not cancer_cells:
            # self.running = False # Keep running for visualization
            pass
