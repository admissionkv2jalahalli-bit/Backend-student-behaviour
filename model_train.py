import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os

# --- 1. Dataset Generation ---
# In a real-world scenario, this would load a CSV file.
# Here we generate synthetic data representing factors for behavior issues.
# Features: [Attendance(%), Grade(%), SocialEngagement(0-10), StressLevel(0-10)]
def create_synthetic_data(samples=1000):
    np.random.seed(42)
    X = np.random.rand(samples, 4)
    # Target: 1 (Needs Attention), 0 (Healthy)
    # Simple logic: Low attendance, low grades, high stress increase risk
    y = ((X[:, 0] < 0.6) * 0.4 + (X[:, 1] < 0.5) * 0.3 + (X[:, 3] > 0.7) * 0.3) > 0.5
    return X, y.astype(int)

def train_model():
    print("Generating synthetic dataset...")
    X, y = create_synthetic_data()

    # --- 2. Training Split ---
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # --- 3. Model Definition ---
    # Using RandomForest as it handles non-linear relationships well
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    
    print("Training the scikit-learn model...")
    model.fit(X_train, y_train)

    # --- 4. Evaluation ---
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model trained successfully. Accuracy: {accuracy * 100:.2f}%")

    # --- 5. Saving the Model ---
    joblib.dump(model, 'model.pkl')
    print("Model saved to model.pkl")
    return accuracy

if __name__ == "__main__":
    train_model()
