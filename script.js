window.runPrediction = async function runPrediction() {
  const get = (id) => document.getElementById(id);
  const btn = get('predictBtn');

  // Collect values
  const age             = parseFloat(get('age').value);
  const gender          = parseInt(get('gender').value);
  const tenure          = parseFloat(get('tenure').value);
  const usage_frequency = parseFloat(get('usage_frequency').value);
  const support_calls   = parseFloat(get('support_calls').value);
  const payment_delay   = parseFloat(get('payment_delay').value);
  const total_spend     = parseFloat(get('total_spend').value);
  const last_interaction = parseFloat(get('last_interaction').value);
  const subscription    = get('subscription').value;
  const contract        = get('contract').value;

  // Validate
  const numericFields = [age, gender, tenure, usage_frequency, support_calls, payment_delay, total_spend, last_interaction];
  if (numericFields.some((v) => isNaN(v)) || !subscription || !contract) {
    showResult('error', 'Missing fields', 'Please fill in all fields before predicting.', 'INCOMPLETE');
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Predicting...';

  // Build payload
  const payload = {
    age,
    gender,
    tenure,
    usage_frequency,
    support_calls,
    payment_delay,
    total_spend,
    last_interaction,
    sub_premium:  subscription === 'premium'  ? 1 : 0,
    sub_standard: subscription === 'standard' ? 1 : 0,
    con_monthly:  contract === 'monthly'      ? 1 : 0,
    con_quarterly: contract === 'quarterly'   ? 1 : 0,
  };

  try {
    const res = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();

    // Flexible response key detection
    const churn =
      data.churn === 1       ||
      data.churn === true    ||
      data.prediction === 1  ||
      data.result === 'churn';

    const prob =
      data.probability !== undefined
        ? `${(data.probability * 100).toFixed(1)}% confidence`
        : '';

    if (churn) {
      showResult('churn', 'High Churn Risk', prob || 'This customer is likely to churn soon.', 'CHURN');
    } else {
      showResult('no-churn', 'Low Churn Risk', prob || 'This customer is likely to stay.', 'RETAINED');
    }
  } catch (err) {
    showResult('error', 'Connection Failed', 'Could not reach the prediction server. Is FastAPI running on port 8000?', 'ERROR');
  }

  // Reset button
  btn.disabled = false;
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="white" stroke-width="1.5"/>
      <path d="M5 7l1.5 1.5L9 5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Predict Churn
  `;
}

window.showResult = function showResult(type, title, sub, label) {
  const area   = document.getElementById('resultArea');
  const banner = document.getElementById('resultBanner');
  const icon   = document.getElementById('resultIcon');
  const t      = document.getElementById('resultTitle');
  const s      = document.getElementById('resultSub');
  const l      = document.getElementById('resultLabel');

  const icons = { churn: '✕', 'no-churn': '✓', error: '!' };

  banner.className   = `result-banner ${type}`;
  icon.textContent   = icons[type] || '?';
  t.textContent      = title;
  s.textContent      = sub;
  l.textContent      = label;

  area.className = 'result-area show';
  area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}