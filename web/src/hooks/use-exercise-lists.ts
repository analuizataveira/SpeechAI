import { useState, useEffect } from 'react';
import { ExerciseListsRepository } from '@/data/repositories/exercise-lists/repository';
import { IExerciseListResponse } from '@/data/repositories/exercise-lists/interface';

export function useExerciseLists() {
  const [exerciseLists, setExerciseLists] = useState<IExerciseListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exerciseListsRepository = new ExerciseListsRepository();

  const extractArray = (data: any): IExerciseListResponse[] => {
    if (Array.isArray(data)) {
      return data;
    } 
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data.length !== undefined && typeof data.length === 'number') {
      const array: IExerciseListResponse[] = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i] && typeof data[i] === 'object') {
          array.push(data[i]);
        }
      }
      return array;
    }
    const { success, ...rest } = data;
    const values = Object.values(rest);
    if (values.length > 0 && Array.isArray(values[0])) {
      return values[0] as IExerciseListResponse[];
    }
    return [];
  };

  const fetchExerciseLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await exerciseListsRepository.findAll();
      if (response.success) {
        setExerciseLists(extractArray(response));
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
      if (response.success) {
        setExerciseLists(extractArray(response));
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
      return;
    }

    const fetchExerciseList = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await exerciseListsRepository.findOne(exerciseListId);
        if (response.success) {
          setExerciseList(response as IExerciseListResponse & { success: true });
        } else {
          setError('Erro ao carregar lista de exercícios');
        }
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar lista de exercícios');
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseList();
  }, [exerciseListId]);

  return { exerciseList, loading, error };
}

