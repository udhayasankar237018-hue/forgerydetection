import os
import sys
import json
# pyrefly: ignore [missing-import]
import numpy as np

# Ensure app path in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.logger import logger


def generate_synthetic_dataset(num_samples: int = 800):
    """
    Generates balanced realistic feature vectors simulating genuine vs forged documents.
    """
    np.random.seed(42)
    n_half = num_samples // 2

    # Genuine distributions
    g_mean_ela = np.random.normal(7.5, 2.0, n_half).clip(1.0, 15.0)
    g_max_ela = np.random.normal(25.0, 6.0, n_half).clip(5.0, 50.0)
    g_std_ela = np.random.normal(4.5, 1.2, n_half).clip(1.0, 9.0)
    g_ela_ratio = np.random.normal(0.012, 0.004, n_half).clip(0.001, 0.035)
    g_noise_mean = np.random.normal(120.0, 20.0, n_half).clip(50.0, 200.0)
    g_noise_std = np.random.normal(18.0, 5.0, n_half).clip(5.0, 35.0)
    g_noise_incon = np.random.normal(0.45, 0.12, n_half).clip(0.1, 0.85)
    g_cm_matches = np.random.poisson(0.8, n_half).clip(0, 3)
    g_color_std = np.random.normal(14.0, 4.0, n_half).clip(2.0, 30.0)
    g_edge_dens = np.random.normal(0.045, 0.015, n_half).clip(0.01, 0.09)

    X_genuine = np.column_stack([
        g_mean_ela, g_max_ela, g_std_ela, g_ela_ratio,
        g_noise_mean, g_noise_std, g_noise_incon,
        g_cm_matches, g_color_std, g_edge_dens
    ])
    y_genuine = np.zeros(n_half, dtype=int)

    # Forged distributions
    f_mean_ela = np.random.normal(28.0, 8.0, n_half).clip(14.0, 65.0)
    f_max_ela = np.random.normal(135.0, 35.0, n_half).clip(60.0, 255.0)
    f_std_ela = np.random.normal(22.0, 6.0, n_half).clip(10.0, 48.0)
    f_ela_ratio = np.random.normal(0.11, 0.04, n_half).clip(0.04, 0.35)
    f_noise_mean = np.random.normal(145.0, 28.0, n_half).clip(60.0, 230.0)
    f_noise_std = np.random.normal(65.0, 18.0, n_half).clip(32.0, 130.0)
    f_noise_incon = np.random.normal(1.65, 0.45, n_half).clip(0.9, 3.5)
    f_cm_matches = np.random.poisson(12.0, n_half).clip(4, 50)
    f_color_std = np.random.normal(36.0, 10.0, n_half).clip(15.0, 75.0)
    f_edge_dens = np.random.normal(0.095, 0.025, n_half).clip(0.04, 0.22)

    X_forged = np.column_stack([
        f_mean_ela, f_max_ela, f_std_ela, f_ela_ratio,
        f_noise_mean, f_noise_std, f_noise_incon,
        f_cm_matches, f_color_std, f_edge_dens
    ])
    y_forged = np.ones(n_half, dtype=int)

    X = np.vstack([X_genuine, X_forged])
    y = np.concatenate([y_genuine, y_forged])

    indices = np.arange(len(X))
    np.random.shuffle(indices)
    return X[indices], y[indices]


def train_model():
    """
    Train Random Forest Document Forgery Detection Model.
    Computes performance metrics and serializes the model.
    """
    logger.info("Generating dataset for forensic model training...")
    X, y = generate_synthetic_dataset(num_samples=800)

    try:
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
        # pyrefly: ignore [missing-import]
        import joblib
    except ImportError as ie:
        logger.error(f"scikit-learn or joblib not ready: {ie}")
        return

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    logger.info(f"Training Random Forest Classifier on {len(X_train)} samples...")
    clf = RandomForestClassifier(
        n_estimators=50,
        max_depth=8,
        min_samples_split=4,
        n_jobs=1,
        random_state=42,
        class_weight="balanced"
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred).tolist()

    feature_names = [
        "mean_ela", "max_ela", "std_ela", "ela_anomaly_ratio",
        "noise_mean", "noise_std", "noise_inconsistency",
        "copy_move_matches", "color_balance_std", "edge_density"
    ]

    metrics = {
        "model_name": "Random Forest Document Forgery Classifier",
        "model_version": "RF-Forensic-v1.0",
        "trained_date": "2026-08-18",
        "num_training_samples": len(X_train),
        "num_test_samples": len(X_test),
        "accuracy": round(acc * 100.0, 2),
        "precision": round(prec * 100.0, 2),
        "recall": round(rec * 100.0, 2),
        "f1_score": round(f1 * 100.0, 2),
        "confusion_matrix": {
            "true_negatives": cm[0][0],
            "false_positives": cm[0][1],
            "false_negatives": cm[1][0],
            "true_positives": cm[1][1]
        },
        "feature_importances": {
            name: round(float(imp), 4)
            for name, imp in zip(feature_names, clf.feature_importances_)
        }
    }

    os.makedirs(settings.MODELS_DIR, exist_ok=True)
    joblib.dump(clf, settings.MODEL_PATH)
    logger.info(f"Model saved successfully to {settings.MODEL_PATH}")

    metrics_path = os.path.join(settings.MODELS_DIR, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    logger.info(f"Metrics saved to {metrics_path}")

    print("\n" + "="*50)
    print("      MODEL TRAINING & EVALUATION REPORT")
    print("="*50)
    print(f"Accuracy:  {metrics['accuracy']}%")
    print(f"Precision: {metrics['precision']}%")
    print(f"Recall:    {metrics['recall']}%")
    print(f"F1-Score:  {metrics['f1_score']}%")
    print(f"Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")
    print("="*50 + "\n")


if __name__ == "__main__":
    train_model()
