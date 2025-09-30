import { Button, Card } from "@/presentation/components"
import { Mic, Brain, TrendingUp, FileText, Users, Shield } from "lucide-react"
import { Link } from "react-router-dom"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">SpeechAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button>Começar</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Brain className="w-4 h-4 mr-2" />
            Powered by AI • Whisper + Phonemizer
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Análise de Pronúncia
            <span className="text-primary block">com Inteligência Artificial</span>
          </h1>

          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            Aplicativo acessível que utiliza IA para analisar e melhorar a pronúncia, adaptado para pessoas com
            dificuldades de fala como dislalia, gagueira e apraxia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Começar Agora
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades Principais</h2>
            <p className="text-muted-foreground text-lg">Tecnologia avançada para análise personalizada de pronúncia</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-card border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Análise com IA</h3>
              <p className="text-muted-foreground">
                Avaliação inteligente da pronúncia usando Whisper e análise fonética avançada
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Testes Personalizados</h3>
              <p className="text-muted-foreground">
                Palavras selecionadas dinamicamente baseadas na idade e tipo de dificuldade
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-info" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Acompanhamento</h3>
              <p className="text-muted-foreground">Monitore sua evolução ao longo do tempo com métricas detalhadas</p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Relatórios PDF</h3>
              <p className="text-muted-foreground">Gere relatórios detalhados do seu progresso para compartilhar</p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Feedback Imediato</h3>
              <p className="text-muted-foreground">Receba pontuação e orientações instantâneas após cada exercício</p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacidade</h3>
              <p className="text-muted-foreground">Ambiente individualizado com dados pessoais protegidos</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SpeechAI</span>
            </div>
            <p className="text-muted-foreground">Projeto Acadêmico - INATEL & Control System</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
