'use client';

import { IPatientListResponse } from '@/data/repositories/doctor-patients/interface';
import { DoctorPatientsRepository } from '@/data/repositories/doctor-patients/repository';
import { useExerciseLists } from '@/hooks/use-exercise-lists';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/user-provider';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components';
import LogoutIcon from '@/presentation/components/icons/logout-icon';
import Settings from '@/presentation/components/icons/settings';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/dialog';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import {
  Eye,
  ListChecks,
  Loader2,
  Mic,
  Plus,
  Stethoscope,
  Trash2,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardDoctorPage() {
  const { user, isAuthenticated, isLoading, userRole, logout } = useUser();
  const { toast } = useToast();
  const router = useNavigate();
  const { exerciseLists, loading: listsLoading, refetchMyLists } = useExerciseLists({ useMyLists: true });

  const [patients, setPatients] = useState<IPatientListResponse[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [unlinkingPatientId, setUnlinkingPatientId] = useState<string | null>(null);

  const doctorPatientsRepository = new DoctorPatientsRepository();

  useEffect(() => {
    if (isLoading) return
    
    if (!isAuthenticated) {
      router('/login');
      return;
    }

    // Redirect patients to their dashboard
    if (userRole === 'PATIENT') {
      router('/dashboard');
      return;
    }

    fetchPatients();
    refetchMyLists();
  }, [isAuthenticated, isLoading, userRole, router]);

  const extractArray = (data: unknown): IPatientListResponse[] => {
    // Extract inner data from BaseRepository response
    const apiResponse = (data as { data?: unknown })?.data || data;

    // If it's already an array, return it
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }

    // Check if it's an array-like object with numeric keys
    if (apiResponse && typeof apiResponse === 'object' && apiResponse !== null) {
      const keys = Object.keys(apiResponse);
      const numericKeys = keys.filter(k => /^\d+$/.test(k));
      const hasLength =
        'length' in apiResponse && typeof (apiResponse as { length?: number }).length === 'number';

      if (numericKeys.length > 0 || hasLength) {
        const array: IPatientListResponse[] = [];
        const length = (apiResponse as { length?: number }).length || numericKeys.length;

        for (let i = 0; i < length; i++) {
          const item = (apiResponse as Record<number, unknown>)[i];
          if (item && typeof item === 'object' && item !== null && 'id' in item) {
            const itemObj = item as { success?: boolean; length?: number; [key: string]: unknown };
            const { success, length, ...cleanItem } = itemObj;
            // Remove success and length properties if they exist
            void success;
            void length;
            array.push(cleanItem as unknown as IPatientListResponse);
          }
        }

        if (array.length > 0) {
          return array;
        }
      }

      // Check for nested data property
      if ('data' in apiResponse && Array.isArray((apiResponse as { data?: unknown }).data)) {
        return (apiResponse as { data: IPatientListResponse[] }).data;
      }
    }

    return [];
  };

  const fetchPatients = async () => {
    setPatientsLoading(true);
    try {
      const response = await doctorPatientsRepository.getMyPatients();

      if (response && response.success !== false) {
        const patientsData = extractArray(response);
        setPatients(patientsData);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const handleLinkPatient = async () => {
    if (!patientEmail.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite o email do paciente.',
        variant: 'error',
      });
      return;
    }

    setIsLinking(true);
    try {
      const response = await doctorPatientsRepository.linkPatient({
        patientEmail: patientEmail.trim(),
      });

      if (response?.success) {
        toast({
          title: 'Paciente vinculado!',
          description: 'O paciente foi vinculado com sucesso.',
        });
        setPatientEmail('');
        setLinkDialogOpen(false);
        fetchPatients();
      } else {
        // Erro retornado pela API
        const errorResponse = response as
          | { friendlyMessage?: string; message?: string }
          | null
          | undefined;
        const errorMsg =
          errorResponse?.friendlyMessage || errorResponse?.message || 'Usuário não encontrado';
        toast({
          title: 'Erro ao vincular',
          description: errorMsg,
          variant: 'error',
        });
      }
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || 'Usuário não encontrado';
      toast({
        title: 'Erro ao vincular',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkPatient = async (patientId: string) => {
    setUnlinkingPatientId(patientId);
    try {
      const response = await doctorPatientsRepository.unlinkPatient(patientId);

      if (response.success !== false) {
        toast({
          title: 'Paciente desvinculado',
          description: 'O paciente foi desvinculado com sucesso.',
        });
        fetchPatients();
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível desvincular o paciente.',
          variant: 'error',
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message || 'Não foi possível desvincular o paciente.';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      setUnlinkingPatientId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Logout realizado',
      description: 'Até logo!',
    });
    router('/');
  };

  const stats = useMemo(() => {
    const activePatients = patients.filter(p => p.active).length;
    const totalLists = Array.isArray(exerciseLists) ? exerciseLists.length : 0;

    return {
      totalPatients: patients.length,
      activePatients,
      totalLists,
    };
  }, [patients, exerciseLists]);

  const calculateAge = (birthDate: Date | string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!user || patientsLoading || listsLoading) {
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
            <Link to='/' className='flex items-center space-x-2'>
              <div className='bg-primary flex h-8 w-8 items-center justify-center rounded-lg'>
                <Mic className='text-primary-foreground h-5 w-5' />
              </div>
              <span className='text-xl font-bold'>SpeechAI</span>
              <Badge variant='secondary' className='ml-2'>
                <Stethoscope className='mr-1 h-3 w-3' />
                Médico
              </Badge>
            </Link>
            <div className='flex items-center space-x-4'>
              <Button variant='ghost' size='sm' onClick={() => router('/settings')}>
                <Settings className='mr-2 h-4 w-4' />
                Configurações
              </Button>
              <Button variant='ghost' size='sm' onClick={handleLogout}>
                <LogoutIcon className='mr-2 h-4 w-4' />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold'>Olá, Dr(a). {user.name}! 👋</h1>
          <p className='text-muted-foreground'>
            Gerencie seus pacientes e acompanhe o progresso deles.
          </p>
        </div>

        {/* Stats Cards */}
        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
          <Card className='bg-card border-border'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total de Pacientes</CardTitle>
              <Users className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalPatients}</div>
              <p className='text-muted-foreground text-xs'>{stats.activePatients} ativos</p>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Listas de Exercícios</CardTitle>
              <ListChecks className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalLists}</div>
              <p className='text-muted-foreground text-xs'>Criadas por você</p>
            </CardContent>
          </Card>

          <Card className='bg-card border-border'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Ações Rápidas</CardTitle>
              <TrendingUp className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent className='flex gap-2'>
              <Button size='sm' variant='outline' onClick={() => setLinkDialogOpen(true)}>
                <UserPlus className='mr-1 h-4 w-4' />
                Vincular
              </Button>
              <Button size='sm' variant='outline' onClick={() => router('/exercise-lists')}>
                <Plus className='mr-1 h-4 w-4' />
                Exercícios
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-8 lg:grid-cols-3'>
          {/* Main Content - Patients List */}
          <div className='space-y-6 lg:col-span-2'>
            <Card className='bg-card border-border'>
              <CardHeader>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <CardTitle className='flex items-center'>
                      <Users className='text-primary mr-2 h-5 w-5' />
                      Meus Pacientes
                    </CardTitle>
                    <CardDescription>Pacientes vinculados a você</CardDescription>
                  </div>
                  <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className='mr-2 h-4 w-4' />
                        Vincular Paciente
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Vincular Novo Paciente</DialogTitle>
                        <DialogDescription>
                          Digite o email do paciente para vinculá-lo à sua conta.
                        </DialogDescription>
                      </DialogHeader>
                      <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='patientEmail'>Email do Paciente</Label>
                          <Input
                            id='patientEmail'
                            type='email'
                            placeholder='paciente@email.com'
                            value={patientEmail}
                            onChange={e => setPatientEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant='outline' onClick={() => setLinkDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleLinkPatient} disabled={isLinking}>
                          {isLinking ? (
                            <>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              Vinculando...
                            </>
                          ) : (
                            <>
                              <UserPlus className='mr-2 h-4 w-4' />
                              Vincular
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {patients.length === 0 ? (
                  <div className='text-muted-foreground py-8 text-center'>
                    <Users className='mx-auto mb-4 h-12 w-12 opacity-50' />
                    <p>Nenhum paciente vinculado ainda.</p>
                    <p className='text-sm'>Clique em "Vincular Paciente" para começar.</p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className='hidden sm:table-cell'>Email</TableHead>
                          <TableHead className='hidden md:table-cell'>Idade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className='text-right'>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patients.map(patient => (
                          <TableRow key={patient.id}>
                            <TableCell className='font-medium'>
                              <div>{patient.name}</div>
                              <div className='text-muted-foreground text-xs sm:hidden'>
                                {patient.email}
                              </div>
                            </TableCell>
                            <TableCell className='hidden sm:table-cell'>{patient.email}</TableCell>
                            <TableCell className='hidden md:table-cell'>
                              {calculateAge(patient.birthDate)} anos
                            </TableCell>
                            <TableCell>
                              <Badge variant={patient.active ? 'default' : 'secondary'}>
                                {patient.active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-1'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => router(`/reports?patientId=${patient.id}`)}
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleUnlinkPatient(patient.id)}
                                  disabled={unlinkingPatientId === patient.id}
                                >
                                  {unlinkingPatientId === patient.id ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                  ) : (
                                    <Trash2 className='text-destructive h-4 w-4' />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <Card className='bg-card border-border'>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full justify-start bg-transparent'
                  onClick={() => router('/exercise-lists')}
                >
                  <ListChecks className='mr-2 h-4 w-4' />
                  Gerenciar Exercícios
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start bg-transparent'
                  onClick={() => router('/settings')}
                >
                  <Settings className='mr-2 h-4 w-4' />
                  Configurar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Recent Exercise Lists */}
            <Card className='bg-card border-border'>
              <CardHeader>
                <CardTitle>Listas de Exercícios Recentes</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {!Array.isArray(exerciseLists) || exerciseLists.length === 0 ? (
                  <div className='text-muted-foreground py-4 text-center'>
                    <ListChecks className='mx-auto mb-2 h-8 w-8 opacity-50' />
                    <p className='text-sm'>Nenhuma lista criada.</p>
                  </div>
                ) : (
                  exerciseLists.slice(0, 5).map(list => (
                    <div
                      key={list.id}
                      className='bg-muted/50 hover:bg-muted flex items-center justify-between rounded-lg p-3 transition-colors'
                    >
                      <div>
                        <p className='text-sm font-medium'>{list.title}</p>
                        <p className='text-muted-foreground text-xs'>
                          {list.items?.length || 0} exercícios
                        </p>
                      </div>
                      <Badge variant='outline' className='capitalize'>
                        {list.difficultyLevel}
                      </Badge>
                    </div>
                  ))
                )}
                {Array.isArray(exerciseLists) && exerciseLists.length > 5 && (
                  <Button
                    variant='link'
                    className='w-full'
                    onClick={() => router('/exercise-lists')}
                  >
                    Ver todas ({exerciseLists.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
