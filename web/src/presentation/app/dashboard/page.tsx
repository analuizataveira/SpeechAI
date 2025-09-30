"use client"

import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/user-provider"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components"
import LogoutIcon from "@/presentation/components/icons/logout-icon"
import Settings from "@/presentation/components/icons/settings"
import { Badge } from "@/presentation/components/ui/badge"
import { Progress } from "@/presentation/components/ui/progress"
import { Award, Brain, FileText, Mic, Play, TrendingUp } from "lucide-react"
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"


export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useUser()
  const { toast } = useToast()
  const router = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      router("/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logout realizado",
      description: "Até logo! Volte sempre para continuar seus exercícios.",
    })
    router("/")
  }

  const handleStartExercise = () => {
    router("/exercise")
  }

  if (!user) {
    return <div>Carregando...</div>
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
              <div className="text-2xl font-bold">{user.sessionsCompleted}</div>
              <p className="text-xs text-muted-foreground">+3 desde a semana passada</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.averageAccuracy}%</div>
              <p className="text-xs text-success">+12% de melhoria</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Palavras Praticadas</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.wordsCompleted}</div>
              <p className="text-xs text-muted-foreground">Diferentes palavras</p>
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
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div>
                    <h3 className="font-semibold">Exercício de Consoantes</h3>
                    <p className="text-sm text-muted-foreground">Foco em sons /r/ e /l/ • 15 palavras • ~10 min</p>
                    <div className="flex items-center mt-2">
                      <Badge variant="secondary" className="mr-2 capitalize">
                        {user.speechDifficulty}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        Nível {user.level}
                      </Badge>
                    </div>
                  </div>
                  <Button size="lg" onClick={handleStartExercise}>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Segunda-feira</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-24" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Terça-feira</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={72} className="w-24" />
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quarta-feira</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={90} className="w-24" />
                      <span className="text-sm font-medium">90%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quinta-feira</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={78} className="w-24" />
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sexta-feira</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={88} className="w-24" />
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sessão concluída</p>
                    <p className="text-xs text-muted-foreground">Há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nova conquista</p>
                    <p className="text-xs text-muted-foreground">Ontem</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Relatório gerado</p>
                    <p className="text-xs text-muted-foreground">2 dias atrás</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
