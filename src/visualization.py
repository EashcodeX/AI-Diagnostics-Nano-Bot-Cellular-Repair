import matplotlib.pyplot as plt
import matplotlib.animation as animation
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
from src.agents import Cell, NanoBot
from src.config import GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH

class Visualization:
    def __init__(self, model):
        self.model = model
        self.fig = plt.figure(figsize=(12, 10))
        self.fig.canvas.manager.set_window_title("AI Diagnostics Nano-Bot Simulation (3D V2)")
        self.ax = self.fig.add_subplot(111, projection='3d')
        self.ax.set_facecolor('#050a14')
        
    def init_plot(self):
        self.update(0)
        return []

    def update(self, frame):
        self.model.step()
        self.ax.clear()
        
        # Style
        self.ax.set_facecolor('#050a14') # Dark BG
        self.fig.set_facecolor('#050a14')
        self.ax.grid(color='white', linestyle='-', linewidth=0.1, alpha=0.1)
        self.ax.set_xlim(0,  self.model.space_dims[0])
        self.ax.set_ylim(0,  self.model.space_dims[1])
        self.ax.set_zlim(0,  self.model.space_dims[2])
        self.ax.axis('off') # Hide axes for immersion
        
        # Camera Rotation
        angle = frame * 0.5
        self.ax.view_init(elev=20, azim=angle)

        # Plot Data
        cells = [a for a in self.model.agents_list if isinstance(a, Cell)]
        bots = [a for a in self.model.agents_list if isinstance(a, NanoBot)]

        # Cells (Spheres represented as scatter points with transparency)
        c_x, c_y, c_z, c_c, c_s = [], [], [], [], []
        for c in cells:
            c_x.append(c.pos[0])
            c_y.append(c.pos[1])
            c_z.append(c.pos[2])
            
            # Color logic
            if c.damage_level >= 1.0:
                col = 'black'
            elif c.being_repaired:
                col = 'yellow'
            elif c.is_cancer:
                col = 'red'
            else:
                col = 'green'
            c_c.append(col)
            c_s.append(200 if c.is_cancer else 100) # Cancer slightly larger

        self.ax.scatter(c_x, c_y, c_z, c=c_c, s=c_s, alpha=0.8, edgecolors='w', linewidth=0.5)

        # Bots (Cones/Triangles)
        b_x, b_y, b_z, b_c = [], [], [], []
        for b in bots:
            b_x.append(b.pos[0])
            b_y.append(b.pos[1])
            b_z.append(b.pos[2])
            
            col = 'cyan'
            if b.state == 'SCANNING': col = 'white'
            if b.state == 'ACTING': col = 'magenta'
            b_c.append(col)
            
            # Draw targeting lines
            if b.state != "IDLE" and b.target_cell:
                tx, ty, tz = b.target_cell.pos
                self.ax.plot([b.pos[0], tx], [b.pos[1], ty], [b.pos[2], tz], color=col, linewidth=1, alpha=0.6)
            
            # Draw trails
            if len(b.history) > 1:
                hx = [p[0] for p in b.history]
                hy = [p[1] for p in b.history]
                hz = [p[2] for p in b.history]
                self.ax.plot(hx, hy, hz, color='cyan', linewidth=0.5, alpha=0.3)

        self.ax.scatter(b_x, b_y, b_z, c=b_c, marker='^', s=100, alpha=1.0) # Bots as triangles

        # HUD Stats (2D overlay)
        healthy_count = len([c for c in cells if not c.is_cancer])
        cancer_active = len([c for c in cells if c.is_cancer and c.damage_level < 1.0])
        
        stats = (f"Healthy: {healthy_count}\n"
                 f"Cancer: {cancer_active}\n"
                 f"Bots: {len(bots)}")
        
        self.ax.text2D(0.05, 0.95, stats, transform=self.ax.transAxes, color="#00f2ff", fontsize=12,
                       bbox=dict(facecolor='black', alpha=0.5, edgecolor='cyan'))

    def show(self):
        ani = animation.FuncAnimation(self.fig, self.update, init_func=self.init_plot, frames=360, interval=50)
        plt.show()
