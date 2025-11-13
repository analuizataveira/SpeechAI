"use client"

import React from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/user-provider"
import { useSessions } from "@/hooks/use-sessions"
import { useExerciseLists } from "@/hooks/use-exercise-lists"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components"
import LogoutIcon from "@/presentation/components/icons/logout-icon"
import Settings from "@/presentation/components/icons/settings"
import { Badge } from "@/presentation/components/ui/badge"
import { Progress } from "@/presentation/components/ui/progress"
import { Award, Brain, FileText, Mic, Play, TrendingUp, Loader2 } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"


export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useUser()
  const { toast } = useToast()
  const router = useNavigate()
  const { sessions, loading: sessionsLoading } = useSessions()
  const { exerciseLists, loading: listsLoading } = useExerciseLists()

  useEffect(() => {
    if (!isAuthenticated) {
      router("/login")
    }
  }, [isAuthenticated, router])

  // Calculate statistics from sessions
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

  // Get recommended exercise list (first available or most recent)
  const recommendedList = useMemo(() => {
    if (!Array.isArray(exerciseLists) || exerciseLists.length === 0) return null;
    return exerciseLists[0]; // You can add logic to select based on user profile
  }, [exerciseLists]);

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.achievements}</div>
              <p className="text-xs text-muted-foreground">Medalhas desbloqueadas</p>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router("/reports")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </Button>
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

            {/* Achievements */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Conquistas Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Primeira Semana</p>
                    <p className="text-xs text-muted-foreground">7 dias consecutivos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Precisão Alta</p>
                    <p className="text-xs text-muted-foreground">85% de acertos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
