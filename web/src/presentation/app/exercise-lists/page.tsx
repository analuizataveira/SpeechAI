"use client"

import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/user-provider"
import { useExerciseLists } from "@/hooks/use-exercise-lists"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components"
import { Badge } from "@/presentation/components/ui/badge"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Textarea } from "@/presentation/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table"
import {
  Mic,
  Plus,
  Loader2,
  ListChecks,
  ArrowLeft,
  Stethoscope,
  Eye,
  Sparkles,
  X,
} from "lucide-react"
import { ExerciseListsRepository } from "@/data/repositories/exercise-lists/repository"
import { DiffTypesRepository } from "@/data/repositories/diff-types/repository"
import { ExercisesRepository } from "@/data/repositories/exercises/repository"
import { AiExercisesRepository } from "@/data/repositories/ai-exercises/repository"
import { IDiffTypeResponse } from "@/data/repositories/diff-types/interface"
import { IExerciseListResponse } from "@/data/repositories/exercise-lists/interface"
import LogoutIcon from "@/presentation/components/icons/logout-icon"
import Settings from "@/presentation/components/icons/settings"

export default function ExerciseListsPage() {
  const { user, isAuthenticated, userRole, logout } = useUser()
  const { toast } = useToast()
  const router = useNavigate()
  const { exerciseLists, loading: listsLoading, refetchMyLists } = useExerciseLists()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<IExerciseListResponse | null>(null)
  const [diffTypes, setDiffTypes] = useState<IDiffTypeResponse[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingDiffTypes, setIsLoadingDiffTypes] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    diffTypeId: "",
    difficultyLevel: "",
    words: [] as string[],
    currentWord: "",
    customDiffType: "", // Para permitir que o usuário digite um novo tipo
  })
  
  // Tipos de dificuldade padrão
  const defaultDiffTypes = [
    "Rótacismo (dificuldade com R)",
    "Sigmatismo (dificuldade com S)",
    "Lambdacismo (dificuldade com L)",
    "Gamacismo (dificuldade com G)",
    "Betacismo (dificuldade com B)",
    "Fonema /F/",
    "Fonema /V/",
    "Fonema /CH/",
    "Fonema /J/",
    "Fonema /Z/",
  ]

  const exerciseListsRepository = new ExerciseListsRepository()
  const diffTypesRepository = new DiffTypesRepository()
  const exercisesRepository = new ExercisesRepository()
  const aiExercisesRepository = new AiExercisesRepository()

  useEffect(() => {
    if (!isAuthenticated) {
      router("/login")
      return
    }

    // Only doctors should access this page
    if (userRole === 'PATIENT') {
      router("/dashboard")
      return
    }

    refetchMyLists()
    fetchDiffTypes()
  }, [isAuthenticated, userRole, router])

  const fetchDiffTypes = async () => {
    setIsLoadingDiffTypes(true)
    try {
      const response = await diffTypesRepository.findAll()
      console.log("Diff types response:", response)
      
      // Handle nested response structure from BaseRepository interceptor
      // Response format: { success: true, data: { success: true, ...apiData } }
      let data: IDiffTypeResponse[] = []
      
      if (response.success) {
        const innerData = (response as any).data
        if (Array.isArray(innerData)) {
          data = innerData
        } else if (innerData && typeof innerData === 'object') {
          // Check for nested data property or array-like structure
          if (Array.isArray(innerData.data)) {
            data = innerData.data
          } else {
            // Try to extract array from object values
            const values = Object.values(innerData).filter(v => typeof v !== 'boolean' && v !== undefined)
            if (values.length > 0 && Array.isArray(values[0])) {
              data = values[0] as IDiffTypeResponse[]
            } else if (values.length > 0 && typeof values[0] === 'object') {
              // Check if values are DiffType objects
              const potentialDiffTypes = values.filter(v => v && typeof v === 'object' && 'id' in (v as any) && 'description' in (v as any))
              if (potentialDiffTypes.length > 0) {
                data = potentialDiffTypes as IDiffTypeResponse[]
              }
            }
          }
        }
      }
      
      setDiffTypes(data)
    } catch (error) {
      console.error("Error fetching diff types:", error)
    } finally {
      setIsLoadingDiffTypes(false)
    }
  }

  const handleAddWord = () => {
    if (formData.currentWord.trim()) {
      setFormData({
        ...formData,
        words: [...formData.words, formData.currentWord.trim()],
        currentWord: "",
      })
    }
  }

  const handleRemoveWord = (index: number) => {
    setFormData({
      ...formData,
      words: formData.words.filter((_, i) => i !== index),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddWord()
    }
  }

  const handleCreateList = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "Digite um título para a lista.",
        variant: "error",
      })
      return
    }

    // Verificar se tem tipo de dificuldade (selecionado ou digitado)
    if (!formData.diffTypeId && !formData.customDiffType.trim()) {
      toast({
        title: "Erro",
        description: "Selecione ou digite um tipo de dificuldade.",
        variant: "error",
      })
      return
    }

    if (!formData.difficultyLevel) {
      toast({
        title: "Erro",
        description: "Selecione um nível de dificuldade.",
        variant: "error",
      })
      return
    }

    if (formData.words.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma palavra/frase.",
        variant: "error",
      })
      return
    }

    setIsCreating(true)
    try {
      let finalDiffTypeId = formData.diffTypeId

      // Se o usuário digitou um tipo customizado, criar no backend
      if (!finalDiffTypeId && formData.customDiffType.trim()) {
        const createDiffTypeResponse = await diffTypesRepository.create({
          description: formData.customDiffType.trim(),
        })
        
        if (createDiffTypeResponse.success) {
          // A resposta já vem como: { success: true, id: "...", description: "...", ... }
          // O ID está diretamente no objeto de resposta
          finalDiffTypeId = (createDiffTypeResponse as any).id
          
          if (!finalDiffTypeId) {
            console.error("Resposta do createDiffType:", JSON.stringify(createDiffTypeResponse, null, 2))
            throw new Error("Resposta não contém ID do tipo de dificuldade")
          }
        } else {
          const errorMsg = (createDiffTypeResponse as any)?.message || (createDiffTypeResponse as any)?.friendlyMessage || "Não foi possível criar o tipo de dificuldade"
          throw new Error(errorMsg)
        }
      }

      if (!finalDiffTypeId) {
        throw new Error("Tipo de dificuldade inválido")
      }

      // First, create the exercises
      const exerciseIds: string[] = []
      for (const word of formData.words) {
        const exerciseResponse = await exercisesRepository.create({
          diffTypeId: finalDiffTypeId,
          text: word,
        })
        if (exerciseResponse.success && exerciseResponse.data) {
          exerciseIds.push(exerciseResponse.data.id)
        } else if (exerciseResponse.success && (exerciseResponse as any).id) {
          exerciseIds.push((exerciseResponse as any).id)
        }
      }

      // Then create the exercise list
      const response = await exerciseListsRepository.create({
        title: formData.title.trim(),
        diffTypeId: finalDiffTypeId,
        difficultyLevel: formData.difficultyLevel,
        exerciseIds,
      })

      if (response.success) {
        toast({
          title: "Lista criada!",
          description: "A lista de exercícios foi criada com sucesso.",
        })
        setCreateDialogOpen(false)
        setFormData({
          title: "",
          diffTypeId: "",
          difficultyLevel: "",
          words: [],
          currentWord: "",
          customDiffType: "",
        })
        // Recarregar tipos de dificuldade para incluir o novo criado
        fetchDiffTypes()
        refetchMyLists()
      } else {
        toast({
          title: "Erro",
          description: (response as any).message || "Não foi possível criar a lista.",
          variant: "error",
        })
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.response?.data?.message || error?.message || "Não foi possível criar a lista.",
        variant: "error",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleViewList = (list: IExerciseListResponse) => {
    setSelectedList(list)
    setViewDialogOpen(true)
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    })
    router("/")
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  if (!user || listsLoading || isLoadingDiffTypes) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const lists = Array.isArray(exerciseLists) ? exerciseLists : []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SpeechAI</span>
              <Badge variant="secondary" className="ml-2">
                <Stethoscope className="w-3 h-3 mr-1" />
                Médico
              </Badge>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogoutIcon className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router("/dashboard-doctor")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Listas de Exercícios</h1>
            <p className="text-muted-foreground">
              Gerencie e crie listas de exercícios para seus pacientes.
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Lista
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Lista de Exercícios</DialogTitle>
                <DialogDescription>
                  Crie uma lista personalizada de exercícios para seus pacientes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Lista</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Exercícios de R"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diffType">Tipo de Dificuldade</Label>
                    <Select
                      value={formData.diffTypeId || (formData.customDiffType ? "custom" : "")}
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setFormData({ ...formData, diffTypeId: "", customDiffType: "" })
                        } else {
                          setFormData({ ...formData, diffTypeId: value, customDiffType: "" })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {diffTypes.length > 0 ? (
                          diffTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.description}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            Nenhum tipo cadastrado
                          </SelectItem>
                        )}
                        <SelectItem value="custom">+ Digitar novo tipo</SelectItem>
                      </SelectContent>
                    </Select>
                    {(!formData.diffTypeId || formData.customDiffType !== "") && (
                      <Input
                        placeholder="Ou digite um novo tipo (ex: Rótacismo, Sigmatismo)"
                        value={formData.customDiffType}
                        onChange={(e) => {
                          const value = e.target.value
                          setFormData({ 
                            ...formData, 
                            customDiffType: value,
                            diffTypeId: value ? "" : formData.diffTypeId // Limpa diffTypeId se estiver digitando
                          })
                        }}
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficultyLevel">Nível de Dificuldade</Label>
                    <Select
                      value={formData.difficultyLevel}
                      onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facil">Fácil</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="dificil">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Palavras/Frases</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite uma palavra e pressione Enter"
                      value={formData.currentWord}
                      onChange={(e) => setFormData({ ...formData, currentWord: e.target.value })}
                      onKeyPress={handleKeyPress}
                    />
                    <Button type="button" variant="outline" onClick={handleAddWord}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.words.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/50 rounded-lg">
                      {formData.words.map((word, index) => (
                        <Badge key={index} variant="secondary" className="pr-1">
                          {word}
                          <button
                            type="button"
                            onClick={() => handleRemoveWord(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.words.length} palavra(s) adicionada(s)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateList} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Lista
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lists Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecks className="w-5 h-5 mr-2 text-primary" />
              Minhas Listas
            </CardTitle>
            <CardDescription>
              Todas as listas de exercícios criadas por você
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lists.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ListChecks className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhuma lista criada ainda</p>
                <p className="text-sm mb-4">Crie sua primeira lista de exercícios</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Lista
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Exercícios</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lists.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell className="font-medium">{list.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {list.diffType?.description || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {list.difficultyLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>{list.items?.length || 0}</TableCell>
                      <TableCell>{formatDate(list.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewList(list)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View List Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedList?.title}</DialogTitle>
            <DialogDescription>
              {selectedList?.items?.length || 0} exercícios • {selectedList?.diffType?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Badge variant="outline">{selectedList?.diffType?.description}</Badge>
              <Badge variant="secondary" className="capitalize">
                {selectedList?.difficultyLevel}
              </Badge>
            </div>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedList?.items?.map((item, index) => (
                  <Badge key={item.id || index} variant="outline" className="p-2 text-center justify-center">
                    {item.exercise?.text || "N/A"}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

