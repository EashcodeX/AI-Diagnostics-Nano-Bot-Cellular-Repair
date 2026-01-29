# How to Run the Simulation

Follow these steps to run the **AI Diagnostics and Nano-Bot Cellular Repair Simulation**.

## 1. Using the Virtual Environment (Recommended)

The project includes a pre-configured virtual environment (`venv`) that contains all required dependencies.

### On macOS/Linux:
```bash
# 1. Activate the virtual environment
source venv/bin/activate

# 2. Run the simulation
python3 main.py
```

### Direct Run (without activation):
You can also run it directly using the Python interpreter inside the virtual environment:
```bash
./venv/bin/python3 main.py
```

---

## 2. Manual Setup (If venv is missing)

If you need to set up the environment from scratch:

```bash
# 1. Create a virtual environment
python3 -m venv venv

# 2. Activate it
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the simulation
python3 main.py
```

---

## 🔬 What happens when you run?
1. **Data Generation**: If the `data/` folder is missing, the system generates synthetic cell images.
2. **Model Training**: If `cell_classifier.pkl` is missing, it trains a Random Forest model on the data.
3. **Visualization**: A 3D Matplotlib window launches, showing the bloodstream, cells, and nano-bots.

## 🎮 Controls
- **Rotate**: Click and drag your mouse on the 3D plot.
- **Legend**:
  - 🟢 **Green**: Healthy Cells
  - 🔴 **Red**: Cancerous Cells
  - 🟡 **Yellow**: Being Repaired
  - ⚫ **Black**: Neutralized
  - 🤖 **Cyan Triangles**: Nano-Bots
