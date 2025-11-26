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
        console.log('Exercise list raw response:', response);
        
        // BaseRepository wraps response in { success: true, data: {...} }
        // The actual API response is in response.data
        if (response && (response as any).success !== false) {
          const innerData = (response as any).data;
          console.log('Exercise list inner data:', innerData);
          
          // Find the exercise list data - it might be nested
          let exerciseListData: IExerciseListResponse | null = null;
          
          // Case 1: innerData is the exercise list directly (has id and items)
          if (innerData && innerData.id && (innerData.items || innerData.title)) {
            exerciseListData = innerData;
          }
          // Case 2: innerData.data contains the exercise list
          else if (innerData && innerData.data && innerData.data.id) {
            exerciseListData = innerData.data;
          }
          // Case 3: response itself has the data
          else if ((response as any).id && ((response as any).items || (response as any).title)) {
            exerciseListData = response as any;
          }
          
          if (exerciseListData) {
            // Clean the data - remove success property if exists
            const { success, ...cleanData } = exerciseListData as any;
            console.log('Exercise list clean data:', cleanData);
            console.log('Exercise list items:', cleanData.items);
            setExerciseList(cleanData as IExerciseListResponse);
          } else {
            console.error('Could not extract exercise list data from response');
            setError('Erro ao processar lista de exercícios');
            setExerciseList(null);
          }
        } else {
          const errorMessage = (response as any)?.message || 'Erro ao carregar lista de exercícios';
          setError(errorMessage);
          setExerciseList(null);
        }
      } catch (err: any) {
        console.error('Error fetching exercise list:', err);
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

