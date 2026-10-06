export async function requestApi<T>(
  path: string,
  init?: RequestInit,
  fetcher: typeof fetch = fetch,
): Promise<T> {
  let response: Response;
  try {
    response = await fetcher(`/api/drivepulse${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Não foi possível conectar. Verifique sua conexão e tente novamente.",
    );
  }
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(
      problem?.detail ||
        problem?.title ||
        "Não foi possível carregar seus dados. Tente novamente.",
    );
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}
export function track(name: string, page: string, metadata?: string) {
  void requestApi("/events", {
    method: "POST",
    body: JSON.stringify({ name, page, metadata }),
  }).catch(() => {
    /* Analytics must not block customer actions. */
  });
}
