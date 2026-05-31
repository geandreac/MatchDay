"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);

  const execute = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await fetcherRef.current(controller.signal);
      if (mountedRef.current && !controller.signal.aborted) {
        setState({ data, loading: false, error: null });
      }
    } catch (err) {
      if ((err as Error).name === "AbortError" || controller.signal.aborted) return;
      if (mountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : "Erro ao carregar dados",
        });
      }
    }
  }, []);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [execute]);

  return { ...state, retry: execute };
}

interface MutationState {
  loading: boolean;
  error: string | null;
}

export function useMutation<T>(
  mutator: (data: T) => Promise<Response>,
) {
  const [state, setState] = useState<MutationState>({ loading: false, error: null });

  async function execute(data: T): Promise<{ ok: boolean; json: unknown }> {
    setState({ loading: true, error: null });
    try {
      const res = await mutator(data);
      const json = await res.json();
      if (!res.ok) {
        const msg = typeof json === "object" && json !== null && "error" in json
          ? String((json as Record<string, unknown>).error)
          : "Erro ao processar requisicao";
        setState({ loading: false, error: msg });
        return { ok: false, json };
      }
      setState({ loading: false, error: null });
      return { ok: true, json };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro de conexao";
      setState({ loading: false, error: msg });
      return { ok: false, json: { error: msg } };
    }
  }

  return { ...state, execute, reset: () => setState({ loading: false, error: null }) };
}
