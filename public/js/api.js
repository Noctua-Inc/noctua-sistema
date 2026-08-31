const API_BASE_URL = "/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.erro || `Erro ${response.status} ao comunicar com o servidor.`);
  }

  return data;
}

const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
};