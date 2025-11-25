import { useSession } from "@/hooks/use-sessions"
import { Button } from "@/presentation/components"
import { Badge } from "@/presentation/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { ArrowRight, Download, Home, Loader2, RotateCcw, Trophy } from "lucide-react"
import React, { useMemo } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

export default function ResultsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const { session, loading } = useSession(sessionId)

  const results = useMemo(() => {
    if (!session) return null;
    
    const score = session.score || 0;
    const correctItems = session.correctItems || 0;
    const totalItems = 15; // This should come from exercise list, but we'll use a default for now
    
    // Calculate metrics (simulated for now)
    const correct = Math.round((score / 100) * totalItems);
    const partial = Math.max(0, correctItems - correct);
    const needsPractice = Math.max(0, totalItems - correctItems);
    
    return {
      score,
      correct,
      partial,
      needsPractice,
      totalItems,
    };
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session || !results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Sessão não encontrada.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Sessão Concluída!</h1>
          <p className="text-muted-foreground">Parabéns! Você completou mais uma sessão de exercícios</p>
        </div>

        {/* Main Results Card */}
        <Card className="bg-card border-border mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Resultados da Sessão</CardTitle>
            <CardDescription>Exercício de Consoantes • 15 palavras</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Score Display */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-primary mb-2">{results.score}%</div>
              <p className="text-lg text-muted-foreground">Precisão Geral</p>
              {session.finishedAt && (
                <Badge variant="secondary" className="mt-2">
                  Sessão concluída em {new Date(session.finishedAt).toLocaleDateString('pt-BR')}
                </Badge>
              )}
            </div>

            {/* Detailed Metrics */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
                <div className="text-2xl font-bold text-success mb-1">{results.correct}</div>
                <p className="text-sm text-muted-foreground">Palavras Corretas</p>
              </div>
              <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/20">
                <div className="text-2xl font-bold text-warning mb-1">{results.partial}</div>
                <p className="text-sm text-muted-foreground">Parcialmente Corretas</p>
              </div>
              <div className="text-center p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="text-2xl font-bold text-destructive mb-1">{results.needsPractice}</div>
                <p className="text-sm text-muted-foreground">Necessita Prática</p>
              </div>
            </div>

          </CardContent>
        </Card>


        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>

          <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate("/dashboard")}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Nova Sessão
          </Button>

          <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Baixar Relatório
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h4 className="font-medium">Sessão Recomendada</h4>
                <p className="text-sm text-muted-foreground">
                  Exercício de Sílabas Complexas • Baseado no seu progresso
                </p>
              </div>
              <Button>
                Iniciar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
