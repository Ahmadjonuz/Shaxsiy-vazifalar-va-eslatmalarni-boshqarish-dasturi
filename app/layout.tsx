import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AuthProvider from "@/components/auth/auth-provider"
import { TranslationProvider } from '@/lib/translation-context'
// import { translations, Locale } from '@/lib/translation'
// import { createContext } from 'react'
// import { TranslationProvider } from '@/lib/translation-context'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vazifalar va Eslatmalar",
  description: "Shaxsiy vazifalar va eslatmalarni boshqarish dasturi",
    generator: 'Karimov Ahmadjon'
}

export default function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: { locale?: string }
}>) {
  const locale = params?.locale || 'uz';
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TranslationProvider>
              {children}
            </TranslationProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
