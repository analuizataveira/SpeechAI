import { useState, useEffect } from 'react';
import { ExerciseListsRepository } from '@/data/repositories/exercise-lists/repository';
import { IExerciseListResponse } from '@/data/repositories/exercise-lists/interface';

export function useExerciseLists() {
  const [exerciseLists, setExerciseLists] = useState<IExerciseListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exerciseListsRepository = new ExerciseListsRepository();

  const extractArray = (data: any): IExerciseListResponse[] => {
    const apiResponse = (data as any).data || data;
    
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }
    
    if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }
    
    // Fallback: Check if apiResponse has array-like properties (legacy support)
    if (apiResponse && typeof apiResponse === 'object') {
      // Check for numeric keys (array-like object from old BaseRepository behavior)
      const keys = Object.keys(apiResponse);
      const numericKeys = keys.filter(k => /^\d+$/.test(k));
      
      if (numericKeys.length > 0 || (apiResponse.length !== undefined && typeof apiResponse.length === 'number')) {
        const array: IExerciseListResponse[] = [];
        const length = apiResponse.length || numericKeys.length;
        
        for (let i = 0; i < length; i++) {
          if (apiResponse[i] && typeof apiResponse[i] === 'object') {
            const item = apiResponse[i];
            const { success, length: _, ...cleanItem } = item;
            array.push(cleanItem as IExerciseListResponse);
          }
        }
        
        if (array.length > 0) {
          return array;
        }
      }
      
      const { success, length: _, ...rest } = apiResponse;
      const values = Object.values(rest);
      for (const value of values) {
        if (Array.isArray(value) && value.length > 0) {
          return value as IExerciseListResponse[];
        }
      }
    }
    
    return [];
  };

  const fetchExerciseLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await exerciseListsRepository.findAll();
      
      // BaseRepository returns { success: true, data: {...} }
      // Check if response is successful
      if (response && (response as any).success !== false) {
        const lists = extractArray(response);
        setExerciseLists(lists);
      } else {
        setError('Erro ao carregar listas de exercícios');
        setExerciseLists([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar listas de exercícios');
      setExerciseLists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await exerciseListsRepository.findMyLists();
      
      // BaseRepository returns { success: true, data: {...} }
      if (response && (response as any).success !== false) {
        const lists = extractArray(response);
        setExerciseLists(lists);
      } else {
        setError('Erro ao carregar suas listas de exercícios');
        setExerciseLists([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar suas listas de exercícios');
      setExerciseLists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExerciseLists();
  }, []);

  return {
    exerciseLists,
    loading,
    error,
    refetch: fetchExerciseLists,
    refetchMyLists: fetchMyLists,
  };
}

export function useExerciseList(exerciseListId: string | null) {
  const [exerciseList, setExerciseList] = useState<IExerciseListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exerciseListsRepository = new ExerciseListsRepository();

  useEffect(() => {
    if (!exerciseListId) {
      setExerciseList(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchExerciseList = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await exerciseListsRepository.findOne(exerciseListId);
        
        // BaseRepository wraps response in { success: true, data: {...} }
        // The actual API response is in response.data
        const apiResponse = (response as any).data || response;
        
        if (apiResponse && (apiResponse.success !== false)) {
          // Extract the actual exercise list data
          // It could be directly in apiResponse or in apiResponse.data
          const exerciseListData = apiResponse.data || apiResponse;
          
          // Remove success property if it exists
          const { success, ...cleanData } = exerciseListData;
          
          setExerciseList(cleanData as IExerciseListResponse);
        } else {
          const errorMessage = apiResponse?.message || 'Erro ao carregar lista de exercícios';
          setError(errorMessage);
          setExerciseList(null);
        }
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao carregar lista de exercícios';
        setError(errorMessage);
        setExerciseList(null);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseList();
  }, [exerciseListId]);

  return { exerciseList, loading, error };
}

