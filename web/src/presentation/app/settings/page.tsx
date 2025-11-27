"use client"

import { IMeResponse } from "@/data/repositories/auth/interface"
import { AuthRepository } from "@/data/repositories/auth/repository"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/user-provider"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components"
import { Badge } from "@/presentation/components/ui/badge"
import { ArrowLeft, Brain, Calendar, Loader2, Mail, Phone, User } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, logout } = useUser()
  const { toast } = useToast()
  const router = useNavigate()
  const [userData, setUserData] = useState<IMeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return
    
    if (!isAuthenticated) {
      router("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authRepository = new AuthRepository()
        const response = await authRepository.getMe()
        
        if (response.success) {
          setUserData(response as IMeResponse & { success: true })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus dados pessoais.",
          variant: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated, toast])


  const handleBackToDashboard = () => {
    router("/dashboard")
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Logout realizado",
      description: "Até logo! Volte sempre para continuar seus exercícios.",
    })
    router("/")
  }

  // Format date
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Calculate age
  const calculateAge = (birthDate: Date | string) => {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const profile = userData?.patientProfile || userData?.doctorProfile
  const birthDate = profile?.birthDate ? new Date(profile.birthDate) : null
  const age = birthDate ? calculateAge(birthDate) : user?.age || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToDashboard}
              className="text-xs sm:text-sm"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Voltar ao Dashboard</span>
              <span className="sm:hidden">Voltar</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-xs sm:text-sm"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Configurações</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie suas informações pessoais e visualize suas estatísticas
          </p>
        </div>

        {/* Main Content - Full Width Cards */}
        <div className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <Card className="bg-card border-border w-full">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                Informações Pessoais
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Seus dados cadastrais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Nome Completo</label>
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-muted/50 rounded-lg min-h-[44px]">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground truncate">
                      {profile?.name || user?.name || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-muted/50 rounded-lg min-h-[44px]">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground truncate">
                      {userData?.email || user?.email || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Telefone</label>
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-muted/50 rounded-lg min-h-[44px]">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground truncate">
                      {profile?.phone || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-muted/50 rounded-lg min-h-[44px]">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground">
                      {birthDate ? formatDate(birthDate) : 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Idade</label>
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-muted/50 rounded-lg min-h-[44px]">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground">{age} anos</span>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Tipo de Conta</label>
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-muted/50 rounded-lg min-h-[44px]">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <Badge 
                      variant={userData?.role === 'DOCTOR' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {userData?.role === 'DOCTOR' ? 'Médico' : 
                       userData?.role === 'ADMIN' ? 'Administrador' : 'Paciente'}
                    </Badge>
                  </div>
                </div>

                {userData?.doctorProfile?.specialty && (
                  <div className="space-y-1 sm:space-y-2 sm:col-span-2 lg:col-span-3 xl:col-span-4">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Especialidade</label>
                    <div className="flex items-center space-x-2 p-2 sm:p-3 bg-muted/50 rounded-lg min-h-[44px]">
                      <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-foreground">
                        {userData.doctorProfile.specialty}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="bg-card border-border w-full">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                Informações do Perfil
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configurações de aprendizado e progresso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Nível Atual</label>
                  <div className="p-2 sm:p-3 bg-muted/50 rounded-lg min-h-[44px] flex items-center">
                    <Badge variant="outline" className="capitalize text-xs sm:text-sm">
                      {user?.level || 'iniciante'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Dificuldade de Fala</label>
                  <div className="p-2 sm:p-3 bg-muted/50 rounded-lg min-h-[44px] flex items-center">
                    <Badge variant="outline" className="capitalize text-xs sm:text-sm">
                      {user?.speechDifficulty || 'Não informado'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

