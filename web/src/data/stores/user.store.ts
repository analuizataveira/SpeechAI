import { LOCAL_STORAGE_KEYS } from '@/domain/constants/local-storage';
import { jwtDecode } from '@/domain/constants/utils';
import { UserMetadata } from '@/domain/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from '../repositories/users/interface';

type Props = {
  user: IUser | null;
  accessToken: string;
  reload: boolean;
};

type ActionsProps = {
  getUser: () => UserMetadata | null;
  copyWith: (data: Partial<Props>) => void;
  reset: () => void;
};

type StoreProps = Props & ActionsProps;

export const useUserStore = create(
  persist<StoreProps>(
    (set, get) => ({
      user: null,
      reload: false,
      accessToken: '',
      copyWith: (props) => set(props),
      getUser: () => (get().accessToken ? (jwtDecode(get().accessToken) as UserMetadata) : null),
      reset: () => set({ user: null, accessToken: '' }),
    }),
    { name: LOCAL_STORAGE_KEYS.user },
  ),
);
