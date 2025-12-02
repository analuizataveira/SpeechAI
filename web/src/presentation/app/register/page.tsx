'use client';

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import { Mic, ArrowLeft, Loader2, Stethoscope, User } from 'lucide-react';
import { useUser } from '@/hooks/user-provider';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    speechDifficulty: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    userType: '' as 'PATIENT' | 'DOCTOR' | '',
    specialty: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useUser();
  const router = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userType) {
      toast({
        title: 'Erro no cadastro',
        description: 'Selecione o tipo de usuário.',
        variant: 'error',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Erro no cadastro',
        description: 'As senhas não coincidem.',
        variant: 'error',
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: 'Erro no cadastro',
        description: 'Você deve aceitar os termos de uso.',
        variant: 'error',
      });
      return;
    }

    setIsLoading(true);

    if (!formData.phone) {
      toast({
        title: 'Erro no cadastro',
        description: 'Por favor, informe seu telefone.',
        variant: 'error',
      });
      setIsLoading(false);
      return;
    }

    if (formData.userType === 'DOCTOR' && !formData.specialty) {
      toast({
        title: 'Erro no cadastro',
        description: 'Por favor, informe sua especialidade.',
        variant: 'error',
      });
      setIsLoading(false);
      return;
    }

    try {
      const age = formData.userType === 'PATIENT' ? getAgeFromRange(formData.age) : 30;
      const birthDate = getBirthDateFromAge(age);

      const success = await register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        birthDate: birthDate,
        password: formData.password,
        role: formData.userType,
        specialty: formData.userType === 'DOCTOR' ? formData.specialty : undefined,
      });

      if (success) {
        toast({
          title: 'Conta criada com sucesso!',
          description:
            'Realize o login para darmos inicio.'
        });
        router('/login');
      } else {
        toast({
          title: 'Erro no cadastro',
          description: 'Não foi possível criar sua conta. Verifique os dados e tente novamente.',
          variant: 'error',
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Ocorreu um erro inesperado. Tente novamente.';
      toast({
        title: 'Erro no cadastro',
        description: errorMessage,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAgeFromRange = (range: string): number => {
    switch (range) {
      case 'child':
        return 8;
      case 'teen':
        return 15;
      case 'adult':
        return 30;
      case 'senior':
        return 65;
      default:
        return 25;
    }
  };

  const getBirthDateFromAge = (age: number): string => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    const birthDate = new Date(birthYear, today.getMonth(), today.getDate());
    return birthDate.toISOString();
  };

  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Link
          to='/'
          className='text-muted-foreground hover:text-foreground mb-8 inline-flex items-center'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Voltar ao início
        </Link>

        <Card className='bg-card border-border'>
          <CardHeader className='text-center'>
            <div className='bg-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg'>
              <Mic className='text-primary-foreground h-6 w-6' />
            </div>
            <CardTitle className='text-2xl'>Criar Conta</CardTitle>
            <CardDescription>Configure seu perfil para exercícios personalizados</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Seletor de Tipo de Usuário */}
              <div className='space-y-2'>
                <Label>Tipo de Conta</Label>
                <div className='grid grid-cols-2 gap-4'>
                  <button
                    type='button'
                    onClick={() => handleInputChange('userType', 'PATIENT')}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      formData.userType === 'PATIENT'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-input hover:border-primary/50'
                    }`}
                  >
                    <User className='h-6 w-6' />
                    <span className='font-medium'>Paciente</span>
                    <span className='text-muted-foreground text-xs'>Praticar exercícios</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => handleInputChange('userType', 'DOCTOR')}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      formData.userType === 'DOCTOR'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-input hover:border-primary/50'
                    }`}
                  >
                    <Stethoscope className='h-6 w-6' />
                    <span className='font-medium'>Médico</span>
                    <span className='text-muted-foreground text-xs'>Acompanhar pacientes</span>
                  </button>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>Nome</Label>
                  <Input
                    id='firstName'
                    placeholder='João'
                    className='bg-input border-border'
                    value={formData.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Sobrenome</Label>
                  <Input
                    id='lastName'
                    placeholder='Silva'
                    className='bg-input border-border'
                    value={formData.lastName}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='seu@email.com'
                  className='bg-input border-border'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Telefone</Label>
                <Input
                  id='phone'
                  type='tel'
                  placeholder='(00) 00000-0000'
                  className='bg-input border-border'
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              {/* Campo de Especialidade - apenas para médicos */}
              {formData.userType === 'DOCTOR' && (
                <div className='space-y-2'>
                  <Label htmlFor='specialty'>Especialidade</Label>
                  <Input
                    id='specialty'
                    placeholder='Ex: Fonoaudiologia'
                    className='bg-input border-border'
                    value={formData.specialty}
                    onChange={e => handleInputChange('specialty', e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Campos específicos de paciente */}
              {formData.userType === 'PATIENT' && (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='age'>Faixa Etária</Label>
                    <Select
                      value={formData.age}
                      onValueChange={value => handleInputChange('age', value)}
                    >
                      <SelectTrigger className='bg-input border-border'>
                        <SelectValue placeholder='Selecione sua idade' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='child'>Criança (5-12 anos)</SelectItem>
                        <SelectItem value='teen'>Adolescente (13-17 anos)</SelectItem>
                        <SelectItem value='adult'>Adulto (18-59 anos)</SelectItem>
                        <SelectItem value='senior'>Idoso (60+ anos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='difficulty'>Tipo de Dificuldade</Label>
                    <Select
                      value={formData.speechDifficulty}
                      onValueChange={value => handleInputChange('speechDifficulty', value)}
                    >
                      <SelectTrigger className='bg-input border-border'>
                        <SelectValue placeholder='Selecione o tipo' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='dislalia'>Dislalia</SelectItem>
                        <SelectItem value='gagueira'>Gagueira</SelectItem>
                        <SelectItem value='apraxia'>Apraxia</SelectItem>
                        <SelectItem value='outro'>Outra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className='space-y-2'>
                <Label htmlFor='password'>Senha</Label>
                <Input
                  id='password'
                  type='password'
                  className='bg-input border-border'
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirmar Senha</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  className='bg-input border-border'
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='terms'
                  checked={formData.acceptTerms}
                  onCheckedChange={checked => handleInputChange('acceptTerms', checked as boolean)}
                />
                <Label htmlFor='terms' className='text-muted-foreground text-sm'>
                  Aceito os termos de uso e política de privacidade
                </Label>
              </div>

              <Button className='w-full' size='lg' type='submit' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>

            <div className='mt-4 text-center'>
              <span className='text-muted-foreground text-sm'>Já tem uma conta? </span>
              <Link to='/login' className='text-primary text-sm hover:underline'>
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
