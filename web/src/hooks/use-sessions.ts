import { useState, useEffect } from 'react';
import { SessionsRepository } from '@/data/repositories/sessions/repository';
import { ISessionResponse } from '@/data/repositories/sessions/interface';

export function useSessions() {
  const [sessions, setSessions] = useState<ISessionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionsRepository = new SessionsRepository();

  const fetchMySessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionsRepository.findMySessions();
      if (response.success) {
        // The response is ISessionResponse[] & { success: true }
        // When the backend returns an array, the interceptor spreads it
        // So we need to check if response itself is an array or extract it
        const sessionsData = response as any;
        
        // If it's already an array, use it directly
        if (Array.isArray(sessionsData)) {
          setSessions(sessionsData);
        } 
        // If it has a data property that's an array
        else if (sessionsData.data && Array.isArray(sessionsData.data)) {
          setSessions(sessionsData.data);
        }
        // If the array was spread into numeric properties (0, 1, 2, etc.)
        else if (sessionsData.length !== undefined && typeof sessionsData.length === 'number') {
          const sessionsArray: ISessionResponse[] = [];
          for (let i = 0; i < sessionsData.length; i++) {
            if (sessionsData[i] && typeof sessionsData[i] === 'object') {
              sessionsArray.push(sessionsData[i]);
            }
          }
          setSessions(sessionsArray);
        }
        // Fallback: try to extract any array-like structure
        else {
          // Remove 'success' and other non-array properties, then check remaining
          const { success, ...rest } = sessionsData;
          const values = Object.values(rest);
          if (values.length > 0 && Array.isArray(values[0])) {
            setSessions(values[0] as ISessionResponse[]);
          } else {
            setSessions([]);
          }
        }
      } else {
        setError('Erro ao carregar sessões');
        setSessions([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar sessões');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySessions();
  }, []);

  return {
    sessions,
    loading,
    error,
    refetch: fetchMySessions,
  };
}

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<ISessionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionsRepository = new SessionsRepository();

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      return;
    }

    const fetchSession = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await sessionsRepository.findOne(sessionId);
        if (response.success) {
          setSession(response as ISessionResponse & { success: true });
        } else {
          setError('Erro ao carregar sessão');
        }
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar sessão');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  return { session, loading, error };
}

