import { useEffect, useState } from 'react';
import {
  fetchResourceHistory,
  type ResourceHistoryPoint,
} from '@/lib/api';

type State = {
  points: ResourceHistoryPoint[];
  loading: boolean;
  error?: string;
};

export const useResourceHistory = (code: string | undefined) => {
  const [state, setState] = useState<State>({
    points: [],
    loading: true,
  });

  useEffect(() => {
    if (!code) {
      setState({
        points: [],
        loading: false,
      });
      return;
    }

    let mounted = true;
    setState((prev) => ({ ...prev, loading: true }));

    fetchResourceHistory(code)
      .then((points) => {
        if (!mounted) return;
        setState({ points, loading: false });
      })
      .catch((error) => {
        console.error('Failed to load history', error);
        if (!mounted) return;
        setState({
          points: [],
          loading: false,
          error: 'No fue posible cargar el historial.',
        });
      });

    return () => {
      mounted = false;
    };
  }, [code]);

  return state;
};
