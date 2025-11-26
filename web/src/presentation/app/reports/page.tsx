import React, { useState, useEffect } from "react"
import { useSessions } from "@/hooks/use-sessions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { Progress } from "@/presentation/components/ui/progress"
import { FileText, Download, Calendar, TrendingUp, ArrowLeft, Filter, Eye, Loader2 } from "lucide-react"
import { Button } from "@/presentation/components"
import { Badge } from "@/presentation/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { useMemo } from "react"
import { ReportsRepository } from "@/data/repositories/reports/repository"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/user-provider"

export default function ReportsPage() {
  const navigate = useNavigate()
  const { sessions, loading } = useSessions()
  const { toast } = useToast()
  const { user } = useUser()
  const [isDownloading, setIsDownloading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const reportsRepository = new ReportsRepository()

  const stats = useMemo(() => {
    if (!Array.isArray(sessions)) {
      return {
        totalSessions: 0,
        avgScore: 0,
        timePracticed: '0.0h',
        avgTimePerSession: 0,
      };
    }
    const completedSessions = sessions.filter(s => s.finishedAt);
    const totalSessions = completedSessions.length;
    const avgScore = completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length)
      : 0;
    
    // Calculate total time (estimate 10 minutes per session)
    const totalMinutes = totalSessions * 10;
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const timePracticed = `${totalHours}.${Math.floor(remainingMinutes / 6)}h`;
    const avgTimePerSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    return {
      totalSessions,
      avgScore,
      timePracticed,
      avgTimePerSession,
    };
  }, [sessions]);

  const recentSessions = useMemo(() => {
    if (!Array.isArray(sessions)) {
      return [];
    }
    return sessions
      .filter(s => s.finishedAt)
      .sort((a, b) => {
        const dateA = new Date(a.finishedAt!).getTime();
        const dateB = new Date(b.finishedAt!).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [sessions]);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const response = await reportsRepository.getPatientReport('me')
        if (response.success && response.data) {
          setReportData(response.data)
        }
      } catch (error) {
        // Silently fail - report data is optional
        console.error('Failed to load report data:', error)
      }
    }
    loadReportData()
  }, [])

  const handleDownloadReport = async () => {
    setIsDownloading(true)
    try {
      const blob = await reportsRepository.downloadPatientReportPdf('me')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${user?.name || 'paciente'}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        title: "Relatório baixado!",
        description: "O PDF foi baixado com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao baixar relatório",
        description: error?.message || "Não foi possível baixar o relatório.",
        variant: "error",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleGenerateReport = async (type: 'weekly' | 'progress' | 'custom') => {
    setIsDownloading(true)
    try {
      const blob = await reportsRepository.downloadPatientReportPdf('me')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const typeNames = {
        weekly: 'semanal',
        progress: 'progresso',
        custom: 'personalizado'
      }
      a.download = `relatorio-${typeNames[type]}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        title: "Relatório gerado!",
        description: `Relatório ${typeNames[type]} baixado com sucesso.`,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao gerar relatório",
        description: error?.message || "Não foi possível gerar o relatório.",
        variant: "error",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  if (loading) {
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold">Relatórios e Histórico</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button size="sm" onClick={handleDownloadReport} disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Tudo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Progresso Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{stats.avgScore}%</div>
              <p className="text-sm text-muted-foreground mb-4">Precisão média atual</p>
              <Progress value={stats.avgScore} className="mb-2" />
              <p className="text-xs text-success">
                {stats.totalSessions > 0 ? `${stats.totalSessions} sessões completas` : 'Nenhuma sessão ainda'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Sessões Completas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent mb-2">{stats.totalSessions}</div>
              <p className="text-sm text-muted-foreground mb-4">Total de exercícios</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                {recentSessions.length > 0 
                  ? `Última: ${new Date(recentSessions[0].finishedAt!).toLocaleDateString('pt-BR')}`
                  : 'Nenhuma sessão ainda'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Tempo Praticado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning mb-2">{stats.timePracticed}</div>
              <p className="text-sm text-muted-foreground mb-4">Tempo total de prática</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mr-1" />
                Média: {stats.avgTimePerSession}min/sessão
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>Histórico completo das suas sessões e progresso</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Nenhuma sessão concluída ainda. Complete uma sessão para ver os relatórios aqui.
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  Ir para Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSessions.map((session) => {
                  const finishedDate = new Date(session.finishedAt!);
                  const monthName = finishedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                  
                  return (
                    <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Sessão - {monthName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.correctItems || 0} itens • {session.score || 0}% precisão • Realizada em {finishedDate.toLocaleDateString('pt-BR')}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">Sessão</Badge>
                            <Badge variant="outline">Concluída</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/results?sessionId=${session.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleDownloadReport}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Baixar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate New Report */}
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <CardTitle>Gerar Novo Relatório</CardTitle>
            <CardDescription>Crie relatórios personalizados do seu progresso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col bg-transparent"
                onClick={() => handleGenerateReport('weekly')}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-6 h-6 mb-2 animate-spin" />
                ) : (
                  <Calendar className="w-6 h-6 mb-2" />
                )}
                <span>Relatório Semanal</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col bg-transparent"
                onClick={() => handleGenerateReport('progress')}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-6 h-6 mb-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-6 h-6 mb-2" />
                )}
                <span>Análise de Progresso</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col bg-transparent"
                onClick={() => handleGenerateReport('custom')}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-6 h-6 mb-2 animate-spin" />
                ) : (
                  <FileText className="w-6 h-6 mb-2" />
                )}
                <span>Relatório Personalizado</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
