from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pickle
import pandas as pd

# -------------------------------
# Load Model
# -------------------------------
MODEL_PATH = "decision_tree_best_features_model.pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
except Exception as e:
    raise RuntimeError(f"Error loading model: {e}")

# -------------------------------
# App Init
# -------------------------------
app = FastAPI(title="Churn Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Selected features used by the model
# -------------------------------
best_features = [
    "contract",
    "tenure",
    "svc_fiber_optic",
    "pay_electronic_check",
    "totalcharges",
    "monthlycharges",
    "paperlessbilling",
    "onlinesecurity",
    "techsupport",
]

# -------------------------------
# Input Schema
# -------------------------------
class Customer(BaseModel):
    contract: int = Field(..., ge=0, le=2, description="Contract type encoded as an integer")
    tenure: float = Field(..., ge=0, description="Customer tenure in months")
    svc_fiber_optic: int = Field(..., ge=0, le=1, description="Service type fiber optic encoded as 0 or 1")
    pay_electronic_check: int = Field(..., ge=0, le=1, description="Payment method electronic check encoded as 0 or 1")
    totalcharges: float = Field(..., ge=0, description="Total charges")
    monthlycharges: float = Field(..., ge=0, description="Monthly charges")
    paperlessbilling: int = Field(..., ge=0, le=1, description="Paperless billing encoded as 0 or 1")
    onlinesecurity: int = Field(..., ge=0, le=1, description="Online security service encoded as 0 or 1")
    techsupport: int = Field(..., ge=0, le=1, description="Tech support service encoded as 0 or 1")

# -------------------------------
# Root
# -------------------------------
@app.get("/")
def home():
    return {"message": "API is running"}

# -------------------------------
# Predict
# -------------------------------
@app.post("/predict")
def predict(data: Customer):
    try:
        # Convert to DataFrame using the selected best features.
        # The model requires exactly these columns in the same order.
        input_df = pd.DataFrame([
            {
                "contract": data.contract,
                "tenure": data.tenure,
                "svc_fiber_optic": data.svc_fiber_optic,
                "pay_electronic_check": data.pay_electronic_check,
                "totalcharges": data.totalcharges,
                "monthlycharges": data.monthlycharges,
                "paperlessbilling": data.paperlessbilling,
                "onlinesecurity": data.onlinesecurity,
                "techsupport": data.techsupport,
            }
        ], columns=best_features)

        # Debug (optional)
        # print("Model expects:", model.feature_names_in_)

        prediction = model.predict(input_df)[0]

        result = "Churn" if int(prediction) == 1 else "No Churn"

        return {
            "prediction": int(prediction),
            "result": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
