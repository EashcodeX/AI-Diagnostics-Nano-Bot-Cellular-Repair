import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
import matplotlib.patches as patches
import numpy as np
import os
import cv2
import random
from src.agents import Cell, NanoBot
from src.config import DATA_DIR, IMG_SIZE

class Visualization:
    def __init__(self, model):
        self.model = model
        self.fig, self.ax = plt.subplots(figsize=(10, 10))
        self.fig.canvas.manager.set_window_title("AI Diagnostics Nano-Bot Simulation (Enhanced UX)")
        self.ax.set_facecolor('#050a14')
        
        self.text_stats = None
        self.artists = []
        
        # Load sample images for rendering
        self.healthy_imgs = self.load_sample_images('normal')
        self.cancer_imgs = self.load_sample_images('adenocarcinoma_left.lower.lobe_T2_N0_M0_Ib') 
        if not self.cancer_imgs: 
             self.cancer_imgs = self.load_sample_images('cancer')
             
        # Pre-assign an image to each agent
        for agent in self.model.agents_list:
            if isinstance(agent, Cell):
                if agent.is_cancer:
                    agent.image = random.choice(self.cancer_imgs) if self.cancer_imgs else np.zeros((32,32,3))
                else:
                    agent.image = random.choice(self.healthy_imgs) if self.healthy_imgs else np.zeros((32,32,3))

        # NanoBot Image
        self.bot_img = np.zeros((32, 32, 4), dtype=np.uint8)
        pts = np.array([[16, 2], [2, 30], [30, 30]], np.int32)
        cv2.fillPoly(self.bot_img, [pts], (0, 255, 255, 255)) 

        # Legend Assets
        self.legend_elements = self.create_legend_elements()
        
    def create_legend_elements(self):
        # Create proxy artists for legend
        legend_patches = [
            patches.Patch(color='green', label='Healthy Cell'),
            patches.Patch(color='red', label='Cancer Cell'),
            patches.Patch(color='black', label='Neutralized'),
            patches.Patch(color='cyan', label='Nano-Bot'),
            patches.Patch(color='yellow', label='Scanning/Repair'),
        ]
        return legend_patches

    def load_sample_images(self, category, count=10):
        images = []
        target_path = None
        train_dir = os.path.join(DATA_DIR, 'train')
        if os.path.exists(train_dir):
            for d in os.listdir(train_dir):
                if category in d:
                    target_path = os.path.join(train_dir, d)
                    break
        
        if not target_path or not os.path.exists(target_path):
             return []

        for f in os.listdir(target_path)[:count]:
            if f.startswith('.'): continue
            path = os.path.join(target_path, f)
            img = cv2.imread(path)
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = cv2.resize(img, (32, 32))
                mask = np.zeros((32,32), dtype=np.uint8)
                cv2.circle(mask, (16,16), 16, (255), -1)
                img = cv2.bitwise_and(img, img, mask=mask)
                img = cv2.cvtColor(img, cv2.COLOR_RGB2RGBA)
                img[:, :, 3] = mask
                images.append(img)
        return images

    def init_plot(self):
        self.ax.clear()
        self.ax.set_xlim(-1, self.model.grid.width)
        self.ax.set_ylim(-1, self.model.grid.height)
        self.ax.set_aspect('equal')
        self.ax.axis('off')
        return []

    def update(self, frame):
        self.model.step()
        self.ax.clear()
        self.artists = []
        
        self.ax.set_facecolor('#050a14')
        self.ax.set_xlim(-1, self.model.grid.width)
        self.ax.set_ylim(-1, self.model.grid.height)
        self.ax.axis('off')
        
        # Grid lines for "Scientific" look
        self.ax.grid(color='white', linestyle='-', linewidth=0.1, alpha=0.1)
        
        # Render Cells
        for agent in self.model.agents_list:
            if isinstance(agent, Cell):
                img_disp = agent.image.copy()
                if agent.damage_level >= 1.0: 
                     img_disp = (img_disp * 0.2).astype(np.uint8)
                elif agent.being_repaired: 
                     overlay = np.full_like(img_disp, (255, 255, 0, 100), dtype=np.uint8)
                     cv2.addWeighted(overlay, 0.3, img_disp, 0.7, 0, img_disp)
                     
                     # PULSE EFFECT: Draw ring around repairing cell
                     pulse_radius = 1.0 + 0.2 * np.sin(frame * 0.5)
                     circle = plt.Circle(agent.pos, pulse_radius, color='yellow', fill=False, linewidth=2, alpha=0.7)
                     self.ax.add_artist(circle)

                imagebox = OffsetImage(img_disp, zoom=0.8)
                ab = AnnotationBbox(imagebox, agent.pos, frameon=False)
                self.ax.add_artist(ab)
                
            elif isinstance(agent, NanoBot):
                current_bot_img = self.bot_img.copy()
                if agent.state == "SCANNING":
                     # Blue glow already default?
                     pass 
                elif agent.state == "ACTING":
                     current_bot_img[:,:,0] = 255 # R
                
                # TRAIL EFFECT
                if hasattr(agent, 'history') and len(agent.history) > 1:
                    hx = [p[0] for p in agent.history]
                    hy = [p[1] for p in agent.history]
                    self.ax.plot(hx, hy, color='cyan', linewidth=1, alpha=0.3)
                
                imagebox = OffsetImage(current_bot_img, zoom=0.6)
                ab = AnnotationBbox(imagebox, agent.pos, frameon=False)
                self.ax.add_artist(ab)
                
                # Targeting Lines
                if agent.state != "IDLE" and agent.target_cell:
                    tx, ty = agent.target_cell.pos
                    bx, by = agent.pos
                    col = 'cyan'
                    if agent.state == 'SCANNING': col = 'white'
                    if agent.state == 'ACTING': col = 'red'
                    self.ax.plot([bx, tx], [by, ty], color=col, linewidth=1, alpha=0.6)

        # Legend
        leg = self.ax.legend(handles=self.legend_elements, loc='upper right', 
                       facecolor='black', edgecolor='cyan', labelcolor='white', fontsize=8)
        
        # Stats HUD
        cells = [a for a in self.model.agents_list if isinstance(a, Cell)]
        bots = [a for a in self.model.agents_list if isinstance(a, NanoBot)]
        
        healthy_count = len([c for c in cells if not c.is_cancer])
        cancer_active = len([c for c in cells if c.is_cancer and c.damage_level < 1.0])
        neutralized = len([c for c in cells if c.is_cancer and c.damage_level >= 1.0])
        
        stats = (f"Healthy Cells: {healthy_count}\n"
                 f"Active Cancer: {cancer_active}\n"
                 f"Neutralized: {neutralized}\n"
                 f"Swarm Bots: {len(bots)}")
        
        self.ax.text(0.02, 0.9, stats, transform=self.ax.transAxes, color="#00f2ff", fontsize=10, 
                     family='monospace', weight='bold',
                     bbox=dict(facecolor='#050a14', alpha=0.8, edgecolor='#00f2ff'))

    def show(self):
        ani = animation.FuncAnimation(self.fig, self.update, init_func=self.init_plot, frames=200, interval=150)
        plt.show()
