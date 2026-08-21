import os
import sys
import json

# Ensure app path in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.logger import logger
from train_model import generate_synthetic_dataset


def evaluate_model():
    """Evaluate saved model on independent test dataset."""
    if not os.path.exists(settings.MODEL_PATH):
        print(f"Error: Trained model not found at {settings.MODEL_PATH}. Run 'python train_model.py' first.")
        return

    try:
        # pyrefly: ignore [missing-import]
        import joblib
        from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
    except ImportError:
        print("Required packages (scikit-learn, joblib) not found.")
        return

    clf = joblib.load(settings.MODEL_PATH)
    logger.info(f"Loaded model from {settings.MODEL_PATH}")

    # Generate fresh test set
    X_test, y_test = generate_synthetic_dataset(num_samples=500)
    y_pred = clf.predict(X_test)

    print("\n" + "="*60)
    print("      INDEPENDENT TEST SET EVALUATION REPORT")
    print("="*60)
    print(classification_report(y_test, y_pred, target_names=["Genuine", "Forged"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("="*60 + "\n")


if __name__ == "__main__":
    evaluate_model()
