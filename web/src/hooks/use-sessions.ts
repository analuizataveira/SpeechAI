import { useState, useEffect } from 'react';
import { SessionsRepository } from '@/data/repositories/sessions/repository';
import { ISessionResponse } from '@/data/repositories/sessions/interface';

export function useSessions() {
  const [sessions, setSessions] = useState<ISessionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionsRepository = new SessionsRepository();

  const extractArray = (data: any): ISessionResponse[] => {
    console.log('🔍 extractArray input:', data);
    
    // The BaseRepository interceptor wraps responses in { success: true, data: {...} }
    // When API returns array directly, interceptor creates: { success: true, data: { success: true, 0: {...}, 1: {...}, length: N } }
    
    // Step 1: Extract the inner data
    let apiResponse = data;
    if (data?.data) {
      apiResponse = data.data;
    }
    
    // Step 2: If it's already an array, return it
    if (Array.isArray(apiResponse)) {
      console.log('✅ Found array directly:', apiResponse.length);
      return apiResponse;
    }
    
    // Step 3: Check if it's an array-like object (has numeric keys)
    if (apiResponse && typeof apiResponse === 'object') {
      // Check for numeric keys or length property
      const keys = Object.keys(apiResponse);
      const numericKeys = keys.filter(k => /^\d+$/.test(k));
      const hasLength = apiResponse.length !== undefined && typeof apiResponse.length === 'number';
      
      if (numericKeys.length > 0 || hasLength) {
        const array: ISessionResponse[] = [];
        const length = apiResponse.length || numericKeys.length;
        
        console.log(`📊 Found array-like object with ${length} items`);
        
        for (let i = 0; i < length; i++) {
          if (apiResponse[i] && typeof apiResponse[i] === 'object') {
            const item = apiResponse[i];
            // Remove non-session properties
            const { success, length: _, ...cleanItem } = item;
            array.push(cleanItem as ISessionResponse);
          }
        }
        
        if (array.length > 0) {
          console.log('✅ Extracted array from array-like object:', array.length);
          return array;
        }
      }
      
      // Step 4: Try to find array in nested data property
      if (apiResponse.data && Array.isArray(apiResponse.data)) {
        console.log('✅ Found array in data property:', apiResponse.data.length);
        return apiResponse.data;
      }
      
      // Step 5: Try to find any array in object values
      const { success, length: _, data: __, ...rest } = apiResponse;
      const values = Object.values(rest);
      for (const value of values) {
        if (Array.isArray(value) && value.length > 0) {
          console.log('✅ Found array in object values:', value.length);
          return value as ISessionResponse[];
        }
      }
    }
    
    console.warn('⚠️ Could not extract array from:', apiResponse);
    return [];
  };

  const fetchMySessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionsRepository.findMySessions();
      console.log('🔍 Raw response from findMySessions:', response);
      
      if (response.success) {
        const sessionsArray = extractArray(response);
        console.log('✅ Extracted sessions array:', sessionsArray.length, 'sessions');
        setSessions(sessionsArray);
      } else {
        console.error('❌ Response not successful:', response);
        setError('Erro ao carregar sessões');
        setSessions([]);
      }
    } catch (err: any) {
      console.error('❌ Error fetching sessions:', err);
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

