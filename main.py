import sys
import os
from src.environment import Bloodstream
from src.visualization import Visualization
from src.data_generator import generate_dataset
from src.model import train_model

def main():
    print("AI Diagnostics & Nano-Bot Cellular Repair Simulation")
    print("====================================================")
    
    # Check for data
    if not os.path.exists("data/train"):
        print("Dataset not found. Generating...")
        generate_dataset()
        
    # Check for model
    if not os.path.exists("models/cell_classifier.pkl"):
        print("Model not found. Training...")
        try:
            train_model()
        except Exception as e:
            print(f"Training failed: {e}")
            print("Running in simulation-only mode (randomized classification).")

    print("\nStarting Simulation...")
    print("Model: Bloodstream (Mesa)")
    print("Viz: Matplotlib Animation")
    
    # Initialize Model
    model = Bloodstream()
    
    # Initialize Visualization
    viz = Visualization(model)
    viz.show()

if __name__ == "__main__":
    main()
