# Simulation Configuration

# Image Processing
IMG_SIZE = 128
BATCH_SIZE = 32
EPOCHS = 10
NUM_CLASSES = 4

# Simulation Environment
GRID_WIDTH = 50
GRID_HEIGHT = 50
GRID_DEPTH = 50 # 3D Space
CELL_COUNT = 30  # Number of biological cells
INITIAL_CANCER_PCT = 0.2  # 20% start as cancer
NANO_BOT_COUNT = 5

# Paths
# Using the user-provided "Data copy" folder
DATA_DIR = "Data copy" 
MODEL_PATH = "models/cell_classifier.pkl"

# Class Mapping for Reference
# 0: adenocarcinoma...
# 1: large.cell.carcinoma...
# 2: normal
# 3: squamous.cell.carcinoma...
# We will treat index of 'normal' as Healthy, others as Cancer.
