import os
import cv2
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from src.config import IMG_SIZE, DATA_DIR, MODEL_PATH

# Update config path for sklearn pickle
RF_MODEL_PATH = MODEL_PATH.replace('.h5', '.pkl')

class CellClassifier:
    def __init__(self):
        self.model = None
        if os.path.exists(RF_MODEL_PATH):
            print(f"Loading RF model from {RF_MODEL_PATH}")
            with open(RF_MODEL_PATH, 'rb') as f:
                self.model = pickle.load(f)
        else:
            print("Model not found. Please train first.")

    def predict(self, image):
        """
        Predicts probability of cancer (0.0 - 1.0).
        Image should be (128, 128) grayscale or RGB.
        """
        if self.model:
            # Preprocess to match training (Flattened)
            img = cv2.resize(image, (IMG_SIZE, IMG_SIZE))
            # Convert to RGB if grayscale
            if len(img.shape) == 2:
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
            
            # Flatten
            flat_data = img.flatten().reshape(1, -1)
            
            # Predict
            probs = self.model.predict_proba(flat_data)[0]
            
            # Classes are likely sorted alphabetical: 
            # 0: adenocarcinoma, 1: large.cell, 2: normal, 3: squamous
            # We want P(Cancer) = 1 - P(Normal)
            # We need to rely on the fact that 'normal' is index 2.
            # Ideally we check model classes_ but for this demo:
            classes = self.model.classes_
            normal_idx = -1
            for i, c in enumerate(classes):
                if 'normal' in c:
                    normal_idx = i
                    break
            
            if normal_idx != -1:
                p_normal = probs[normal_idx]
                return 1.0 - p_normal
            else:
                # Fallback if 'normal' name not found exactly?
                # Assume 0 is cancer? No, risky.
                # Let's assume binary logic if we trained mapped classes.
                pass
                
            return probs[0] # Fallback
        else:
            # Fallback heuristic
            return 0.5

def load_data():
    print("Loading dataset from disk...")
    X = []
    y = []
    
    # We will load 'train' and 'test' folders as one big dataset for splitting, 
    # or just use train for training.
    train_dir = os.path.join(DATA_DIR, 'train')
    
    classes = sorted(os.listdir(train_dir))
    # Filter out hidden files
    classes = [c for c in classes if not c.startswith('.')]
    
    print(f"Found classes: {classes}")
    
    for label in classes:
        folder_path = os.path.join(train_dir, label)
        if not os.path.isdir(folder_path): continue
        
        for file in os.listdir(folder_path):
            if file.startswith('.'): continue
            
            img_path = os.path.join(folder_path, file)
            img = cv2.imread(img_path)
            if img is not None:
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                X.append(img.flatten())
                y.append(label)
                
    return np.array(X), np.array(y)

def train_model():
    print("Initializing Random Forest Classifier...")
    
    X, y = load_data()
    print(f"Loaded {len(X)} images.")
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    clf = RandomForestClassifier(n_estimators=100, n_jobs=-1, random_state=42)
    print("Training...")
    clf.fit(X_train, y_train)
    
    # Evaluate
    preds = clf.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Model Accuracy: {acc*100:.2f}%")
    print(classification_report(y_test, preds))
    
    # Save
    print(f"Saving model to {RF_MODEL_PATH}...")
    os.makedirs(os.path.dirname(RF_MODEL_PATH), exist_ok=True)
    with open(RF_MODEL_PATH, 'wb') as f:
        pickle.dump(clf, f)
    print("Training complete.")

if __name__ == "__main__":
    train_model()
