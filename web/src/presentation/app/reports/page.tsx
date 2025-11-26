import React, { useState, useEffect } from 'react';
import { useSessions } from '@/hooks/use-sessions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Progress } from '@/presentation/components/ui/progress';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Filter,
  Eye,
  Loader2,
} from 'lucide-react';
import { Button } from '@/presentation/components';
import { Badge } from '@/presentation/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { ReportsRepository } from '@/data/repositories/reports/repository';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/user-provider';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { sessions, loading } = useSessions();
  const { toast } = useToast();
  const { user } = useUser();
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const reportsRepository = new ReportsRepository();

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
    const avgScore =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
              completedSessions.length,
          )
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
        const response = await reportsRepository.getPatientReport('me');
        if (response.success && response.data) {
          setReportData(response.data);
        }
      } catch (error) {
        // Silently fail - report data is optional
        console.error('Failed to load report data:', error);
      }
    };
    loadReportData();
  }, []);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const blob = await reportsRepository.downloadPatientReportPdf('me');

      if (!(blob instanceof Blob)) {
        throw new Error('Resposta inválida: o arquivo não é um blob válido');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${user?.name || 'paciente'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      toast({
        title: 'Relatório baixado!',
        description: 'O PDF foi baixado com sucesso.',
      });
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast({
        title: 'Erro ao baixar relatório',
        description: error?.message || 'Não foi possível baixar o relatório.',
        variant: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateReport = async (type: 'weekly' | 'progress' | 'custom') => {
    setIsDownloading(true);
    try {
      const blob = await reportsRepository.downloadPatientReportPdf('me');

      // Validate that we have a valid Blob
      if (!(blob instanceof Blob)) {
        throw new Error('Resposta inválida: o arquivo não é um blob válido');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const typeNames = {
        weekly: 'semanal',
        progress: 'progresso',
        custom: 'personalizado',
      };
      a.download = `relatorio-${typeNames[type]}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up after a short delay to ensure download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      toast({
        title: 'Relatório gerado!',
        description: `Relatório ${typeNames[type]} baixado com sucesso.`,
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: error?.message || 'Não foi possível gerar o relatório.',
        variant: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className='bg-background flex min-h-screen items-center justify-center'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='bg-background min-h-screen'>
      {/* Header */}
      <header className='border-border bg-card/50 border-b backdrop-blur-sm'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Button variant='ghost' size='sm' onClick={() => navigate('/dashboard')}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Voltar
              </Button>
              <h1 className='text-xl font-semibold'>Relatórios e Histórico</h1>
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm'>
                <Filter className='mr-2 h-4 w-4' />
                Filtrar
              </Button>
              <Button size='sm' onClick={handleDownloadReport} disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className='mr-2 h-4 w-4' />
                    Exportar Tudo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Summary Cards */}
        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-lg'>Progresso Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-primary mb-2 text-3xl font-bold'>{stats.avgScore}%</div>
              <p className='text-muted-foreground mb-4 text-sm'>Precisão média atual</p>
              <Progress value={stats.avgScore} className='mb-2' />
              <p className='text-success text-xs'>
                {stats.totalSessions > 0
                  ? `${stats.totalSessions} sessões completas`
                  : 'Nenhuma sessão ainda'}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-lg'>Sessões Completas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-accent mb-2 text-3xl font-bold'>{stats.totalSessions}</div>
              <p className='text-muted-foreground mb-4 text-sm'>Total de exercícios</p>
              <div className='text-muted-foreground flex items-center text-xs'>
                <Calendar className='mr-1 h-3 w-3' />
                {recentSessions.length > 0
                  ? `Última: ${new Date(recentSessions[0].finishedAt!).toLocaleDateString('pt-BR')}`
                  : 'Nenhuma sessão ainda'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='text-lg'>Tempo Praticado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-warning mb-2 text-3xl font-bold'>{stats.timePracticed}</div>
              <p className='text-muted-foreground mb-4 text-sm'>Tempo total de prática</p>
              <div className='text-muted-foreground flex items-center text-xs'>
                <TrendingUp className='mr-1 h-3 w-3' />
                Média: {stats.avgTimePerSession}min/sessão
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className='bg-card border-border'>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>Histórico completo das suas sessões e progresso</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className='py-8 text-center'>
                <p className='text-muted-foreground mb-4'>
                  Nenhuma sessão concluída ainda. Complete uma sessão para ver os relatórios aqui.
                </p>
                <Button onClick={() => navigate('/dashboard')}>Ir para Dashboard</Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {recentSessions.map(session => {
                  const finishedDate = new Date(session.finishedAt!);
                  const monthName = finishedDate.toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={session.id}
                      className='border-border flex items-center justify-between rounded-lg border p-4'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                          <FileText className='text-primary h-5 w-5' />
                        </div>
                        <div>
                          <h3 className='font-medium'>Sessão - {monthName}</h3>
                          <p className='text-muted-foreground text-sm'>
                            {session.correctItems || 0} itens • {session.score || 0}% precisão •
                            Realizada em {finishedDate.toLocaleDateString('pt-BR')}
                          </p>
                          <div className='mt-1 flex items-center space-x-2'>
                            <Badge variant='secondary'>Sessão</Badge>
                            <Badge variant='outline'>Concluída</Badge>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => navigate(`/results?sessionId=${session.id}`)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={handleDownloadReport}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <>
                              <Download className='mr-2 h-4 w-4' />
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
        <Card className='bg-card border-border mt-8'>
          <CardHeader>
            <CardTitle>Gerar Novo Relatório</CardTitle>
            <CardDescription>Crie relatórios personalizados do seu progresso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-3'>
              <Button
                variant='outline'
                className='h-20 flex-col bg-transparent'
                onClick={() => handleGenerateReport('weekly')}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className='mb-2 h-6 w-6 animate-spin' />
                ) : (
                  <Calendar className='mb-2 h-6 w-6' />
                )}
                <span>Relatório Semanal</span>
              </Button>
              <Button
                variant='outline'
                className='h-20 flex-col bg-transparent'
                onClick={() => handleGenerateReport('progress')}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className='mb-2 h-6 w-6 animate-spin' />
                ) : (
                  <TrendingUp className='mb-2 h-6 w-6' />
                )}
                <span>Análise de Progresso</span>
              </Button>
              <Button
                variant='outline'
                className='h-20 flex-col bg-transparent'
                onClick={() => handleGenerateReport('custom')}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className='mb-2 h-6 w-6 animate-spin' />
                ) : (
                  <FileText className='mb-2 h-6 w-6' />
                )}
                <span>Relatório Personalizado</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
