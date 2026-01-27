import cv2
import numpy as np
import os
import random
from src.config import IMG_SIZE, DATA_DIR

def create_healthy_cell(size=128):
    """Generates a smooth, circular healthy cell."""
    img = np.zeros((size, size), dtype=np.uint8)
    center = (size // 2, size // 2)
    radius = random.randint(30, 45)
    
    # Draw smooth circle
    cv2.circle(img, center, radius, (200, 200, 200), -1)
    
    # Add soft internal texture (nucleus)
    nucleus_radius = random.randint(5, 10)
    nucleus_center = (center[0] + random.randint(-5, 5), center[1] + random.randint(-5, 5))
    cv2.circle(img, nucleus_center, nucleus_radius, (100, 100, 100), -1)
    
    # Add Gaussian blur for organic look
    img = cv2.GaussianBlur(img, (5, 5), 0)
    return img

def create_cancer_cell(size=128):
    """Generates an irregular, jagged cancer cell."""
    img = np.zeros((size, size), dtype=np.uint8)
    center = (size // 2, size // 2)
    radius = random.randint(30, 45)
    
    # Draw base shape
    pts = []
    for angle in range(0, 360, 10):
        r = radius + random.randint(-15, 15)  # Irregularity
        x = int(center[0] + r * np.cos(np.radians(angle)))
        y = int(center[1] + r * np.sin(np.radians(angle)))
        pts.append([x, y])
    
    pts = np.array(pts, np.int32)
    cv2.fillPoly(img, [pts], (200, 200, 200))
    
    # Add high-frequency noise/texture (malignancy features)
    noise = np.random.randint(0, 50, (size, size), dtype=np.uint8)
    img = cv2.add(img, noise)
    
    # Add multiple chaotic nuclei
    for _ in range(random.randint(2, 5)):
        nx = random.randint(40, 90)
        ny = random.randint(40, 90)
        nr = random.randint(3, 8)
        cv2.circle(img, (nx, ny), nr, (50, 50, 50), -1)

    return img

def generate_dataset(num_train=200, num_test=50):
    print(f"Generating synthetic dataset in {DATA_DIR}...")
    
    categories = ['healthy', 'cancer']
    splits = [('train', num_train), ('test', num_test)]
    
    for split, count in splits:
        for cat in categories:
            path = os.path.join(DATA_DIR, split, cat)
            os.makedirs(path, exist_ok=True)
            
            print(f"  Generating {count} {split} images for {cat}...")
            for i in range(count):
                if cat == 'healthy':
                    img = create_healthy_cell(IMG_SIZE)
                else:
                    img = create_cancer_cell(IMG_SIZE)
                
                # Add background noise to whole image
                bg_noise = np.random.randint(0, 20, (IMG_SIZE, IMG_SIZE), dtype=np.uint8)
                img = cv2.add(img, bg_noise)
                
                filename = os.path.join(path, f"{cat}_{i}.png")
                cv2.imwrite(filename, img)

if __name__ == "__main__":
    generate_dataset()
