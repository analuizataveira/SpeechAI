"use client"

import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/user-provider"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components"
import { Progress } from "@/presentation/components/ui/progress"
import { ArrowLeft, Badge, Brain, Mic, MicOff, Pause, Play, RotateCcw, Volume2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const EXERCISE_WORDS = [
  { word: "RATO", focus: "/r/", tip: "Foque na pronúncia do som /r/ no início da palavra" },
  { word: "LATA", focus: "/l/", tip: "Mantenha a língua relaxada para o som /l/" },
  { word: "CARRO", focus: "/r/", tip: "Pronuncie o /r/ duplo claramente" },
  { word: "BOLA", focus: "/l/", tip: "O som /l/ deve ser suave e contínuo" },
  { word: "TERRA", focus: "/r/", tip: "Vibre a língua para o som /r/" },
]

export default function ExercisePage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionResults, setSessionResults] = useState<number[]>([])
  const { user, isAuthenticated } = useUser()
  const router = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router("/login")
    }
  }, [isAuthenticated, router])

  const currentWord = EXERCISE_WORDS[currentWordIndex]
  const progress = ((currentWordIndex + 1) / EXERCISE_WORDS.length) * 100

  const handleBackToDashboard = () => {
    router("/dashboard")
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false)
      // Simulate AI analysis result
      const score = Math.floor(Math.random() * 30) + 70 // Random score between 70-100
      setSessionResults((prev) => [...prev, score])

      toast({
        title: "Análise concluída!",
        description: `Pontuação: ${score}% - Continue assim!`,
      })

      // Move to next word or finish session
      if (currentWordIndex < EXERCISE_WORDS.length - 1) {
        setTimeout(() => setCurrentWordIndex((prev) => prev + 1), 1500)
      } else {
        // Session completed
        setTimeout(() => {
          router("/results")
        }, 2000)
      }
    }, 3000)
  }

  const handleSkipWord = () => {
    if (currentWordIndex < EXERCISE_WORDS.length - 1) {
      setCurrentWordIndex((prev) => prev + 1)
      setSessionResults((prev) => [...prev, 0])
    } else {
      router("/results")
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

  if (!user) {
    return <div>Carregando...</div>
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
                Palavra {currentWordIndex + 1}/{EXERCISE_WORDS.length}
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
              {currentWordIndex + 1} de {EXERCISE_WORDS.length} palavras
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
            <CardTitle className="text-2xl">Exercício de Consoantes</CardTitle>
            <CardDescription>Pronuncie a palavra destacada claramente no microfone</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Word Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-4 p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={playWordAudio}>
                  <Volume2 className="w-5 h-5" />
                </Button>
                <div className="text-6xl font-bold text-primary tracking-wider">{currentWord.word}</div>
              </div>
              <p className="text-muted-foreground mt-4">{currentWord.tip}</p>
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
