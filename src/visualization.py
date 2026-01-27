import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.colors import ListedColormap
import numpy as np
from agents import Cell, NanoBot

class Visualization:
    def __init__(self, model):
        self.model = model
        self.fig, self.ax = plt.subplots(figsize=(8, 8))
        self.fig.canvas.manager.set_window_title("AI Diagnostics Nano-Bot Simulation")
        self.ax.set_facecolor('#050a14') # Dark background
        
        self.scat_cells = None
        self.scat_bots = None
        self.text_stats = None

    def init_plot(self):
        self.ax.clear()
        self.ax.set_xlim(-1, self.model.grid.width)
        self.ax.set_ylim(-1, self.model.grid.height)
        self.ax.set_aspect('equal')
        self.ax.axis('off')
        
        # Stats text
        self.text_stats = self.ax.text(0.02, 0.95, "", transform=self.ax.transAxes, color="white", fontsize=10)
        
        return []

    def update(self, frame):
        self.model.step()
        
        # Extract data
        cells = [a for a in self.model.schedule.agents if isinstance(a, Cell)]
        bots = [a for a in self.model.schedule.agents if isinstance(a, NanoBot)]
        
        # Cell data
        c_x = [c.pos[0] for c in cells]
        c_y = [c.pos[1] for c in cells]
        c_col = [c.color for c in cells]
        c_sizes = [150] * len(cells) # Fixed size for now

        # Bot data
        b_x = [b.pos[0] for b in bots]
        b_y = [b.pos[1] for b in bots]
        b_col = ['cyan'] * len(bots) # Nano-bots are Cyan
        
        self.ax.clear()
        self.ax.set_facecolor('#050a14')
        self.ax.set_xlim(-1, self.model.grid.width)
        self.ax.set_ylim(-1, self.model.grid.height)
        self.ax.axis('off')
        
        # Plot Cells
        self.ax.scatter(c_x, c_y, s=c_sizes, c=c_col, alpha=0.8, edgecolors='none')
        
        # Plot Bots
        self.ax.scatter(b_x, b_y, s=50, c=b_col, marker='^', edgecolors='white')
        
        # Connections (Bot -> Target)
        for b in bots:
            if b.state != "IDLE" and b.target_cell:
                # Draw laser/connection
                tx, ty = b.target_cell.pos
                bx, by = b.pos
                color = 'red' if b.state == "ACTING" else 'green'  
                self.ax.plot([bx, tx], [by, ty], color=color, linewidth=1, alpha=0.5)

        # Stats
        healthy_count = len([c for c in cells if not c.is_cancer])
        cancer_defs = len([c for c in cells if c.is_cancer and c.damage_level < 1.0])
        neutralized = len([c for c in cells if c.is_cancer and c.damage_level >= 1.0])
        
        stats = (f"Healthy Cells: {healthy_count}\n"
                 f"Active Cancer: {cancer_defs}\n"
                 f"Neutralized: {neutralized}\n"
                 f"Nano-Bots: {len(bots)}")
        
        self.ax.text(0.02, 0.9, stats, transform=self.ax.transAxes, color="white", fontsize=10, 
                     bbox=dict(facecolor='black', alpha=0.5, edgecolor='cyan'))

    def show(self):
        ani = animation.FuncAnimation(self.fig, self.update, init_func=self.init_plot, frames=200, interval=200)
        plt.show()
