export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/,'');
export const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

export class ApiError extends Error {
  constructor(message,status) { super(message); this.status=status; }
}

export async function api(path,{method='GET',body,signal}={}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`,{
      method, signal,
      headers: body===undefined?{}:{'Content-Type':'application/json'},
      body: body===undefined?undefined:JSON.stringify(body)
    });
  } catch(error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('No se pudo conectar con la API. Revisa que el backend esté encendido.',0);
  }
  const data=await response.json().catch(()=>({}));
  if (!response.ok) throw new ApiError(data.error || `Error HTTP ${response.status}`,response.status);
  return data;
}

export async function askAssistant(body) {
  if (!N8N_WEBHOOK_URL) return api('/ia/demo',{method:'POST',body});
  let response;
  try {
    response=await fetch(N8N_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  } catch {
    throw new ApiError('No se pudo contactar el webhook de n8n. Verifica la URL, la red y CORS.',0);
  }
  let raw;
  try {
    raw=await response.json();
  } catch {
    throw new ApiError(`El webhook de n8n devolvió una respuesta no válida (HTTP ${response.status}).`,response.status);
  }
  const result=Array.isArray(raw)?raw[0]:raw;
  if (!response.ok || !result?.ok) {
    throw new ApiError(result?.error || `El agente no pudo completar la solicitud (HTTP ${response.status}).`,response.status);
  }
  return result;
}
