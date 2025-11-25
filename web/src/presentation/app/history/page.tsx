"use client"

import { useSessions } from "@/hooks/use-sessions"
import { useUser } from "@/hooks/user-provider"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components"
import { Badge } from "@/presentation/components/ui/badge"
import { ArrowLeft, Calendar, CheckCircle2, Clock, Loader2, TrendingUp, XCircle } from "lucide-react"
import React, { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"

export default function HistoryPage() {
  const { user, isAuthenticated } = useUser()
  const { sessions, loading, error } = useSessions()
  const router = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      router("/login")
    }
  }, [isAuthenticated, router])

  const { completedSessions, inProgressSessions } = useMemo(() => {
    
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { completedSessions: [], inProgressSessions: [] }
    }

    const completed = sessions
      .filter(s => s.finishedAt)
      .sort((a, b) => {
        const dateA = new Date(a.finishedAt!).getTime()
        const dateB = new Date(b.finishedAt!).getTime()
        return dateB - dateA // Most recent first
      })

    const inProgress = sessions
      .filter(s => !s.finishedAt)
      .sort((a, b) => {
        const dateA = new Date(a.startedAt).getTime()
        const dateB = new Date(b.startedAt).getTime()
        return dateB - dateA // Most recent first
      })

    return { completedSessions: completed, inProgressSessions: inProgress }
  }, [sessions])
  // Calculate statistics
  const stats = useMemo(() => {
    if (completedSessions.length === 0) {
      return {
        totalSessions: 0,
        avgScore: 0,
        totalWords: 0,
        bestScore: 0,
        improvement: 0,
      }
    }

    const totalSessions = completedSessions.length
    const avgScore = Math.round(
      completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions
    )
    const totalWords = completedSessions.reduce((sum, s) => sum + (s.correctItems || 0), 0)
    const bestScore = Math.max(...completedSessions.map(s => s.score || 0))

    // Calculate improvement (last session vs first session)
    const firstSession = completedSessions[completedSessions.length - 1]
    const lastSession = completedSessions[0]
    const improvement = firstSession && lastSession && firstSession !== lastSession
      ? (lastSession.score || 0) - (firstSession.score || 0)
      : 0

    return {
      totalSessions,
      avgScore,
      totalWords,
      bestScore,
      improvement,
    }
  }, [completedSessions])

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" size="sm" onClick={() => router("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-xl font-bold">Histórico de Exercícios</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">Sessões completadas</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Pontuação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.improvement > 0 ? `+${stats.improvement}% de melhoria` : 'Continue praticando!'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Palavras Praticadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWords}</div>
              <p className="text-xs text-muted-foreground">Total de palavras</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Melhor Pontuação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bestScore}%</div>
              <p className="text-xs text-muted-foreground">Sua melhor sessão</p>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        {error && (
          <Card className="bg-card border-border mb-8">
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}


        {completedSessions.length === 0 && inProgressSessions.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma sessão encontrada</h3>
              <p className="text-muted-foreground mb-6">
                Inicie sua primeira sessão de exercícios para ver seu histórico aqui.
              </p>
              <Button onClick={() => router("/dashboard")}>
                Ir para Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* In Progress Sessions */}
            {inProgressSessions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Sessões em Andamento ({inProgressSessions.length})
                </h2>
                <div className="space-y-4">
                  {inProgressSessions.map((session) => {
                    const sessionDate = session.startedAt ? new Date(session.startedAt) : null
                    const score = session.score ?? null
                    const correctItems = session.correctItems || 0

                    return (
                      <Card key={session.id} className="bg-card border-border border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-lg">
                                  Sessão em Andamento
                                </CardTitle>
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                                  Em Progresso
                                </Badge>
                                {score !== null && (
                                  <Badge variant={getScoreBadgeVariant(score)}>
                                    {score}%
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {sessionDate ? formatDate(sessionDate) : 'Data não disponível'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  {correctItems} palavra{correctItems !== 1 ? 's' : ''} praticada{correctItems !== 1 ? 's' : ''}
                                </span>
                              </CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router(`/exercise?listId=${session.exerciseListId}`)}
                            >
                              Continuar
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {score !== null && (
                                  <>
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">Pontuação Atual</p>
                                      <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
                                        {score}%
                                      </p>
                                    </div>
                                    <div className="h-12 w-px bg-border" />
                                  </>
                                )}
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Palavras Praticadas</p>
                                  <p className="text-xl font-semibold">{correctItems}</p>
                                </div>
                                {session.exerciseList?.items && (
                                  <>
                                    <div className="h-12 w-px bg-border" />
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">Total de Exercícios</p>
                                      <p className="text-sm font-medium">
                                        {session.exerciseList.items.length}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Exercise List Info */}
                            {session.exerciseList && (
                              <div className="pt-4 border-t border-border">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-sm font-medium">Lista de Exercícios:</p>
                                  <Badge variant="outline">{session.exerciseList.title}</Badge>
                                  {session.exerciseList.diffType && (
                                    <Badge variant="secondary">
                                      {session.exerciseList.diffType.description}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="capitalize">
                                    {session.exerciseList.difficultyLevel}
                                  </Badge>
                                </div>
                                {session.exerciseList.items && session.exerciseList.items.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Exercícios ({session.exerciseList.items.length}):
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {session.exerciseList.items
                                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                                        .slice(0, 10)
                                        .map((item, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {item.exercise?.text || `Exercício ${idx + 1}`}
                                          </Badge>
                                        ))}
                                      {session.exerciseList.items.length > 10 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{session.exerciseList.items.length - 10} mais
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Completed Sessions */}
            {completedSessions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Sessões Completadas ({completedSessions.length})
                </h2>
                <div className="space-y-4">
                  {completedSessions.map((session) => {
                    const sessionDate = session.finishedAt ? new Date(session.finishedAt) : null
                    const score = session.score || 0
                    const correctItems = session.correctItems || 0

                    return (
                <Card key={session.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            Sessão de Exercícios
                          </CardTitle>
                          <Badge variant={getScoreBadgeVariant(score)}>
                            {score}%
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {sessionDate ? formatDate(sessionDate) : 'Data não disponível'}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {correctItems} palavra{correctItems !== 1 ? 's' : ''} praticada{correctItems !== 1 ? 's' : ''}
                          </span>
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router(`/results?sessionId=${session.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Pontuação</p>
                            <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
                              {score}%
                            </p>
                          </div>
                          <div className="h-12 w-px bg-border" />
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Palavras Corretas</p>
                            <p className="text-xl font-semibold">{correctItems}</p>
                          </div>
                          {session.startedAt && session.finishedAt && (
                            <>
                              <div className="h-12 w-px bg-border" />
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Duração</p>
                                <p className="text-sm font-medium">
                                  {Math.round(
                                    (new Date(session.finishedAt).getTime() - 
                                     new Date(session.startedAt).getTime()) / 1000 / 60
                                  )} min
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Exercise List Info */}
                      {session.exerciseList && (
                        <div className="pt-4 border-t border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-medium">Lista de Exercícios:</p>
                            <Badge variant="outline">{session.exerciseList.title}</Badge>
                            {session.exerciseList.diffType && (
                              <Badge variant="secondary">
                                {session.exerciseList.diffType.description}
                              </Badge>
                            )}
                            <Badge variant="outline" className="capitalize">
                              {session.exerciseList.difficultyLevel}
                            </Badge>
                          </div>
                          {session.exerciseList.items && session.exerciseList.items.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-2">
                                Exercícios praticados ({session.exerciseList.items.length}):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {session.exerciseList.items
                                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                                  .slice(0, 10)
                                  .map((item, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {item.exercise?.text || `Exercício ${idx + 1}`}
                                    </Badge>
                                  ))}
                                {session.exerciseList.items.length > 10 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{session.exerciseList.items.length - 10} mais
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

