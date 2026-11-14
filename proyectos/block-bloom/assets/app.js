import { API_URL } from './config.js';
const form = document.querySelector('#order-form');
const status = document.querySelector('#status');
let attempt;
form.addEventListener('input', () => { attempt = undefined; });
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  if (API_URL.includes('example.com')) {
    status.textContent = 'Los pedidos todavía no están habilitados. Volvé pronto.';
    return;
  }
  const button = form.querySelector('button');
  button.disabled = true;
  status.textContent = 'Enviando tu idea…';
  // Conserva clave y código al reintentar después de un error de red.
  attempt ??= { id: crypto.randomUUID(), linkCode: crypto.randomUUID() };
  const data = Object.fromEntries(new FormData(form));
  data.budget = Number(data.budget);
  data.consent = data.consent === 'on';
  data.linkCode = attempt.linkCode;
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attempt.id },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No pudimos enviar el pedido.');
    status.textContent = `Solicitud guardada: ${result.orderId}\nEntrá al servidor y usá /vincular codigo:${attempt.linkCode}\nEl código vence en 24 horas. Guardalo y no lo compartas. Tu solicitud queda pendiente de revisión.`;
    form.reset();
    attempt = undefined;
  } catch (error) {
    status.textContent = `${error.message}\nPodés reintentar sin modificar el formulario para evitar duplicados.`;
  } finally { button.disabled = false; }
});
