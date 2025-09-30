import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { Progress } from "@/presentation/components/ui/progress"
import { FileText, Download, Calendar, TrendingUp, ArrowLeft, Filter, Share2, Eye } from "lucide-react"
import { Button } from "@/presentation/components"
import { Badge } from "@/presentation/components/ui/badge"
import { useNavigate } from "react-router-dom"

export default function ReportsPage() {

    const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold">Relatórios e Histórico</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Tudo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Progresso Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">78%</div>
              <p className="text-sm text-muted-foreground mb-4">Precisão média atual</p>
              <Progress value={78} className="mb-2" />
              <p className="text-xs text-success">+15% nos últimos 30 dias</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Sessões Completas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent mb-2">24</div>
              <p className="text-sm text-muted-foreground mb-4">Total de exercícios</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                Última: há 2 dias
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Tempo Praticado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning mb-2">4.2h</div>
              <p className="text-sm text-muted-foreground mb-4">Tempo total de prática</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mr-1" />
                Média: 12min/sessão
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>Histórico completo das suas sessões e progresso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Report Item */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Relatório Mensal - Janeiro 2024</h3>
                    <p className="text-sm text-muted-foreground">
                      8 sessões • 78% precisão média • Gerado em 31/01/2024
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">Mensal</Badge>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>

              {/* Report Item */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium">Relatório Semanal - Semana 4</h3>
                    <p className="text-sm text-muted-foreground">
                      3 sessões • 85% precisão média • Gerado em 28/01/2024
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">Semanal</Badge>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>

              {/* Report Item */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-medium">Sessão Individual - Consoantes</h3>
                    <p className="text-sm text-muted-foreground">
                      15 palavras • 78% precisão • Realizada em 26/01/2024
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">Sessão</Badge>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>

              {/* Report Item */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-medium">Análise de Progresso - 30 dias</h3>
                    <p className="text-sm text-muted-foreground">
                      Evolução detalhada • Tendências • Gerado em 25/01/2024
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">Análise</Badge>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate New Report */}
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <CardTitle>Gerar Novo Relatório</CardTitle>
            <CardDescription>Crie relatórios personalizados do seu progresso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Calendar className="w-6 h-6 mb-2" />
                <span>Relatório Semanal</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <TrendingUp className="w-6 h-6 mb-2" />
                <span>Análise de Progresso</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <FileText className="w-6 h-6 mb-2" />
                <span>Relatório Personalizado</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
