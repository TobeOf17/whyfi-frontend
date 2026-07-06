const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function calculateScenario(input) {
  const response = await fetch(`${API_BASE}/api/v1/scenarios/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || 'Calculation failed.');
  }
  return response.json();
}