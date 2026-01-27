from mesa import Agent
import random
import math

class Cell(Agent):
    """
    Biological Cell Agent.
    State:
    - 0: Healthy
    - 1: Cancerous
    - 2: Being Repaired (visual state)
    - 3: Neutralized/Dead
    """
    def __init__(self, unique_id, model, pos, is_cancer=False):
        super().__init__(unique_id, model)
        self.pos = pos
        self.is_cancer = is_cancer
        self.damage_level = 0.0  # 0.0 to 1.0 (1.0 = destroyed/neutralized)
        self.being_repaired = False

    def step(self):
        # Cells are mostly static but could have biological behaviors here
        pass

    @property
    def color(self):
        if self.damage_level >= 1.0:
            return "black"  # Neutralized
        if self.being_repaired:
            return "yellow"
        if self.is_cancer:
            return "red"
        return "green"

class NanoBot(Agent):
    """
    Nano-Bot Agent.
    States:
    - IDLE: Random walk
    - TARGETING: Moving to a specific cell
    - ACTING: Repairing or Neutralizing
    """
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.state = "IDLE"
        self.target_cell = None
        self.battery = 100

    def step(self):
        if self.battery <= 0:
            return  # Dead bot

        if self.state == "IDLE":
            self.random_movement()
            self.scan_for_targets()
        
        elif self.state == "TARGETING":
            if self.target_cell and self.target_cell.damage_level < 1.0:
                self.move_towards(self.target_cell.pos)
                if self.pos == self.target_cell.pos:
                    self.state = "ACTING"
            else:
                self.state = "IDLE"
                self.target_cell = None

        elif self.state == "ACTING":
            self.perform_action()

        self.battery -= 0.1  # Usage cost

    def random_movement(self):
        possible_steps = self.model.grid.get_neighborhood(
            self.pos, moore=True, include_center=False
        )
        new_position = self.random.choice(possible_steps)
        self.model.grid.move_agent(self, new_position)

    def scan_for_targets(self):
        # Scan local area (radius 5)
        neighbors = self.model.grid.get_neighbors(self.pos, moore=True, include_center=True, radius=5)
        candidates = [n for n in neighbors if isinstance(n, Cell) and n.is_cancer and n.damage_level < 1.0]
        
        if candidates:
            # Pick closest
            closest = min(candidates, key=lambda c: self.get_distance(self.pos, c.pos))
            self.target_cell = closest
            self.state = "TARGETING"

    def move_towards(self, target_pos):
        # Simple vector movement
        x, y = self.pos
        tx, ty = target_pos
        
        dx = 1 if tx > x else (-1 if tx < x else 0)
        dy = 1 if ty > y else (-1 if ty < y else 0)
        
        new_pos = (x + dx, y + dy)
        if self.model.grid.is_cell_empty(new_pos): # Avoid collisions is optional, but safer
             self.model.grid.move_agent(self, new_pos)
        else:
            # Just move randomly if blocked
            self.random_movement()

    def perform_action(self):
        if not self.target_cell:
            self.state = "IDLE"
            return

        if self.target_cell.is_cancer:
            # Neutralize
            self.target_cell.being_repaired = True # Visual indicator for 'action'
            self.target_cell.damage_level += 0.2
            if self.target_cell.damage_level >= 1.0:
                self.target_cell.is_cancer = False # Effectively dead
                self.target_cell.being_repaired = False
                self.state = "IDLE"
                self.target_cell = None
        else:
            # Repair (simulating repairing damaged healthy cells if we had that logic)
            self.state = "IDLE"

    def get_distance(self, pos1, pos2):
        x1, y1 = pos1
        x2, y2 = pos2
        return math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
