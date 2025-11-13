"use client"

import React, { createContext, useContext, useState, type ReactNode } from "react"
import { UsersRepository } from "@/data/repositories/users/repository"
import { AuthRepository } from "@/data/repositories/auth/repository"
import { ICreateUserRequest } from "@/data/repositories/users/interface"
import { IMeResponse } from "@/data/repositories/auth/interface"

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
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    birthDate: string;
    role?: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  }) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authRepository = new AuthRepository();
      
      // Login and get access token
      const loginResponse = await authRepository.login({ email, password });

      if (!loginResponse.success) {
        return false;
      }

      // Get user profile information
      const meResponse = await authRepository.getMe();

      if (meResponse.success) {
        // Type guard: meResponse is IMeResponse & { success: true }
        const userData = meResponse as IMeResponse & { success: true };
        
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
      };

      const response = await usersRepository.createUser(createUserData);

      if (response.success) {
        // Convert backend user to frontend UserProfile
        const birthDate = new Date(response.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        
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
