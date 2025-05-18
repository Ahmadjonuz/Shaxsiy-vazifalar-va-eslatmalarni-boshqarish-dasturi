"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TaskManager from "@/components/task-manager"
import Statistics from "@/components/statistics"
import { ModeToggle } from "@/components/mode-toggle"
import { UserMenu } from "@/components/user-menu"
import { useContext } from 'react'
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { useTranslation } from '@/lib/translation-context'
import LocaleSwitcher from "@/components/locale-switcher"

export default function Home() {
  const { t } = useTranslation()
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
            {t.tasks}
          </h1>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2">
            <LocaleSwitcher />
            <ModeToggle />
            <UserMenu />
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <ModeToggle />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] p-4">
                <SheetHeader>
                  <SheetTitle>{t.profile}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  <UserMenu />
                </div>
              </SheetContent>
            </Sheet>
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
