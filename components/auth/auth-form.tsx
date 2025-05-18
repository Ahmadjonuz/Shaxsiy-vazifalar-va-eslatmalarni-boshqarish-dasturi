"use client"

import type React from "react"
// import type { TFunction } from 'next-intl';

import { useState } from "react"
import { motion } from "framer-motion"
import { LogIn, UserPlus, Loader2, AlertCircle, Mail, Home } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function AuthForm({ t }: { t: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setShowSuccessMessage(false)

    try {
      // Emailni tekshirish
      const { data: existingUser } = await supabase
        .from('users')
        .select()
        .eq('email', email)
        .single()

      if (existingUser) {
        setError('Bu email allaqachon ro\'yxatdan o\'tgan')
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        if (error.message.includes('email')) {
          setError('Noto\'g\'ri email formati')
        } else if (error.message.includes('password')) {
          setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
        } else {
          setError(error.message)
        }
        return
      }

      setShowSuccessMessage(true)
      toast({
        title: "Muvaffaqiyatli ro'yxatdan o'tdingiz! ✨",
        description: (
          <div className="mt-2 flex flex-col gap-2">
            <p>Emailingizga tasdiqlash xabari yuborildi.</p>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <span className="font-medium">{email}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Iltimos, emailingizni tekshiring va tasdiqlash havolasini bosing.
            </p>
          </div>
        ),
        duration: 10000, // 10 seconds
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Avval email mavjudligini tekshirish
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email === email && !user?.email_confirmed_at) {
        setError('Emailingiz tasdiqlanmagan. Iltimos, emailingizni tasdiqlang')
        return
      }

      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          // Email mavjudligini tekshirish
          const { data: userExists } = await supabase
            .from('users')
            .select()
            .eq('email', email)
            .single()

          if (!userExists) {
            setError('Bunday email mavjud emas')
          } else {
            setError('Parol noto\'g\'ri')
          }
        } else {
          setError(signInError.message)
        }
        return
      }

      if (!data.user?.email_confirmed_at) {
        setError('Emailingiz tasdiqlanmagan. Iltimos, emailingizni tasdiqlang')
        return
      }

      toast({
        title: t.login,
        description: t.successfully_logged_in,
      })

    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-4">
          <Button
            variant="ghost"
            asChild
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Bosh sahifa</span>
            </Link>
          </Button>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>{t.login}</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>{t.register}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>{t.login}</CardTitle>
                <CardDescription>{t.please_login}</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t.password}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>{t.login}...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>{t.login}</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>{t.register}</CardTitle>
                <CardDescription>Yangi hisob yaratish</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {showSuccessMessage && (
                    <Alert className="border-green-500 bg-green-500/10 text-green-500">
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        Emailingizga tasdiqlash xabari yuborildi. Iltimos, emailingizni tekshiring.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t.password}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Parol kamida 6 ta belgidan iborat bo'lishi kerak</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>{t.register}...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>{t.register}</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
