// Get the form element
const form = document.getElementById('churnForm');

// Add submit event listener
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect form data
    const formData = new FormData(form);

    // Get values
    const age = parseFloat(formData.get('age'));
    const gender = parseInt(formData.get('gender'));
    const tenure = parseFloat(formData.get('tenure'));
    const usage_frequency = parseFloat(formData.get('usage_frequency'));
    const support_calls = parseFloat(formData.get('support_calls'));
    const payment_delay = parseFloat(formData.get('payment_delay'));
    const total_spend = parseFloat(formData.get('total_spend'));
    const last_interaction = parseFloat(formData.get('last_interaction'));

    // Subscription type
    const subscription = formData.get('subscription');
    const sub_premium = subscription === 'premium' ? 1 : 0;
    const sub_standard = subscription === 'standard' ? 1 : 0;

    // Contract length
    const contract = formData.get('contract');
    const con_monthly = contract === 'monthly' ? 1 : 0;
    const con_quarterly = contract === 'quarterly' ? 1 : 0;

    // Prepare payload
    const payload = {
        age,
        gender,
        tenure,
        usage_frequency,
        support_calls,
        payment_delay,
        total_spend,
        last_interaction,
        sub_premium,
        sub_standard,
        con_monthly,
        con_quarterly
    };

    try {
        // Send POST request
        const response = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        // Display result
        const predictionResult = document.getElementById('predictionResult');
        predictionResult.textContent = Churn Prediction: ;
    } catch (error) {
        // Handle errors
        const predictionResult = document.getElementById('predictionResult');
        predictionResult.textContent = Error: ;
    }
});
