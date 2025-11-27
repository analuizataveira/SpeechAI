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
  Eye,
  Loader2,
} from 'lucide-react';
import { Button } from '@/presentation/components';
import { Badge } from '@/presentation/components/ui/badge';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { ReportsRepository } from '@/data/repositories/reports/repository';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/user-provider';
import { SessionsRepository } from '@/data/repositories/sessions/repository';
import { ISessionResponse } from '@/data/repositories/sessions/interface';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { sessions: mySessions, loading: mySessionsLoading } = useSessions();
  const { toast } = useToast();
  const { user } = useUser();
  const [isDownloading, setIsDownloading] = useState(false);
  const [sessions, setSessions] = useState<ISessionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const reportsRepository = new ReportsRepository();
  const sessionsRepository = new SessionsRepository();

  // Função para extrair array de sessões da resposta (mesma lógica do useSessions)
  const extractArray = (data: unknown): ISessionResponse[] => {
    // Extrair inner data do BaseRepository response
    const apiResponse = (data as { data?: unknown })?.data || data;

    // Se já é um array, retornar
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }

    // Verificar se é um objeto array-like com chaves numéricas
    if (apiResponse && typeof apiResponse === 'object' && apiResponse !== null) {
      const keys = Object.keys(apiResponse);
      const numericKeys = keys.filter(k => /^\d+$/.test(k));
      const hasLength =
        'length' in apiResponse && typeof (apiResponse as { length?: number }).length === 'number';

      if (numericKeys.length > 0 || hasLength) {
        const array: ISessionResponse[] = [];
        const length = (apiResponse as { length?: number }).length || numericKeys.length;

        for (let i = 0; i < length; i++) {
          const item = (apiResponse as Record<number, unknown>)[i];
          if (item && typeof item === 'object' && item !== null && 'id' in item) {
            const itemObj = item as { success?: boolean; length?: number; [key: string]: unknown };
            const { success, length, ...cleanItem } = itemObj;
            void success;
            void length;
            array.push(cleanItem as unknown as ISessionResponse);
          }
        }

        if (array.length > 0) {
          return array;
        }
      }

      // Verificar propriedade data aninhada
      if ('data' in apiResponse && Array.isArray((apiResponse as { data?: unknown }).data)) {
        return (apiResponse as { data: ISessionResponse[] }).data;
      }
    }

    return [];
  };

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
    const loadSessions = async () => {
      if (patientId) {
        // Se há patientId, buscar sessões desse paciente específico
        setLoading(true);
        try {
          const response = await sessionsRepository.findByPatient(patientId);
          if (response && response.success !== false) {
            // Extrair array de sessões da resposta usando a mesma lógica do useSessions
            const sessionsData = extractArray(response);
            setSessions(sessionsData);
          } else {
            setSessions([]);
          }
        } catch (error) {
          console.error('Error fetching patient sessions:', error);
          setSessions([]);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar as sessões do paciente.',
            variant: 'error',
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Se não há patientId, usar as sessões do próprio usuário
        setSessions(mySessions);
        setLoading(mySessionsLoading);
      }
    };

    loadSessions();
  }, [patientId, mySessions, mySessionsLoading]);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const reportPatientId = patientId || 'me';
      const blob = await reportsRepository.downloadPatientReportPdf(reportPatientId);

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
        <div className='mx-auto max-w-7xl px-3 sm:px-4 lg:px-8'>
          <div className='flex h-14 sm:h-16 items-center justify-between gap-2'>
            <div className='flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1'>
              <Button 
                variant='ghost' 
                size='sm' 
                className='text-xs sm:text-sm shrink-0'
                onClick={() => navigate(patientId ? '/dashboard-doctor' : '/dashboard')}
              >
                <ArrowLeft className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                Voltar
              </Button>
              <h1 className='text-base sm:text-lg lg:text-xl font-semibold truncate'>
                {patientId ? 'Relatórios do Paciente' : 'Relatórios e Histórico'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Summary Cards */}
        <div className='mb-4 sm:mb-6 lg:mb-8 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3'>
          <Card className='bg-card border-border'>
            <CardHeader className='px-3 sm:px-6 pb-3'>
              <CardTitle className='text-base sm:text-lg'>Progresso Geral</CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <div className='text-primary mb-2 text-2xl sm:text-3xl font-bold'>{stats.avgScore}%</div>
              <p className='text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm'>Precisão média atual</p>
              <Progress value={stats.avgScore} className='mb-2' />
              <p className='text-success text-xs'>
                {stats.totalSessions > 0
                  ? `${stats.totalSessions} sessões completas`
                  : 'Nenhuma sessão ainda'}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardHeader className='px-3 sm:px-6 pb-3'>
              <CardTitle className='text-base sm:text-lg'>Sessões Completas</CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <div className='text-accent mb-2 text-2xl sm:text-3xl font-bold'>{stats.totalSessions}</div>
              <p className='text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm'>Total de exercícios</p>
              <div className='text-muted-foreground flex items-center text-xs'>
                <Calendar className='mr-1 h-3 w-3 shrink-0' />
                <span className='truncate'>
                  {recentSessions.length > 0
                    ? `Última: ${new Date(recentSessions[0].finishedAt!).toLocaleDateString('pt-BR')}`
                    : 'Nenhuma sessão ainda'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardHeader className='px-3 sm:px-6 pb-3'>
              <CardTitle className='text-base sm:text-lg'>Tempo Praticado</CardTitle>
            </CardHeader>
            <CardContent className='px-3 sm:px-6'>
              <div className='text-warning mb-2 text-2xl sm:text-3xl font-bold'>{stats.timePracticed}</div>
              <p className='text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm'>Tempo total de prática</p>
              <div className='text-muted-foreground flex items-center text-xs'>
                <TrendingUp className='mr-1 h-3 w-3 shrink-0' />
                <span className='truncate'>Média: {stats.avgTimePerSession}min/sessão</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className='bg-card border-border'>
          <CardHeader className='px-3 sm:px-6'>
            <CardTitle className='text-base sm:text-lg'>Relatórios Disponíveis</CardTitle>
            <CardDescription className='text-xs sm:text-sm'>Histórico completo das suas sessões e progresso</CardDescription>
          </CardHeader>
          <CardContent className='px-3 sm:px-6'>
            {recentSessions.length === 0 ? (
              <div className='py-6 sm:py-8 text-center'>
                <p className='text-muted-foreground mb-4 text-sm sm:text-base px-2'>
                  Nenhuma sessão concluída ainda. Complete uma sessão para ver os relatórios aqui.
                </p>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  size='sm'
                  className='text-xs sm:text-sm'
                >
                  Ir para Dashboard
                </Button>
              </div>
            ) : (
              <div className='space-y-3 sm:space-y-4'>
                {recentSessions.map(session => {
                  const finishedDate = new Date(session.finishedAt!);
                  const monthName = finishedDate.toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={session.id}
                      className='border-border flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3 sm:p-4 gap-3 sm:gap-4'
                    >
                      <div className='flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1'>
                        <div className='bg-primary/10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg shrink-0'>
                          <FileText className='text-primary h-4 w-4 sm:h-5 sm:w-5' />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <h3 className='font-medium text-sm sm:text-base truncate'>Sessão - {monthName}</h3>
                          <p className='text-muted-foreground text-xs sm:text-sm mt-1 break-words'>
                            {session.correctItems || 0} itens • {session.score || 0}% precisão
                          </p>
                          <p className='text-muted-foreground text-xs sm:text-sm mt-1'>
                            Realizada em {finishedDate.toLocaleDateString('pt-BR')}
                          </p>
                          <div className='mt-2 flex items-center flex-wrap gap-1 sm:gap-2'>
                            <Badge variant='secondary' className='text-xs px-1.5 py-0.5'>Sessão</Badge>
                            <Badge variant='outline' className='text-xs px-1.5 py-0.5'>Concluída</Badge>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center justify-end sm:justify-start space-x-2 shrink-0'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 sm:h-9 sm:w-auto sm:px-3'
                          onClick={() => navigate(`/results?sessionId=${session.id}`)}
                        >
                          <Eye className='h-4 w-4' />
                          <span className='hidden sm:inline ml-2'>Ver</span>
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8 text-xs sm:text-sm sm:h-9'
                          onClick={handleDownloadReport}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 className='h-3 w-3 sm:h-4 sm:w-4 animate-spin' />
                          ) : (
                            <>
                              <Download className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                              <span className='hidden sm:inline'>Baixar</span>
                              <span className='sm:hidden'>PDF</span>
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
      </div>
    </div>
  );
}
