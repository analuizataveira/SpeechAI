"use client"

import { AiExercisesRepository } from "@/data/repositories/ai-exercises/repository"
import { DoctorPatientsRepository } from "@/data/repositories/doctor-patients/repository"
import { useExerciseLists } from "@/hooks/use-exercise-lists"
import { useSessions } from "@/hooks/use-sessions"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/user-provider"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components"
import LogoutIcon from "@/presentation/components/icons/logout-icon"
import Settings from "@/presentation/components/icons/settings"
import { Badge } from "@/presentation/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog"
import { Progress } from "@/presentation/components/ui/progress"
import { Brain, Loader2, Mic, Play, Sparkles, TrendingUp } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"


export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, userRole, logout } = useUser()
  const { toast } = useToast()
  const router = useNavigate()
  const { sessions, loading: sessionsLoading } = useSessions()
  const { exerciseLists, loading: listsLoading } = useExerciseLists()
  const [isGeneratingAiExercises, setIsGeneratingAiExercises] = useState(false)
  const [aiExercisesDialogOpen, setAiExercisesDialogOpen] = useState(false)
  const [generatedExerciseList, _] = useState<any>(null)
  const [patientDoctors, setPatientDoctors] = useState<string[]>([])
  const aiExercisesRepository = new AiExercisesRepository()
  const doctorPatientsRepository = new DoctorPatientsRepository()

  useEffect(() => {
    if (isLoading) return
    
    if (!isAuthenticated) {
      router("/login")
      return
    }
    
    if (userRole === 'DOCTOR') {
      router("/dashboard-doctor")
      return
    }

    // Fetch patient's doctors if user is a patient
    if (userRole === 'PATIENT') {
      const fetchPatientDoctors = async () => {
        try {
          const response = await doctorPatientsRepository.getMyDoctors()
          
          // BaseRepository wraps response in { success: true, data: {...} }
          if (response && (response as any).success !== false) {
            const innerData = (response as any).data || response
            
            // Extract doctors array - handle different response formats
            let doctors: any[] = []
            
            // Case 1: It's already an array
            if (Array.isArray(innerData)) {
              doctors = innerData
            }
            // Case 2: It's an object with numeric keys (BaseRepository format)
            else if (innerData && typeof innerData === 'object') {
              // Check if it has numeric keys (array-like object)
              const keys = Object.keys(innerData).filter(k => k !== 'success')
              const numericKeys = keys.filter(k => /^\d+$/.test(k))
              
              if (numericKeys.length > 0) {
                // Convert object with numeric keys to array
                doctors = numericKeys.map(key => innerData[key]).filter(Boolean)
              } else if (Array.isArray(innerData.data)) {
                doctors = innerData.data
              } else {
                // Try to get values if it's a single object or other structure
                const values = Object.values(innerData).filter(v => v && typeof v === 'object' && 'id' in v)
                if (values.length > 0) {
                  doctors = values as any[]
                }
              }
            }
            
            const doctorIds = doctors.map((doctor: any) => doctor.id).filter(Boolean)
            setPatientDoctors(doctorIds)
          }
        } catch (error) {
          console.error('Error fetching patient doctors:', error)
        }
      }
      fetchPatientDoctors()
    }
  }, [isAuthenticated, isLoading, userRole, router])

  const stats = useMemo(() => {
    if (!Array.isArray(sessions)) {
      return {
        totalSessions: 0,
        avgScore: 0,
        totalWords: 0,
        improvement: 0,
      };
    }
    const completedSessions = sessions.filter(s => s.finishedAt);
    const totalSessions = completedSessions.length;
    const avgScore = completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length)
      : 0;
    const totalWords = completedSessions.reduce((sum, s) => sum + (s.correctItems || 0), 0);
    
    // Calculate improvement (compare last 7 days with previous 7 days)
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const recentSessions = completedSessions.filter(s => 
      new Date(s.finishedAt!) >= lastWeek
    );
    const previousSessions = completedSessions.filter(s => {
      const finished = new Date(s.finishedAt!);
      return finished >= twoWeeksAgo && finished < lastWeek;
    });
    
    const recentAvg = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + (s.score || 0), 0) / recentSessions.length
      : 0;
    const previousAvg = previousSessions.length > 0
      ? previousSessions.reduce((sum, s) => sum + (s.score || 0), 0) / previousSessions.length
      : 0;
    
    const improvement = previousAvg > 0 ? Math.round(recentAvg - previousAvg) : 0;

    return {
      totalSessions,
      avgScore,
      totalWords,
      improvement,
    };
  }, [sessions]);

  const recommendedList = useMemo(() => {
    if (!Array.isArray(exerciseLists) || exerciseLists.length === 0) return null;
    
    if (patientDoctors.length > 0) {
      const filteredLists = exerciseLists.filter(list => 
        list.doctorId && patientDoctors.includes(list.doctorId)
      );
      return filteredLists.length > 0 ? filteredLists[0] : null;
    }

    
    
    return exerciseLists[0];
  }, [exerciseLists, patientDoctors]);

  const handleStartExercise = () => {
    if (recommendedList) {
      router(`/exercise?listId=${recommendedList.id}`)
    } else {
      router("/exercise")
    }
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Logout realizado",
      description: "Até logo! Volte sempre para continuar seus exercícios.",
    })
    router("/")
  }

  const handleGenerateAiExercises = async () => {
    setIsGeneratingAiExercises(true)
    try {
      const response = await aiExercisesRepository.generateExercisesAndCreateList()
      
      // Handle response structure from BaseRepository interceptor
      // Following the same pattern as use-exercise-lists.ts
      if (response && (response as any).success !== false) {
        const innerData = (response as any).data
        
        // Find the exercise list data - it might be nested
        let exerciseListData: any = null
        
        // Case 1: innerData is the exercise list directly (has id and items or title)
        if (innerData && innerData.id && (innerData.items || innerData.title)) {
          exerciseListData = innerData
        }
        // Case 2: innerData.data contains the exercise list
        else if (innerData && innerData.data && innerData.data.id) {
          exerciseListData = innerData.data
        }
        // Case 3: response itself has the data
        else if ((response as any).id && ((response as any).items || (response as any).title)) {
          exerciseListData = response
        }
        
        if (exerciseListData && exerciseListData.id) {
          // Clean the data - remove success property if exists
          const { success, ...cleanData } = exerciseListData as any
          
          toast({
            title: "Exercícios gerados!",
            description: "Exercícios personalizados criados com sucesso pela IA.",
          })
          // Redirect to exercise page with the generated list
          router(`/exercise?listId=${cleanData.id}`)
        } else {
          console.error("Could not extract exercise list data from response:", { 
            response, 
            innerData, 
            exerciseListData 
          })
          throw new Error("Resposta inválida da API: estrutura de dados não reconhecida")
        }
      } else {
        const errorMessage = (response as any)?.message || (response as any)?.friendlyMessage || "Erro ao gerar exercícios"
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error("Error generating AI exercises:", error)
      toast({
        title: "Erro ao gerar exercícios",
        description: error?.message || "Não foi possível gerar exercícios personalizados.",
        variant: "error",
      })
    } finally {
      setIsGeneratingAiExercises(false)
    }
  }

  const handleStartAiExerciseSession = () => {
    if (generatedExerciseList?.id) {
      router(`/exercise?listId=${generatedExerciseList.id}`)
      setAiExercisesDialogOpen(false)
    }
  }


  if (!user || sessionsLoading || listsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SpeechAI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogoutIcon className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Olá, {user.name}! 👋</h1>
          <p className="text-muted-foreground">Pronto para mais uma sessão de exercícios? Você está indo muito bem!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões Completas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.improvement > 0 ? `+${stats.improvement}% de melhoria` : 'Continue praticando!'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}%</div>
              <p className="text-xs text-success">
                {stats.improvement > 0 ? `+${stats.improvement}% de melhoria` : 'Mantenha o foco!'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Palavras Praticadas</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWords}</div>
              <p className="text-xs text-muted-foreground">Palavras praticadas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Start */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  Sessão Recomendada pela IA
                </CardTitle>
                <CardDescription>Baseado no seu perfil e progresso recente</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendedList ? (
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div>
                      <h3 className="font-semibold">{recommendedList.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {recommendedList.items?.length || 0} exercícios • 
                        {recommendedList.diffType?.description && ` ${recommendedList.diffType.description}`}
                      </p>
                      <div className="flex items-center mt-2">
                        <Badge variant="secondary" className="mr-2 capitalize">
                          {recommendedList.difficultyLevel}
                        </Badge>
                        {recommendedList.diffType && (
                          <Badge variant="outline">
                            {recommendedList.diffType.description}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="lg" onClick={handleStartExercise}>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Nenhuma lista de exercícios disponível no momento.
                    </p>
                    <Button size="lg" onClick={handleStartExercise} variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      Ver Exercícios
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Generated Exercises */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  Exercícios Personalizados por IA
                </CardTitle>
                <CardDescription>Gere exercícios personalizados baseados no seu perfil</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-4">
                    A IA analisará sua idade e dificuldades de fala para criar exercícios personalizados especialmente para você.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleGenerateAiExercises}
                    disabled={isGeneratingAiExercises}
                    className="w-full"
                  >
                    {isGeneratingAiExercises ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar Exercícios Personalizados
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Progresso Semanal</CardTitle>
                <CardDescription>Sua evolução nos últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  if (!Array.isArray(sessions)) {
                    return <div className="text-center text-muted-foreground">Carregando dados...</div>;
                  }
                  
                  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                  const now = new Date();
                  const weekProgress = days.map((day, index) => {
                    const dayStart = new Date(now);
                    dayStart.setDate(now.getDate() - (now.getDay() - index));
                    dayStart.setHours(0, 0, 0, 0);
                    const dayEnd = new Date(dayStart);
                    dayEnd.setHours(23, 59, 59, 999);
                    
                    const daySessions = sessions.filter(s => {
                      if (!s.finishedAt) return false;
                      const finished = new Date(s.finishedAt);
                      return finished >= dayStart && finished <= dayEnd;
                    });
                    
                    const avgScore = daySessions.length > 0
                      ? Math.round(daySessions.reduce((sum, s) => sum + (s.score || 0), 0) / daySessions.length)
                      : 0;
                    
                    return { day, score: avgScore, count: daySessions.length };
                  });

                  return (
                    <div className="space-y-4">
                      {weekProgress.map(({ day, score, count }) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="text-sm">{day}-feira</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={score} className="w-24" />
                            <span className="text-sm font-medium">
                              {score > 0 ? `${score}%` : '--'}
                            </span>
                            {count > 0 && (
                              <span className="text-xs text-muted-foreground">({count})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router("/history")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ver Histórico
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router("/settings")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Perfil
                  
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={aiExercisesDialogOpen} onOpenChange={setAiExercisesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              Exercícios Personalizados Gerados
            </DialogTitle>
            <DialogDescription>
              Exercícios criados especialmente para você pela IA
            </DialogDescription>
          </DialogHeader>
          {generatedExerciseList && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{generatedExerciseList.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {generatedExerciseList.items?.length || 0} exercícios • 
                  {generatedExerciseList.diffType?.description && ` ${generatedExerciseList.diffType.description}`}
                </p>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {generatedExerciseList.items?.map((item: any, index: number) => (
                    <Badge key={item.id || index} variant="outline" className="p-2 text-center">
                      {item.exercise?.text || item.text}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiExercisesDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={handleStartAiExerciseSession}>
              <Play className="w-4 h-4 mr-2" />
              Iniciar Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
