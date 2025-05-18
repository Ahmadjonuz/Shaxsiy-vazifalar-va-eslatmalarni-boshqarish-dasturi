"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TaskManager from "@/components/task-manager"
import Statistics from "@/components/statistics"
import { ModeToggle } from "@/components/mode-toggle"
import { UserMenu } from "@/components/user-menu"
import { useContext } from 'react'

import { useTranslation } from '@/lib/translation-context'
import LocaleSwitcher from "@/components/locale-switcher"

export default function Home() {
  const { t } = useTranslation()
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            {t.tasks}
          </h1>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ModeToggle />
            <UserMenu />
          </div>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">{t.tasks}</TabsTrigger>
            <TabsTrigger value="reminders">{t.reminders}</TabsTrigger>
            <TabsTrigger value="statistics">{t.statistics}</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4 pt-4">
            <TaskManager />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4 pt-4">
            <TaskManager showReminders={true} />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4 pt-4">
            <Statistics />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
