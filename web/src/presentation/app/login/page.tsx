"use client"

import React, { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/user-provider"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/presentation/components"
import { ArrowLeft, Loader2, Mic } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useUser()
  const router = useNavigate()
  const { toast } = useToast()

    // Funções para navegação
  const goHome = () => router("/");
  const goForgotPassword = () => router("/forgot-password");
  const goRegister = () => router("/register");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao SpeechAI.",
        })
        router("/dashboard")
      } else {
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
          variant: "error",
        })
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Ocorreu um erro inesperado. Tente novamente."
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <button
          type="button"
          onClick={goHome}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar ao início
        </button>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mic className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Entrar no SpeechAI</CardTitle>
            <CardDescription>Acesse sua conta para continuar seus exercícios</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="bg-input border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  className="bg-input border-border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={goForgotPassword}
                className="text-sm text-muted-foreground"
              >
                Esqueceu sua senha?
              </button>
            </div>

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">Não tem uma conta? </span>
              <button
                type="button"
                onClick={goRegister}
                className="text-sm text-primary hover:underline"
              >
                Cadastre-se
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
