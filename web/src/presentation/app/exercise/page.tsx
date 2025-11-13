"use client"

import React from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/user-provider"
import { useExerciseList } from "@/hooks/use-exercise-lists"
import { SessionsRepository } from "@/data/repositories/sessions/repository"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components"
import { Progress } from "@/presentation/components/ui/progress"
import { ArrowLeft, Badge, Brain, Mic, MicOff, Pause, Play, RotateCcw, Volume2, Loader2 } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function ExercisePage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionResults, setSessionResults] = useState<number[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const { user, isAuthenticated } = useUser()
  const router = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const listId = searchParams.get('listId')
  
  const { exerciseList, loading: listLoading } = useExerciseList(listId)
  const sessionsRepository = new SessionsRepository()

  useEffect(() => {
    if (!isAuthenticated) {
      router("/login")
    }
  }, [isAuthenticated, router])

  // Initialize session when exercise list is loaded
  useEffect(() => {
    if (exerciseList && !currentSessionId) {
      const createSession = async () => {
        try {
          const response = await sessionsRepository.create({
            exerciseListId: exerciseList.id,
            startedAt: new Date().toISOString(),
          });
          if (response.success) {
            const session = response as any;
            setCurrentSessionId(session.id);
          }
        } catch (error: any) {
          toast({
            title: "Erro ao iniciar sessão",
            description: error?.message || "Não foi possível iniciar a sessão",
            variant: "destructive",
          });
        }
      };
      createSession();
    }
  }, [exerciseList, currentSessionId]);

  const exercises = useMemo(() => {
    if (!exerciseList?.items) return [];
    return exerciseList.items
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(item => ({
        word: item.exercise?.text || '',
        focus: exerciseList.diffType?.description || '',
        tip: `Foque na pronúncia correta da palavra`,
      }))
      .filter(ex => ex.word);
  }, [exerciseList]);

  const currentWord = exercises[currentWordIndex]
  const progress = exercises.length > 0 ? ((currentWordIndex + 1) / exercises.length) * 100 : 0

  const handleBackToDashboard = () => {
    router("/dashboard")
  }

  const handleStartRecording = async () => {
    setIsRecording(true)
    // Simulate recording for 3 seconds
    setTimeout(async () => {
      setIsRecording(false)
      // Simulate AI analysis result
      const score = Math.floor(Math.random() * 30) + 70 // Random score between 70-100
      setSessionResults((prev) => [...prev, score])

      // Update session with current progress
      if (currentSessionId) {
        try {
          await sessionsRepository.update(currentSessionId, {
            score: Math.round(sessionResults.reduce((sum, s) => sum + s, score) / (sessionResults.length + 1)),
            correctItems: sessionResults.length + 1,
          });
        } catch (error) {
          console.error('Error updating session:', error);
        }
      }

      toast({
        title: "Análise concluída!",
        description: `Pontuação: ${score}% - Continue assim!`,
      })

      // Move to next word or finish session
      if (currentWordIndex < exercises.length - 1) {
        setTimeout(() => setCurrentWordIndex((prev) => prev + 1), 1500)
      } else {
        // Session completed
        if (currentSessionId) {
          try {
            const finalScore = Math.round(sessionResults.reduce((sum, s) => sum + s, score) / (sessionResults.length + 1));
            await sessionsRepository.completeSession(currentSessionId, {
              score: finalScore,
              correctItems: sessionResults.length + 1,
              finishedAt: new Date().toISOString(),
            });
            router(`/results?sessionId=${currentSessionId}`)
          } catch (error) {
            console.error('Error completing session:', error);
            router("/results")
          }
        } else {
          router("/results")
        }
      }
    }, 3000)
  }

  const handleSkipWord = () => {
    if (currentWordIndex < exercises.length - 1) {
      setCurrentWordIndex((prev) => prev + 1)
      setSessionResults((prev) => [...prev, 0])
    } else {
      if (currentSessionId) {
        router(`/results?sessionId=${currentSessionId}`)
      } else {
        router("/results")
      }
    }
  }

  const handlePauseSession = () => {
    setIsPaused(!isPaused)
  }

  const playWordAudio = () => {
    // Simulate word pronunciation
    toast({
      title: "Reproduzindo palavra",
      description: `Ouça: ${currentWord.word}`,
    })
  }

  if (!user || listLoading || !exerciseList) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhum exercício disponível nesta lista.
            </p>
            <Button onClick={() => router("/dashboard")}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <Badge >
                Palavra {currentWordIndex + 1}/{exercises.length}
              </Badge>
              <Button variant="outline" size="sm" onClick={handlePauseSession}>
                {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {isPaused ? "Continuar" : "Pausar"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso da Sessão</span>
            <span className="text-sm font-medium">
              {currentWordIndex + 1} de {exercises.length} palavras
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Exercise Card */}
        <Card className="bg-card border-border mb-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary mr-2" />
              <Badge>{isRecording ? "IA Analisando" : "Pronto para Gravar"}</Badge>
            </div>
            <CardTitle className="text-2xl">{exerciseList.title}</CardTitle>
            <CardDescription>Pronuncie a palavra destacada claramente no microfone</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Word Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-4 p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={playWordAudio}>
                  <Volume2 className="w-5 h-5" />
                </Button>
                <div className="text-6xl font-bold text-primary tracking-wider">{currentWord?.word || ''}</div>
              </div>
              <p className="text-muted-foreground mt-4">{currentWord?.tip || ''}</p>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Button
                  size="lg"
                  className={`w-24 h-24 rounded-full ${
                    isRecording
                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                  onClick={handleStartRecording}
                  disabled={isRecording || isPaused}
                >
                  <Mic className="w-8 h-8" />
                </Button>
                {isRecording && (
                  <div className="absolute -inset-2 rounded-full border-2 border-destructive animate-pulse"></div>
                )}
              </div>

              <div className="text-center">
                <p className={`text-lg font-medium mb-2 ${isRecording ? "text-destructive" : "text-foreground"}`}>
                  {isRecording ? "Gravando..." : "Toque para gravar"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRecording ? "Pronuncie a palavra claramente" : "Mantenha pressionado para gravar sua pronúncia"}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={handleStartRecording} disabled={isRecording}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button variant="outline" onClick={handleSkipWord} disabled={isRecording}>
                  <MicOff className="w-4 h-4 mr-2" />
                  Pular Palavra
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Panel */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-primary" />
              Análise da IA em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {sessionResults.length > 0 ? `${sessionResults[sessionResults.length - 1]}%` : "--"}
                </div>
                <p className="text-sm text-muted-foreground">Precisão Fonética</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">{isRecording ? "Analisando..." : "Bom"}</div>
                <p className="text-sm text-muted-foreground">Clareza</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-1">Normal</div>
                <p className="text-sm text-muted-foreground">Velocidade</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Feedback da IA:</h4>
              <p className="text-sm text-muted-foreground">
                {isRecording
                  ? "Analisando sua pronúncia..."
                  : `Boa pronúncia do som ${currentWord.focus}! Tente manter a língua um pouco mais relaxada para um som mais natural. Continue assim!`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
