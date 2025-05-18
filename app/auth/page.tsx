"use client"
import { useTranslation } from '@/lib/translation-context';
import AuthForm from "@/components/auth/auth-form"

export default function AuthPage() {
  const t = useTranslation();
  return <AuthForm t={t} />
}
