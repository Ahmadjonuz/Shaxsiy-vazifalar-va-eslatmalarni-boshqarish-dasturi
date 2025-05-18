"use client";
import { useAuth } from '@/components/auth/auth-provider';
import { useTranslation } from '@/lib/translation-context';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return <div className="text-center p-4">{t.please_login}</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-card rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">{t.profile}</h1>
      <div className="mb-4">
        <div className="font-medium">{t.email_label}:</div>
        <div>{user.email}</div>
      </div>
      <div className="mb-6">
        <div className="font-medium">{t.user_type}:</div>
        <div>{t.user}</div>
      </div>
      <Button onClick={signOut} variant="destructive">{t.logout}</Button>
    </div>
  );
} 