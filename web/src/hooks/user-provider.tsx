"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { UsersRepository } from "@/data/repositories/users/repository"
import { AuthRepository } from "@/data/repositories/auth/repository"
import { ICreateUserRequest } from "@/data/repositories/users/interface"
import { IMeResponse } from "@/data/repositories/auth/interface"
import { LOCAL_STORAGE_KEYS } from "@/domain/constants/local-storage"

interface UserProfile {
  id: string
  name: string
  email: string
  age: number
  speechDifficulty: "dislalia" | "gagueira" | "apraxia" | "outro"
  level: "iniciante" | "intermediario" | "avancado"
  sessionsCompleted: number
  averageAccuracy: number
  wordsCompleted: number
  achievements: number
}

interface UserContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  userRole: 'PATIENT' | 'DOCTOR' | 'ADMIN' | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    birthDate: string;
    role?: 'PATIENT' | 'DOCTOR' | 'ADMIN';
    specialty?: string;
  }) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN' | null>(null)

  const loadUserFromToken = useCallback(async () => {
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.accessToken)
      if (!token) {
        setIsLoading(false)
        return
      }

      const authRepository = new AuthRepository()
      const meResponse = await authRepository.getMe()

      if (meResponse && meResponse.success !== false) {
        // Extract the actual user data from nested structure
        let userData: IMeResponse | null = null
        const innerMeData = (meResponse as any).data
        
        if (innerMeData && innerMeData.id) {
          userData = innerMeData as IMeResponse
        } else if ((meResponse as any).id) {
          userData = meResponse as unknown as IMeResponse
        }
        
        if (userData) {
          // Convert backend user to frontend UserProfile
          const birthDate = userData.patientProfile?.birthDate 
            ? new Date(userData.patientProfile.birthDate)
            : userData.doctorProfile?.birthDate
            ? new Date(userData.doctorProfile.birthDate)
            : new Date()
          
          const age = new Date().getFullYear() - birthDate.getFullYear()
          const profile = userData.patientProfile || userData.doctorProfile

          const userProfile: UserProfile = {
            id: userData.id,
            name: profile?.name || 'Usuário',
            email: userData.email,
            age,
            speechDifficulty: "dislalia", // Default, can be updated later
            level: "iniciante",
            sessionsCompleted: 0,
            averageAccuracy: 0,
            wordsCompleted: 0,
            achievements: 0,
          }

          setUser(userProfile)
          setIsAuthenticated(true)
          setUserRole(userData.role as 'PATIENT' | 'DOCTOR' | 'ADMIN')
        }
      }
    } catch (error) {
      console.error('Error loading user from token:', error)
      // If token is invalid, clear it
      localStorage.removeItem(LOCAL_STORAGE_KEYS.accessToken)
      localStorage.removeItem(LOCAL_STORAGE_KEYS.refreshToken)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check for existing token on mount
  useEffect(() => {
    loadUserFromToken()
  }, [loadUserFromToken])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authRepository = new AuthRepository();
      
      // Login and get access token
      const loginResponse = await authRepository.login({ email, password });

      // Handle nested response from BaseRepository interceptor
      // Response format: { success: true, data: { success: true, access_token: ... } }
      if (!loginResponse || loginResponse.success === false) {
        console.error('Login failed - no response or success is false');
        return false;
      }

      // Check inner success (from the actual API response)
      const innerData = (loginResponse as any).data;
      if (innerData && innerData.success === false) {
        console.error('Login failed - inner success is false');
        return false;
      }

      // Get user profile information
      const meResponse = await authRepository.getMe();

      // Handle nested response
      if (meResponse && meResponse.success !== false) {
        // Extract the actual user data from nested structure
        let userData: IMeResponse | null = null;
        const innerMeData = (meResponse as any).data;
        
        if (innerMeData && innerMeData.id) {
          userData = innerMeData as IMeResponse;
        } else if ((meResponse as any).id) {
          userData = meResponse as unknown as IMeResponse;
        }
        
        if (!userData) {
          console.error('Could not extract user data from me response');
          return false;
        }
        
        // Convert backend user to frontend UserProfile
        const birthDate = userData.patientProfile?.birthDate 
          ? new Date(userData.patientProfile.birthDate)
          : userData.doctorProfile?.birthDate
          ? new Date(userData.doctorProfile.birthDate)
          : new Date();
        
        const age = new Date().getFullYear() - birthDate.getFullYear();
        const profile = userData.patientProfile || userData.doctorProfile;

        const userProfile: UserProfile = {
          id: userData.id,
          name: profile?.name || 'Usuário',
          email: userData.email,
          age,
          speechDifficulty: "dislalia", // Default, can be updated later
          level: "iniciante",
          sessionsCompleted: 0,
          averageAccuracy: 0,
          wordsCompleted: 0,
          achievements: 0,
        };

        setUser(userProfile);
        setIsAuthenticated(true);
        setUserRole(userData.role as 'PATIENT' | 'DOCTOR' | 'ADMIN');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    birthDate: string;
    role?: 'PATIENT' | 'DOCTOR' | 'ADMIN';
    specialty?: string;
  }): Promise<boolean> => {
    try {
      const usersRepository = new UsersRepository();
      
      const createUserData: ICreateUserRequest = {
        email: userData.email,
        password: userData.password,
        role: userData.role || 'PATIENT',
        name: userData.name,
        birthDate: userData.birthDate,
        phone: userData.phone,
        specialty: userData.specialty,
      };

      const response = await usersRepository.createUser(createUserData);

      if (response.success) {
        // Convert backend user to frontend UserProfile
        const birthDate = new Date(response.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        const role = userData.role || 'PATIENT';
        
        const newUser: UserProfile = {
          id: response.id,
          name: response.name,
          email: response.email,
          age,
          speechDifficulty: "dislalia", // Default, can be updated later
          level: "iniciante",
          sessionsCompleted: 0,
          averageAccuracy: 0,
          wordsCompleted: 0,
          achievements: 0,
        };

        setUser(newUser);
        setIsAuthenticated(true);
        setUserRole(role);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const authRepository = new AuthRepository();
      await authRepository.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        userRole,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
