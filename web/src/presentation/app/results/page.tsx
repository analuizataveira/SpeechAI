import { Button } from "@/presentation/components"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { Progress } from "@/presentation/components/ui/progress"
import { Badge } from "@/presentation/components/ui/badge"
import { Trophy, TrendingUp, ArrowRight, Download, Share2, RotateCcw, Home, Brain, Link } from "lucide-react"

export default function ResultsPage() {
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
              <div className="text-6xl font-bold text-primary mb-2">78%</div>
              <p className="text-lg text-muted-foreground">Precisão Geral</p>
              <Badge variant="secondary" className="mt-2">
                +5% desde a última sessão
              </Badge>
            </div>

            {/* Detailed Metrics */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
                <div className="text-2xl font-bold text-success mb-1">12</div>
                <p className="text-sm text-muted-foreground">Palavras Corretas</p>
              </div>
              <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/20">
                <div className="text-2xl font-bold text-warning mb-1">2</div>
                <p className="text-sm text-muted-foreground">Parcialmente Corretas</p>
              </div>
              <div className="text-center p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="text-2xl font-bold text-destructive mb-1">1</div>
                <p className="text-sm text-muted-foreground">Necessita Prática</p>
              </div>
            </div>

            {/* Progress Comparison */}
            <div className="space-y-4">
              <h3 className="font-semibold">Comparação com Sessões Anteriores</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">Precisão Fonética</span>
                <div className="flex items-center space-x-2">
                  <Progress value={78} className="w-32" />
                  <span className="text-sm font-medium">78%</span>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Clareza de Fala</span>
                <div className="flex items-center space-x-2">
                  <Progress value={85} className="w-32" />
                  <span className="text-sm font-medium">85%</span>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Velocidade Adequada</span>
                <div className="flex items-center space-x-2">
                  <Progress value={72} className="w-32" />
                  <span className="text-sm font-medium">72%</span>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-primary" />
              Feedback Personalizado da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                <h4 className="font-medium text-success mb-2">✓ Pontos Fortes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Excelente pronúncia dos sons /l/ e /n/</li>
                  <li>• Boa articulação em palavras de 2 sílabas</li>
                  <li>• Melhoria consistente na clareza</li>
                </ul>
              </div>

              <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
                <h4 className="font-medium text-warning mb-2">⚠ Áreas para Melhorar</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Som /r/ ainda precisa de mais prática</li>
                  <li>• Velocidade um pouco acelerada em palavras complexas</li>
                </ul>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium text-primary mb-2">💡 Recomendações</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Continue praticando palavras com /r/ inicial</li>
                  <li>• Tente exercícios de respiração antes das sessões</li>
                  <li>• Próxima sessão: foco em palavras de 3 sílabas</li>
                </ul>
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

          <Button size="lg" className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-2" />
            Nova Sessão
          </Button>

          <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Baixar Relatório
          </Button>

          <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
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
