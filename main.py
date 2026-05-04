from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd

# Load the model at startup
MODEL_PATH = "decision_tree_model .pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
except Exception as e:
    raise RuntimeError(f"Error loading model: {e}")

# Initialize FastAPI app
app = FastAPI(title="Customer Churn Prediction API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Pydantic input model
class ChurnPredictRequest(BaseModel):
    age: float
    gender: int  # 0 for Female, 1 for Male
    tenure: float
    usage_frequency: float
    support_calls: float
    payment_delay: float
    total_spend: float
    last_interaction: float
    sub_premium: int  # 1 if Subscription Type is 'premium', 0 otherwise
    sub_standard: int  # 1 if Subscription Type is 'standard', 0 otherwise
    con_monthly: int  # 1 if Contract Length is 'monthly', 0 otherwise
    con_quarterly: int  # 1 if Contract Length is 'quarterly', 0 otherwise

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Customer Churn Prediction API"}

# Prediction endpoint
@app.post("/predict")
def predict_churn(request: ChurnPredictRequest):
    # Convert request to DataFrame
    data = pd.DataFrame([request.dict()])
    
    # Ensure the order matches the model's training order
    feature_order = [
        'age', 'gender', 'tenure', 'usage_frequency', 'support_calls',
        'payment_delay', 'total_spend', 'last_interaction', 'sub_premium',
        'sub_standard', 'con_monthly', 'con_quarterly'
    ]
    data = data[feature_order]
    
    # Make prediction
    prediction = model.predict(data)[0]
    
    # Return response
    return {"churn_prediction": int(prediction)}
