"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

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
  register: (userData: Partial<UserProfile> & { email: string; password: string }) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email && password) {
      const mockUser: UserProfile = {
        id: "1",
        name: "João Silva",
        email,
        age: 25,
        speechDifficulty: "dislalia",
        level: "intermediario",
        sessionsCompleted: 24,
        averageAccuracy: 78,
        wordsCompleted: 156,
        achievements: 7,
      }
      setUser(mockUser)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const register = async (userData: Partial<UserProfile> & { email: string; password: string }): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: UserProfile = {
      id: Date.now().toString(),
      name: userData.name || "Usuário",
      email: userData.email,
      age: userData.age || 18,
      speechDifficulty: userData.speechDifficulty || "dislalia",
      level: "iniciante",
      sessionsCompleted: 0,
      averageAccuracy: 0,
      wordsCompleted: 0,
      achievements: 0,
    }

    setUser(newUser)
    setIsAuthenticated(true)
    return true
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
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
