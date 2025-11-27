"use client"

import React from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/user-provider"
import { useExerciseList } from "@/hooks/use-exercise-lists"
import { SessionsRepository } from "@/data/repositories/sessions/repository"
import { TranscriptionRepository } from "@/data/repositories/transcription/repository"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components"
import { Progress } from "@/presentation/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/presentation/components/ui/dialog"
import { ArrowLeft, Badge, Brain, Mic, MicOff, Pause, Play, RotateCcw, Volume2, Loader2 } from "lucide-react"
import { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function ExercisePage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionResults, setSessionResults] = useState<number[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState<string>("")
  const [isCompleting, setIsCompleting] = useState(false)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackData, setFeedbackData] = useState<{ score: number; feedback: string } | null>(null)
  const { user, isAuthenticated, isLoading } = useUser()
  const router = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const listId = searchParams.get('listId')
  
  const { exerciseList, loading: listLoading, error: listError } = useExerciseList(listId)
  const sessionsRepository = new SessionsRepository()
  const transcriptionRepository = new TranscriptionRepository()
  
  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isLoading) return
    
    if (!isAuthenticated) {
      router("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Check if listId is missing
  useEffect(() => {
    if (!listId && isAuthenticated) {
      toast({
        title: "Lista de exercícios não encontrada",
        description: "Por favor, selecione uma lista de exercícios do dashboard.",
        variant: "error",
      });
      router("/dashboard");
    }
  }, [listId, isAuthenticated, router, toast]);

  // Initialize session when exercise list is loaded
  useEffect(() => {
    if (exerciseList?.id && !currentSessionId) {
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
            variant: "error",
          });
        }
      };
      createSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseList?.id, currentSessionId]);

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

  // Ensure currentWordIndex is within bounds
  const safeWordIndex = exercises.length > 0 
    ? Math.min(currentWordIndex, Math.max(0, exercises.length - 1))
    : 0
  const currentWord = exercises.length > 0 ? exercises[safeWordIndex] : undefined
  const progress = exercises.length > 0 ? ((safeWordIndex + 1) / exercises.length) * 100 : 0

  const handleBackToDashboard = () => {
    router("/dashboard")
  }

  const handleStartRecording = async () => {
    // Prevent starting if already recording or processing
    // Check both React state and MediaRecorder state
    const isCurrentlyRecording = isRecording || 
      (mediaRecorderRef.current && 
       (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused'))
    
    if (isCurrentlyRecording || isProcessing) {
      console.warn('Already recording or processing', {
        isRecording,
        isProcessing,
        mediaRecorderState: mediaRecorderRef.current?.state
      })
      return
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create MediaRecorder with timeslice to get data periodically
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        ('MediaRecorder stopped, processing audio...')
        try {
          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
              track.stop()
            })
            streamRef.current = null
          }

          // Create blob from chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          
          // Reset chunks for next recording
          audioChunksRef.current = []
          
          // Process transcription
          await processAudioTranscription(audioBlob)
        } catch (error: any) {
          console.error('Error in onstop handler:', error)
          setIsProcessing(false)
          setIsRecording(false)
          toast({
            title: "Erro ao processar gravação",
            description: error?.message || "Não foi possível processar a gravação.",
            variant: "error",
          })
        }
      }
      
      // Handle errors
      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event)
        setIsRecording(false)
        setIsProcessing(false)
        toast({
          title: "Erro na gravação",
          description: "Ocorreu um erro durante a gravação. Tente novamente.",
          variant: "error",
        })
      }

      // Start recording without timeslice (only collect data when stopped)
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error: any) {
      console.error('Error starting recording:', error)
      setIsRecording(false)
      toast({
        title: "Erro ao acessar microfone",
        description: error?.message || "Não foi possível acessar o microfone. Verifique as permissões.",
        variant: "error",
      })
    }
  }

  const handleStopRecording = () => {
    
    const mediaRecorder = mediaRecorderRef.current
    
    if (!mediaRecorder) {
      console.error('ERROR: MediaRecorder not available!')
      setIsRecording(false)
      setIsProcessing(false)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      return
    }

    const state = mediaRecorder.state

    // Set processing state immediately to prevent double-clicks
    setIsRecording(false)
    setIsProcessing(true)

    try {
      // Stop the MediaRecorder
      if (state === 'recording' || state === 'paused') {
        (`Stopping MediaRecorder (state: ${state})...`)
        try {
          mediaRecorder.stop()
          // The onstop handler will process the audio and update states
        } catch (stopError: any) {
          console.error('Error calling mediaRecorder.stop():', stopError)
          // Force cleanup if stop() fails
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
          }
          // Process any collected audio chunks
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
            audioChunksRef.current = []
            processAudioTranscription(audioBlob)
          } else {
            setIsProcessing(false)
          }
        }
      } else if (state === 'inactive') {
        console.warn('MediaRecorder already inactive, forcing cleanup')
        // Already stopped, just clean up and process
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        // Process any collected audio chunks
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          audioChunksRef.current = []
          processAudioTranscription(audioBlob)
        } else {
          setIsProcessing(false)
        }
      } else {
        console.warn('MediaRecorder in unexpected state:', state)
        // Force cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        setIsProcessing(false)
      }
    } catch (error: any) {
      console.error('ERROR stopping recording:', error)
      toast({
        title: "Erro ao parar gravação",
        description: error?.message || "Não foi possível parar a gravação.",
        variant: "error",
      })
      setIsProcessing(false)
      setIsRecording(false)
      
      // Try to clean up
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      mediaRecorderRef.current = null
    }
  }

  const processAudioTranscription = async (audioBlob: Blob) => {
    // Safety check: ensure currentWord exists and is valid
    if (!currentWord?.word || safeWordIndex >= exercises.length) {
      setIsProcessing(false)
      console.warn('Cannot process audio: currentWord is invalid or index out of bounds')
      return
    }

    try {
      const response = await transcriptionRepository.transcribeAudio(
        audioBlob,
        currentWord.word
      )

      if (response.success) {
        const transcriptionData = response as any
        
        // Extract score - handle multiple formats: score, pontuacao (with or without %)
        let score = 0
        if (transcriptionData.score !== undefined) {
          score = typeof transcriptionData.score === 'number' 
            ? transcriptionData.score 
            : parseFloat(String(transcriptionData.score).replace('%', '').trim()) || 0
        } else if (transcriptionData.pontuacao !== undefined) {
          // Handle "pontuacao": "100%" or "pontuacao": "100" or "pontuacao": 100
          if (typeof transcriptionData.pontuacao === 'string') {
            score = parseFloat(transcriptionData.pontuacao.replace('%', '').trim()) || 0
          } else {
            score = transcriptionData.pontuacao
          }
        }
        
        // Ensure score is between 0 and 100
        const normalizedScore = Math.max(0, Math.min(100, Math.round(score)))
        
        setSessionResults((prev) => [...prev, normalizedScore])
        
        // Extract feedback - prefer analise (from API), then feedback, then transcribedText
        const feedback = transcriptionData.analise 
          || transcriptionData.feedback 
          || transcriptionData.analysis
          || transcriptionData.transcribedText 
          || transcriptionData.message
          || ""
        
        setCurrentFeedback(feedback)

        // Update session with current progress
        if (currentSessionId) {
          try {
            await sessionsRepository.update(currentSessionId, {
              score: Math.round(sessionResults.reduce((sum, s) => sum + s, normalizedScore) / (sessionResults.length + 1)),
              correctItems: sessionResults.length + 1,
            })
          } catch (error) {
            console.error('Error updating session:', error)
          }
        }

        // Show feedback in dialog
        setFeedbackData({
          score: normalizedScore,
          feedback: feedback
        })
        setFeedbackDialogOpen(true)

        setIsProcessing(false)

        if (currentWordIndex < exercises.length - 1) {
          setTimeout(() => {
            setCurrentWordIndex((prev) => prev + 1)
            setCurrentFeedback("")
          }, 2000)
        } else {
          setIsCompleting(true)
          
          if (currentSessionId) {
            try {
              const finalScore = Math.round(sessionResults.reduce((sum, s) => sum + s, normalizedScore) / (sessionResults.length + 1))
              await sessionsRepository.completeSession(currentSessionId, {
                score: finalScore,
                correctItems: sessionResults.length + 1,
                finishedAt: new Date().toISOString(),
              })
              router(`/results?sessionId=${currentSessionId}`)
            } catch (error) {
              console.error('Error completing session:', error)
              router("/results")
            }
          } else {
            router("/results")
          }
        }
      } else {
        throw new Error(response.message || "Erro ao processar áudio")
      }
    } catch (error: any) {
      console.error('Error transcribing audio:', error)
      toast({
        title: "Erro ao processar áudio",
        description: error?.message || "Não foi possível processar a gravação. Tente novamente.",
        variant: "error",
      })
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const checkRecordingState = () => {
      const mediaRecorder = mediaRecorderRef.current
      if (mediaRecorder) {
        const isActuallyRecording = mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused'
        if (isActuallyRecording && !isRecording) {
          ('🔄 Syncing state: MediaRecorder is recording, updating React state')
          setIsRecording(true)
        } else if (!isActuallyRecording && isRecording && !isProcessing) {
          ('🔄 Syncing state: MediaRecorder is not recording, updating React state')
          setIsRecording(false)
        }
      }
    }

    checkRecordingState()

    const interval = setInterval(checkRecordingState, 100)

    return () => clearInterval(interval)
  }, [isRecording, isProcessing])

  useEffect(() => {
    return () => {
      ('Component unmounting, cleaning up...')
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop()
        } catch (error) {
          console.error('Error stopping MediaRecorder on unmount:', error)
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  const handleSkipWord = () => {
    if (safeWordIndex < exercises.length - 1) {
      setCurrentWordIndex((prev) => prev + 1)
      setSessionResults((prev) => [...prev, 0])
    } else {
      setIsCompleting(true)
      if (currentSessionId) {
        sessionsRepository.completeSession(currentSessionId, {
          score: sessionResults.length > 0 
            ? Math.round(sessionResults.reduce((sum, s) => sum + s, 0) / sessionResults.length)
            : 0,
          correctItems: sessionResults.length,
          finishedAt: new Date().toISOString(),
        }).then(() => {
          router(`/results?sessionId=${currentSessionId}`)
        }).catch(() => {
          router("/results")
        })
      } else {
        router("/results")
      }
    }
  }

  const handlePauseSession = () => {
    setIsPaused(!isPaused)
  }

  const playWordAudio = () => {
    toast({
      title: "Reproduzindo palavra",
      description: `Ouça: ${currentWord?.word || ''}`,
    })
  }

  // Show error if list failed to load
  if (listError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-red-500 mb-4">
              Erro ao carregar lista de exercícios
            </p>
            <p className="text-muted-foreground mb-4">{listError}</p>
            <Button onClick={() => router("/dashboard")}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading or missing data
  if (!user || listLoading || !exerciseList || isCompleting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isCompleting ? "Finalizando sessão..." : !listId ? "Carregando lista de exercícios..." : listLoading ? "Carregando exercícios..." : "Preparando exercícios..."}
          </p>
        </div>
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
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 gap-2">
            <Button variant="ghost" size="sm" onClick={handleBackToDashboard} className="text-xs sm:text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Voltar ao Dashboard</span>
              <span className="sm:hidden">Voltar</span>
            </Button>
            <div className="flex items-center gap-2 sm:space-x-4">
              <Badge className="text-xs px-2 py-1">
                <span className="hidden sm:inline">Palavra </span>
                {safeWordIndex + 1}/{exercises.length}
              </Badge>
              <Button variant="outline" size="sm" onClick={handlePauseSession} className="text-xs sm:text-sm px-2 sm:px-3">
                {isPaused ? <Play className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" /> : <Pause className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />}
                <span className="hidden sm:inline">{isPaused ? "Continuar" : "Pausar"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Progress */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Progresso da Sessão</span>
            <span className="text-xs sm:text-sm font-medium">
              {safeWordIndex + 1} de {exercises.length} palavras
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Exercise Card */}
        <Card className="bg-card border-border mb-4 sm:mb-6 lg:mb-8">
          <CardHeader className="text-center px-3 sm:px-6">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary mr-1 sm:mr-2" />
              <Badge className="text-xs sm:text-sm">{isRecording ? "IA Analisando" : "Pronto para Gravar"}</Badge>
            </div>
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">{exerciseList.title}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Pronuncie a palavra destacada claramente no microfone</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {/* Word Display */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center space-x-2 sm:space-x-4 p-4 sm:p-6 bg-primary/5 rounded-xl sm:rounded-2xl border border-primary/20">
                <Button variant="ghost" size="sm" className="text-muted-foreground p-2" onClick={playWordAudio}>
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-wider break-all">
                  {currentWord?.word || 'Carregando...'}
                </div>
              </div>
              <p className="text-muted-foreground mt-3 sm:mt-4 text-xs sm:text-sm px-2">{currentWord?.tip || ''}</p>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center space-y-4 sm:space-y-6">
              <div className="flex items-center gap-4">
                {/* Toggle Recording Button */}
                <div className="relative">
                  <Button
                    size="lg"
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full relative z-10 ${
                      isProcessing
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : isRecording
                        ? "bg-error hover:bg-error/90 text-error-foreground"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                    onMouseDown={() => {
                    }}
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      
                      // Check MediaRecorder state directly at click time (not React state)
                      const currentMediaRecorderState = mediaRecorderRef.current?.state
                      const isCurrentlyRecording = isRecording || 
                        (currentMediaRecorderState === 'recording' || currentMediaRecorderState === 'paused')
                      
                      
                      if (isProcessing || isPaused) {
                        ('Button click blocked: isProcessing or isPaused')
                        return
                      }
                      
                      // Directly handle start/stop based on actual MediaRecorder state
                      if (isCurrentlyRecording) {
                        handleStopRecording()
                      } else {
                        await handleStartRecording()
                      }
                    }}
                    disabled={isProcessing || isPaused}
                    type="button"
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="w-6 h-6 sm:w-8 sm:h-8" />
                    ) : (
                      <Mic className="w-6 h-6 sm:w-8 sm:h-8" />
                    )}
                  </Button>
                  {isRecording && (
                    <div className="absolute -inset-2 rounded-full border-2 border-error animate-pulse pointer-events-none z-0"></div>
                  )}
                </div>
              </div>

              <div className="text-center px-2">
                <p className={`text-sm sm:text-base lg:text-lg font-medium mb-2 ${
                  isRecording ? "text-error" : 
                  isProcessing ? "text-muted-foreground" : 
                  "text-foreground"
                }`}>
                  {isRecording ? "Gravando... (Clique novamente para parar)" : 
                   isProcessing ? "Processando áudio..." : 
                   "Clique no botão para iniciar a gravação"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRecording ? "Pronuncie a palavra claramente e clique no botão novamente para parar e enviar" : 
                   isProcessing ? "Aguarde enquanto analisamos sua pronúncia" :
                   "Clique no botão para iniciar a gravação"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  onClick={async () => {
                    // Stop current recording if active
                    if (mediaRecorderRef.current && (isRecording || mediaRecorderRef.current.state === 'recording')) {
                      handleStopRecording()
                      // Wait a bit before starting new recording
                      await new Promise(resolve => setTimeout(resolve, 500))
                    }
                    // Start new recording
                    if (!isProcessing && !isPaused && !isRecording) {
                      await handleStartRecording()
                    }
                  }} 
                  disabled={isRecording || isProcessing}
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Tentar Novamente
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  onClick={handleSkipWord} 
                  disabled={isRecording || isProcessing}
                >
                  <MicOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Pular Palavra
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Panel */}
        <Card className="bg-card border-border">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
              Análise da IA em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <div className="text-center">
                <div className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 ${
                  sessionResults.length > 0 
                    ? sessionResults[sessionResults.length - 1] >= 80 
                      ? "text-green-600" 
                      : sessionResults[sessionResults.length - 1] >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                    : "text-muted-foreground"
                }`}>
                  {sessionResults.length > 0 ? `${sessionResults[sessionResults.length - 1]}%` : "--"}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Pontuação Atual</p>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-1">
                  {sessionResults.length > 0 
                    ? Math.round(sessionResults.reduce((sum, s) => sum + s, 0) / sessionResults.length)
                    : 0}%
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Média da Sessão</p>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-accent mb-1">
                  {sessionResults.length}/{exercises.length}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Palavras Completas</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
                <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                Análise da IA:
              </h4>
              <div className="text-xs sm:text-sm text-foreground whitespace-pre-wrap">
                {isRecording ? (
                  <p className="text-muted-foreground">Gravando sua pronúncia...</p>
                ) : isProcessing ? (
                  <p className="text-muted-foreground">Analisando sua pronúncia...</p>
                ) : currentFeedback ? (
                  <p className="leading-relaxed">{currentFeedback}</p>
                ) : currentWord ? (
                  <p className="text-muted-foreground">
                    Pronuncie a palavra <strong>"{currentWord.word}"</strong> claramente. 
                    {currentWord.focus && ` Foque na pronúncia correta do som ${currentWord.focus}.`}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Carregando palavra...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Dialog - Positioned in corner */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent 
          className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto sm:!left-auto sm:!top-4 sm:!right-4 sm:!translate-x-0 sm:!translate-y-0"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Análise da Pronúncia
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Resultado da análise da sua pronúncia
            </DialogDescription>
          </DialogHeader>
          {feedbackData && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center">
                <div className={`text-4xl sm:text-5xl font-bold ${
                  feedbackData.score >= 80 
                    ? "text-green-600" 
                    : feedbackData.score >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}>
                  {feedbackData.score}%
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  Feedback Detalhado:
                </h4>
                <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {feedbackData.feedback || "Análise concluída!"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => setFeedbackDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
