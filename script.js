// Select DOM elements once, so we can use them throughout the script.
const form = document.getElementById("prediction-form");
const feedback = document.getElementById("feedback");
const loading = document.getElementById("loading");
const predictButton = document.getElementById("predict-button");

// Base API endpoint for the prediction request.
const API_URL = "http://127.0.0.1:8000/predict";

// Show a temporary message to the user.
function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
  feedback.classList.remove("hidden");
}

// Hide the feedback area after a new request.
function hideFeedback() {
  feedback.classList.add("hidden");
}

// Show or hide the loading indicator while waiting for the response.
function setLoading(isLoading) {
  loading.classList.toggle("hidden", !isLoading);
  predictButton.disabled = isLoading;
}

// Validate that every input field has a value before calling the API.
function validateInputs(formData) {
  for (const [key, value] of formData.entries()) {
    if (!value) {
      showFeedback(`Please enter a valid value for ${key}.`, "error");
      return false;
    }
  }
  return true;
}

// Build the request payload from the form values.
function buildPayload(formData) {
  return {
    contract: Number(formData.get("contract")),
    tenure: Number(formData.get("tenure")),
    svc_fiber_optic: Number(formData.get("svc_fiber_optic")),
    pay_electronic_check: Number(formData.get("pay_electronic_check")),
    totalcharges: Number(formData.get("totalcharges")),
    monthlycharges: Number(formData.get("monthlycharges")),
    paperlessbilling: Number(formData.get("paperlessbilling")),
    onlinesecurity: Number(formData.get("onlinesecurity")),
    techsupport: Number(formData.get("techsupport")),
  };
}

// Handle the form submit event and send the data to the API.
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideFeedback();

  const formData = new FormData(form);

  if (!validateInputs(formData)) {
    return;
  }

  const payload = buildPayload(formData);

  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.detail || "API request failed.";
      showFeedback(`Error: ${message}`, "error");
      return;
    }

    const result = await response.json();
    const isChurn = result.prediction === 1;
    const text = isChurn ? "Churn" : "No Churn";

    showFeedback(text, isChurn ? "churn" : "no-churn");
  } catch (error) {
    showFeedback(`Unable to reach the API: ${error.message}`, "error");
  } finally {
    setLoading(false);
  }
});
