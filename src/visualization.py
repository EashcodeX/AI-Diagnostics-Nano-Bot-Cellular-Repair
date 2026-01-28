import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.gridspec as gridspec
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
from src.agents import Cell, NanoBot

class Visualization:
    def __init__(self, model):
        self.model = model
        
        # Setup Figure with GridSpec (Main 3D View + Side Analysis)
        self.fig = plt.figure(figsize=(16, 9))
        self.fig.canvas.manager.set_window_title("AI Diagnostics Nano-Bot Integration System | v2.0")
        
        # Dark Sci-Fi Theme
        self.bg_color = '#02040a'  # Deep dark blue/black
        self.fig.patch.set_facecolor(self.bg_color)
        
        # Grid Layout: 1 Row, 2 Columns (Sim :: Stats)
        gs = gridspec.GridSpec(2, 4, figure=self.fig)
        
        # 3D Simulation View (Takes up left 3/4)
        self.ax_sim = self.fig.add_subplot(gs[:, :3], projection='3d')
        self.ax_sim.set_facecolor(self.bg_color)
        
        # Connect Controls
        self.fig.canvas.mpl_connect('key_press_event', self.on_key)
        
        # Analytics Views (Right 1/4)
        self.ax_stats1 = self.fig.add_subplot(gs[0, 3]) # Population Graph
        self.ax_stats2 = self.fig.add_subplot(gs[1, 3]) # Efficiency/Other
        
        # Style Analytics Plots
        for ax in [self.ax_stats1, self.ax_stats2]:
            ax.set_facecolor(self.bg_color)
            ax.tick_params(axis='x', colors='cyan')
            ax.tick_params(axis='y', colors='cyan')
            ax.spines['bottom'].set_color('cyan')
            ax.spines['top'].set_color('none')
            ax.spines['left'].set_color('cyan')
            ax.spines['right'].set_color('none')
            ax.grid(True, color='cyan', alpha=0.1)

        # Data History
        self.history_healthy = []
        self.history_cancer = []
        self.history_bots_active = []
        self.frames = []
        
        # Particle System
        self.particles = [] # List of dicts: {'pos': (x,y,z), 'life': 10, 'color': 'color', 'vel': (dx,dy,dz)}
        
    def on_key(self, event):
        if event.key == 'c':
            self.model.add_cancer()
            print("Injecting Cancer Cell...")
        elif event.key == 'b':
            self.model.add_bot()
            print("Deploying Nano-Bot...")
            
    def init_plot(self):
        return []

    def update(self, frame):
        self.model.step()
        
        # --- 3D Simulation Update ---
        self.ax_sim.clear()
        self.ax_sim.set_facecolor(self.bg_color)
        self.ax_sim.axis('off')
        
        # Dynamic Camera (Slow Rotation)
        self.ax_sim.view_init(elev=25, azim=frame * 0.2)
        self.ax_sim.set_xlim(0, self.model.space_dims[0])
        self.ax_sim.set_ylim(0, self.model.space_dims[1])
        self.ax_sim.set_zlim(0, self.model.space_dims[2])

        # Collect Data
        cells = [a for a in self.model.agents_list if isinstance(a, Cell)]
        bots = [a for a in self.model.agents_list if isinstance(a, NanoBot)]
        
        # --- Analytics Data Update ---
        healthy_count = len([c for c in cells if not c.is_cancer])
        cancer_count = len([c for c in cells if c.is_cancer])
        active_bots = len([b for b in bots if b.state != "IDLE"])
        
        self.frames.append(frame)
        self.history_healthy.append(healthy_count)
        self.history_cancer.append(cancer_count)
        self.history_bots_active.append(active_bots)
        
        # Keep graph window moving (last 100 frames)
        window = 100
        if len(self.frames) > window:
            plot_frames = self.frames[-window:]
            plot_healthy = self.history_healthy[-window:]
            plot_cancer = self.history_cancer[-window:]
            plot_bots = self.history_bots_active[-window:]
        else:
            plot_frames = self.frames
            plot_healthy = self.history_healthy
            plot_cancer = self.history_cancer
            plot_bots = self.history_bots_active

        # --- Draw Analytics ---
        self.ax_stats1.clear()
        self.ax_stats1.set_title("Cell Population", color='cyan', fontsize=10)
        self.ax_stats1.plot(plot_frames, plot_healthy, color='#00ff41', label='Healthy', linewidth=1.5) # Neon Green
        self.ax_stats1.plot(plot_frames, plot_cancer, color='#ff003c', label='Cancer', linewidth=1.5) # Neon Red
        self.ax_stats1.legend(loc='upper right', facecolor='black', edgecolor='cyan', labelcolor='white', fontsize=8)
        self.ax_stats1.set_facecolor(self.bg_color)
        self.ax_stats1.grid(color='cyan', alpha=0.1)

        self.ax_stats2.clear()
        self.ax_stats2.set_title("Nano-Bot Activity", color='magenta', fontsize=10)
        self.ax_stats2.plot(plot_frames, plot_bots, color='magenta', label='Active Bots', linewidth=1.5)
        self.ax_stats2.set_facecolor(self.bg_color)
        self.ax_stats2.grid(color='magenta', alpha=0.1)
        self.ax_stats2.set_ylim(0, len(bots) + 1)

        # --- Draw Agents (3D) ---
        # Cells
        c_x, c_y, c_z, c_c, c_s = [], [], [], [], []
        for c in cells:
            c_x.append(c.pos[0])
            c_y.append(c.pos[1])
            c_z.append(c.pos[2])
            
            # Check for events
            if c.just_neutralized:
                # Spawn Explosion Particles
                for _ in range(10): # 10 particles per explosion
                    self.particles.append({
                        'pos': c.pos,
                        'life': 15,
                        'color': '#00ff41', # Green flash
                        'vel': np.random.uniform(-1, 1, 3) 
                    })
                c.just_neutralized = False
            
            if c.is_cancer:
                # Pulse effect for cancer
                pulse = (np.sin(frame * 0.2) + 1.5) * 0.5 
                c_s.append(150 * pulse)
                c_c.append('#ff003c') # Neon Red
            elif c.being_repaired:
                c_s.append(120)
                c_c.append('#fdf500') # Neon Yellow
                # Spawn repair sparks occasionally
                if np.random.random() < 0.3:
                     self.particles.append({
                        'pos': c.pos,
                        'life': 5,
                        'color': '#fdf500', 
                        'vel': np.random.uniform(-0.5, 0.5, 3) 
                    })
            else:
                c_s.append(50)
                c_c.append('#002e12') # Dark Green (Passive)
        
        self.ax_sim.scatter(c_x, c_y, c_z, c=c_c, s=c_s, alpha=0.9, edgecolors='none', depthshade=True)

        # Bots
        b_x, b_y, b_z, b_c = [], [], [], []
        for b in bots:
            b_x.append(b.pos[0])
            b_y.append(b.pos[1])
            b_z.append(b.pos[2])
            
            if b.state == 'SCANNING':
                b_c.append('white') # Scanning
            elif b.state == 'ACTING':
                b_c.append('#00f2ff') # Cyan Action
            else:
                 b_c.append('#0055ff') # Blue Idle

            # Targeting Lasers
            if b.state != "IDLE" and b.target_cell:
                tx, ty, tz = b.target_cell.pos
                self.ax_sim.plot([b.pos[0], tx], [b.pos[1], ty], [b.pos[2], tz], color='#00f2ff', linewidth=1.5, alpha=0.8)

        self.ax_sim.scatter(b_x, b_y, b_z, c=b_c, marker='^', s=80, alpha=1.0)
        
        # --- Update and Draw Particles ---
        p_x, p_y, p_z, p_c, p_s = [], [], [], [], []
        for p in self.particles[:]:
            p['life'] -= 1
            if p['life'] <= 0:
                self.particles.remove(p)
                continue
            
            # Move particle
            x, y, z = p['pos']
            vx, vy, vz = p['vel']
            p['pos'] = (x+vx, y+vy, z+vz)
            
            p_x.append(p['pos'][0])
            p_y.append(p['pos'][1])
            p_z.append(p['pos'][2])
            p_c.append(p['color'])
            p_s.append(p['life'] * 5) # Fade out size
            
        if p_x:
            self.ax_sim.scatter(p_x, p_y, p_z, c=p_c, s=p_s, alpha=0.8, marker='.')

        # --- HUD Text ---
        hud_text = (
            f"SYSTEM STATUS: ONLINE\n"
            f"THREAT LEVEL: {'CRITICAL' if cancer_count > 5 else 'STABLE'}\n"
            f"---------------------\n"
            f"HEALTH INTEGRITY: {int((healthy_count / (healthy_count + cancer_count + 1)) * 100)}%\n"
            f"BOT EFFICIENCY: {int((active_bots / (len(bots)+0.1)) * 100)}%\n"
            f"\nCONTROLS:\n"
            f"[C] INJECT CANCER\n"
            f"[B] DEPLOY BOT"
        )
        self.ax_sim.text2D(0.02, 0.95, hud_text, transform=self.ax_sim.transAxes, color='#00f2ff', fontsize=12, family='monospace')

    def show(self):
        ani = animation.FuncAnimation(self.fig, self.update, init_func=self.init_plot, frames=1000, interval=50)
        plt.show()
