"use client"

import type React from "react"
import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Dumbbell, Mail, Lock, User, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("error")
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const router = useRouter()
  const supabase = createClientComponentClient()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const validateForm = (isSignUp = false) => {
    const errors: typeof validationErrors = {}

    if (!email) {
      errors.email = "El correo electrónico es requerido"
    } else if (!validateEmail(email)) {
      errors.email = "Ingresa un correo electrónico válido"
    }

    if (!password) {
      errors.password = "La contraseña es requerida"
    } else if (!validatePassword(password)) {
      errors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (isSignUp) {
      if (!confirmPassword) {
        errors.confirmPassword = "Confirma tu contraseña"
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setMessage("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        setMessageType("error")
      } else {
        setMessage("¡Bienvenido de vuelta!")
        setMessageType("success")
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1000)
      }
    } catch (error) {
      setMessage("Error inesperado al iniciar sesión")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm(true)) return

    setLoading(true)
    setMessage("")

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        setMessageType("error")
      } else {
        setMessage("¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.")
        setMessageType("success")
      }
    } catch (error) {
      setMessage("Error inesperado al crear la cuenta")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    setMessage("")

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage(error.message)
        setMessageType("error")
      }
    } catch (error) {
      setMessage("Error al conectar con Google")
      setMessageType("error")
    } finally {
      setGoogleLoading(false)
    }
  }

  const clearValidationError = (field: keyof typeof validationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-slate-900/40" />
        <div className="relative z-10 flex flex-col items-center text-white text-center max-w-md mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Mi Entrenamiento</h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Lleva el control de tus rutinas de ejercicio y alcanza tus objetivos fitness
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 max-w-sm mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-slate-300">Rutinas personalizadas</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-slate-300">Seguimiento de progreso</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-slate-300">Estadísticas detalladas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Mi Entrenamiento</h1>
            <p className="text-slate-600 mt-2">Accede a tu cuenta</p>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-slate-900">Bienvenido</CardTitle>
              <CardDescription className="text-center text-slate-600">
                Inicia sesión en tu cuenta o crea una nueva
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleAuth}
                disabled={googleLoading || loading}
                variant="outline"
                className="w-full h-12 mb-6 border-slate-200 hover:bg-slate-50 transition-colors bg-transparent"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continuar con Google
              </Button>

              <div className="relative mb-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-3 text-sm text-slate-500">o continúa con email</span>
                </div>
              </div>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <User className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Registrarse
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-medium">
                        Correo electrónico
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            clearValidationError("email")
                          }}
                          className={`pl-10 h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 transition-colors ${
                            validationErrors.email ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                          }`}
                          required
                        />
                      </div>
                      {validationErrors.email && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700 font-medium">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            clearValidationError("password")
                          }}
                          className={`pl-10 pr-10 h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 transition-colors ${
                            validationErrors.password ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.password}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
                      disabled={loading || googleLoading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        "Iniciar Sesión"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-slate-700 font-medium">
                        Correo electrónico
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            clearValidationError("email")
                          }}
                          className={`pl-10 h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 transition-colors ${
                            validationErrors.email ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                          }`}
                          required
                        />
                      </div>
                      {validationErrors.email && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-700 font-medium">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            clearValidationError("password")
                          }}
                          className={`pl-10 pr-10 h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 transition-colors ${
                            validationErrors.password ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                          }`}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.password}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-slate-700 font-medium">
                        Confirmar contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repite tu contraseña"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            clearValidationError("confirmPassword")
                          }}
                          className={`pl-10 pr-10 h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 transition-colors ${
                            validationErrors.confirmPassword
                              ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                              : ""
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600 mb-2 font-medium">Tu contraseña debe contener:</p>
                      <ul className="text-xs text-slate-500 space-y-1">
                        <li className={`flex items-center ${password.length >= 6 ? "text-green-600" : ""}`}>
                          <CheckCircle
                            className={`w-3 h-3 mr-2 ${password.length >= 6 ? "text-green-500" : "text-slate-400"}`}
                          />
                          Al menos 6 caracteres
                        </li>
                        <li
                          className={`flex items-center ${password && confirmPassword && password === confirmPassword ? "text-green-600" : ""}`}
                        >
                          <CheckCircle
                            className={`w-3 h-3 mr-2 ${password && confirmPassword && password === confirmPassword ? "text-green-500" : "text-slate-400"}`}
                          />
                          Las contraseñas coinciden
                        </li>
                      </ul>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
                      disabled={loading || googleLoading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        "Crear Cuenta"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {message && (
                <Alert
                  className={`mt-6 ${
                    messageType === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={messageType === "success" ? "text-green-800" : "text-red-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-500 mt-6">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  )
}
