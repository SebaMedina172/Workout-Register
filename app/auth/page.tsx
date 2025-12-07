"use client"

import type React from "react"
import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Dumbbell, Mail, Lock, User, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from 'next/image'

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
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { t } = useLanguage()

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
      errors.email = t.auth.emailRequired
    } else if (!validateEmail(email)) {
      errors.email = t.auth.validEmailRequired
    }

    if (!password) {
      errors.password = t.auth.passwordRequired
    } else if (!validatePassword(password)) {
      errors.password = t.auth.passwordMinLength
    }

    if (isSignUp) {
      if (!confirmPassword) {
        errors.confirmPassword = t.auth.confirmPasswordRequired
      } else if (password !== confirmPassword) {
        errors.confirmPassword = t.auth.passwordsDontMatch
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
        setMessage(t.auth.welcomeBack)
        setMessageType("success")
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1000)
      }
    } catch (error) {
      setMessage(t.auth.unexpectedSignInError)
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
        setMessage(t.auth.accountCreatedSuccess)
        setMessageType("success")
      }
    } catch (error) {
      setMessage(t.auth.unexpectedSignUpError)
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
      setMessage(t.auth.googleConnectionError)
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
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Language Switcher and Theme Toggle - Fixed position top right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      {/* Left side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden flex items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-slate-900/40 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-slate-950/20" />

        <div className="relative z-10 flex flex-col items-center text-white dark:text-slate-100 text-center max-w-md mx-auto">
          <div className="mb-8">
            <Image 
              src="/android-chrome-192x192.png" 
              alt="Mi Entrenamiento Logo" 
              width={192} 
              height={192}
              className="object-contain" 
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">{t.auth.appTitle}</h1>
          <p className="text-xl text-slate-300 dark:text-slate-400 leading-relaxed">{t.auth.appDescription}</p>
          <div className="mt-12 grid grid-cols-1 gap-6 max-w-sm mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 dark:bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400 dark:text-green-500" />
              </div>
              <span className="text-slate-300 dark:text-slate-400">{t.auth.customRoutines}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-400 dark:text-blue-500" />
              </div>
              <span className="text-slate-300 dark:text-slate-400">{t.auth.progressTracking}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 dark:bg-purple-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-400 dark:text-purple-500" />
              </div>
              <span className="text-slate-300 dark:text-slate-400">{t.auth.detailedStats}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8 pt-12">
            <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t.auth.appTitle}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">{t.auth.accessYourAccount}</p>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100">
                {t.auth.welcome}
              </CardTitle>
              <CardDescription className="text-center text-slate-600 dark:text-slate-400">
                {t.auth.signInToAccount}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleAuth}
                disabled={googleLoading || loading}
                variant="outline"
                className="w-full h-12 mb-6 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors bg-transparent"
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
                {t.auth.continueWithGoogle}
              </Button>

              <div className="relative mb-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white dark:bg-slate-800 px-3 text-sm text-slate-500 dark:text-slate-400">
                    {t.auth.orContinueWithEmail}
                  </span>
                </div>
              </div>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-700">
                  <TabsTrigger
                    value="signin"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t.auth.signIn}
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {t.auth.signUp}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                        {t.auth.email}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            clearValidationError("email")
                          }}
                          className={`pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors ${
                            validationErrors.email ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                          }`}
                          required
                        />
                      </div>
                      {validationErrors.email && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                        {t.auth.password}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            clearValidationError("password")
                          }}
                          className={`pl-10 pr-10 h-12 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors ${
                            validationErrors.password ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.password}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium transition-colors"
                      disabled={loading || googleLoading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t.auth.signingIn}
                        </>
                      ) : (
                        t.auth.signIn
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-slate-700 dark:text-slate-300 font-medium">
                        {t.auth.email}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            clearValidationError("email")
                          }}
                          className={`pl-10 h-12 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors ${
                            validationErrors.email ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                          }`}
                          required
                        />
                      </div>
                      {validationErrors.email && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-700 dark:text-slate-300 font-medium">
                        {t.auth.password}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t.auth.passwordMinLength}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            clearValidationError("password")
                          }}
                          className={`pl-10 pr-10 h-12 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors ${
                            validationErrors.password ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                          }`}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.password}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-slate-700 dark:text-slate-300 font-medium">
                        {t.auth.confirmPassword}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t.auth.confirmPassword}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            clearValidationError("confirmPassword")
                          }}
                          className={`pl-10 pr-10 h-12 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors ${
                            validationErrors.confirmPassword
                              ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                              : ""
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 font-medium">
                        {t.auth.passwordRequirements}
                      </p>
                      <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <li
                          className={`flex items-center ${password.length >= 6 ? "text-green-600 dark:text-green-400" : ""}`}
                        >
                          <CheckCircle
                            className={`w-3 h-3 mr-2 ${password.length >= 6 ? "text-green-500 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}`}
                          />
                          {t.auth.atLeast6Characters}
                        </li>
                        <li
                          className={`flex items-center ${password && confirmPassword && password === confirmPassword ? "text-green-600 dark:text-green-400" : ""}`}
                        >
                          <CheckCircle
                            className={`w-3 h-3 mr-2 ${password && confirmPassword && password === confirmPassword ? "text-green-500 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}`}
                          />
                          {t.auth.passwordsMatch}
                        </li>
                      </ul>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium transition-colors"
                      disabled={loading || googleLoading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t.auth.creatingAccount}
                        </>
                      ) : (
                        t.auth.createAccount
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {message && (
                <Alert
                  className={`mt-6 ${
                    messageType === "success"
                      ? "border-green-200 bg-green-50 dark:border-green-400 dark:bg-green-900/20"
                      : "border-red-200 bg-red-50 dark:border-red-400 dark:bg-red-900/20"
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <AlertDescription
                    className={
                      messageType === "success"
                        ? "text-green-800 dark:text-green-300"
                        : "text-red-800 dark:text-red-300"
                    }
                  >
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">{t.auth.termsAndPrivacy}</p>
        </div>
      </div>
    </div>
  )
}
