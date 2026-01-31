from mesa import Agent
import random
import math

class Cell(Agent):
    """
    Biological Cell Agent (3D).
    """
    def __init__(self, unique_id, model, pos, is_cancer=False):
        super().__init__(model)
        self.unique_id = unique_id
        self.pos = pos # (x, y, z)
        self.image = None # Placeholder for visualizer
        self.is_cancer = is_cancer
        self.damage_level = 0.0
        self.being_repaired = False
        self.just_neutralized = False

    def step(self):
        pass

class NanoBot(Agent):
    """
    Nano-Bot Agent (3D).
    """
    def __init__(self, unique_id, model):
        super().__init__(model)
        self.unique_id = unique_id
        self.pos = (0, 0, 0) # Set by model
        self.state = "IDLE"
        self.target_cell = None
        self.battery = 100
        self.history = [] # For trails
        self.manual_override = False

    def step(self):
        if self.battery <= 0:
            return  # Dead bot
        
        # Record history
        self.history.append(self.pos)
        if len(self.history) > 15:
            self.history.pop(0)

        # Priority Check: Manual Override
        if self.manual_override:
            if self.state == "LOW_BATTERY": # Recall mode
                self.seek_energy()
            elif self.state == "RECHARGING":
                if self.battery >= 100:
                    self.manual_override = False # Auto-release after charge
                    self.state = "IDLE"
            self.battery -= 0.1
            return

        if self.state == "IDLE":
            self.random_movement()
            self.scan_for_targets()
        
        elif self.state == "TARGETING":
            if self.target_cell and self.target_cell.damage_level < 1.0:
                self.move_towards(self.target_cell.pos)
                if self.pos == self.target_cell.pos:
                    self.state = "SCANNING"
                    self.scan_timer = 3
            else:
                self.state = "IDLE"
                self.target_cell = None

        elif self.state == "SCANNING":
            self.scan_timer -= 1
            if self.scan_timer <= 0:
                self.state = "ACTING"
                self.broadcast_target(self.target_cell)

        elif self.state == "ACTING":
            self.perform_action()
            
        elif self.state == "RECHARGING":
            if self.battery >= 100:
                self.state = "IDLE"

        # Battery Drain
        drain_rate = 0.1
        if self.state == "ACTING": drain_rate = 0.5
        if self.state == "TARGETING": drain_rate = 0.2
        
        self.battery -= drain_rate
        
        # Low Battery Logic
        if self.battery < 30 and self.state != "RECHARGING":
            self.seek_energy()

    def broadcast_target(self, target):
        # Brute force neighbor check in 3D
        radius = 15
        for n in self.model.agents_list:
            if isinstance(n, NanoBot) and n.state == "IDLE" and n != self:
                if self.get_distance(self.pos, n.pos) <= radius:
                    n.target_cell = target
                    n.state = "TARGETING"

    def random_movement(self):
        # 3D Random Walk
        x, y, z = self.pos
        dx = random.choice([-1, 0, 1])
        dy = random.choice([-1, 0, 1])
        dz = random.choice([-1, 0, 1])
        
        # Bounds check
        w, h, d = self.model.space_dims
        nx = max(0, min(w-1, x + dx))
        ny = max(0, min(h-1, y + dy))
        nz = max(0, min(d-1, z + dz))
        
        self.pos = (nx, ny, nz)

    def scan_for_targets(self):
        # Scan local 3D area
        radius = 10
        candidates = []
        for n in self.model.agents_list:
            if isinstance(n, Cell) and n.is_cancer and n.damage_level < 1.0:
                 if self.get_distance(self.pos, n.pos) <= radius:
                     candidates.append(n)
        
        if candidates:
            closest = min(candidates, key=lambda c: self.get_distance(self.pos, c.pos))
            self.target_cell = closest
            self.state = "TARGETING"

    def move_towards(self, target_pos):
        x, y, z = self.pos
        tx, ty, tz = target_pos
        
        dx = 1 if tx > x else (-1 if tx < x else 0)
        dy = 1 if ty > y else (-1 if ty < y else 0)
        dz = 1 if tz > z else (-1 if tz < z else 0)
        
        # Move step
        self.pos = (x + dx, y + dy, z + dz)

    def seek_energy(self):
        # Find nearest RechargeStation
        stations = [a for a in self.model.agents_list if isinstance(a, RechargeStation)]
        if stations:
            closest = min(stations, key=lambda s: self.get_distance(self.pos, s.pos))
            self.state = "LOW_BATTERY"
            self.move_towards(closest.pos)

    def perform_action(self):
        if not self.target_cell:
            self.state = "IDLE"
            return

        if self.target_cell.is_cancer:
            self.target_cell.being_repaired = True
            self.target_cell.damage_level += 0.2
            if self.target_cell.damage_level >= 1.0:
                self.target_cell.is_cancer = False # Neutralized
                self.target_cell.just_neutralized = True
                self.target_cell.being_repaired = False
                self.state = "IDLE"
                self.target_cell = None
        else:
            self.state = "IDLE"

    def get_distance(self, pos1, pos2):
        x1, y1, z1 = pos1
        x2, y2, z2 = pos2
        return math.sqrt((x1 - x2)**2 + (y1 - y2)**2 + (z1 - z2)**2)

class RechargeStation(Agent):
    """
    Stationary agent that refills NanoBot batteries.
    """
    def __init__(self, unique_id, model, pos):
        super().__init__(model)
        self.unique_id = unique_id
        self.pos = pos
        self.color = "#00ffcc" # Cyan/Green glow

    def step(self):
        # Refill bots in same position or neighbors
        # For simplicity in continuous space/sparse grid, check distance
        radius = 5
        for agent in self.model.agents_list:
            if isinstance(agent, NanoBot) and agent.battery < 100:
                 if self.get_distance(self.pos, agent.pos) <= radius:
                     agent.battery = min(100, agent.battery + 10) # Charge rate
                     agent.state = "RECHARGING"

    def get_distance(self, pos1, pos2):
        x1, y1, z1 = pos1
        x2, y2, z2 = pos2
        return math.sqrt((x1 - x2)**2 + (y1 - y2)**2 + (z1 - z2)**2)
