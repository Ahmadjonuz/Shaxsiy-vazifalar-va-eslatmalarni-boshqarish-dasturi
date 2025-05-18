"use client"
import { useTranslation } from '@/lib/translation-context';
import AuthForm from "@/components/auth/auth-form"

export default function AuthPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <AuthForm t={t} />
    </div>
  )
}
