"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  Clock,
  Bell,
  Tag,
  Flag,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  LogIn,
} from "lucide-react"
import { format, addDays, addWeeks, addMonths, isBefore } from "date-fns"
import { uz } from "date-fns/locale"
import { useTranslation } from '@/lib/translation-context'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import TaskForm from "@/components/task-form"
import ReminderForm from "@/components/reminder-form"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNotifications } from "@/hooks/use-notifications"
import ExportDialog from "@/components/export-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"

export type TaskPriority = "low" | "medium" | "high"

export type TaskCategory = "ish" | "shaxsiy" | "o'qish" | "sport" | "boshqa"

export type RecurrenceType = "daily" | "weekly" | "monthly" | "none"

export type RecurrenceInfo = {
  type: RecurrenceType
  interval: number
  daysOfWeek?: number[] // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number
  endDate?: string
}

export type Task = {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  dueDate?: string
  priority: TaskPriority
  category: TaskCategory
  userId?: string
}

export type Reminder = {
  id: string
  title: string
  description?: string
  datetime: string
  completed: boolean
  priority: TaskPriority
  category: TaskCategory
  recurrence?: RecurrenceInfo
  originalId?: string // For tracking recurring instances
  userId?: string
}

const priorityColors = {
  low: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20",
}

const categoryColors = {
  ish: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shaxsiy: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "o'qish": "bg-teal-500/10 text-teal-500 border-teal-500/20",
  sport: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  boshqa: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const priorityIcons = {
  low: <Flag className="h-3 w-3" />,
  medium: <Flag className="h-3 w-3" />,
  high: <Flag className="h-3 w-3" />,
}

interface TaskManagerProps {
  showReminders?: boolean
}

function LoginPrompt({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md border-primary/20 p-6 shadow-lg">
        <CardContent className="space-y-4 text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary" />
          <h2 className="text-2xl font-bold">{t.login_required}</h2>
          <p className="text-muted-foreground">
            {t.login_to_add_tasks}
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
              <Link href="/auth">
                {t.login}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function TaskManager({ showReminders = false }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all")
  const [filterCategory, setFilterCategory] = useState<TaskCategory | "all">("all")
  const [filterCompleted, setFilterCompleted] = useState<"all" | "completed" | "pending">("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { requestPermission, sendNotification } = useNotifications()
  const { user } = useAuth()
  const { t } = useTranslation()

  // Fetch tasks and reminders from Supabase
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (tasksError) throw tasksError

        // Fetch reminders
        const { data: remindersData, error: remindersError } = await supabase
          .from("reminders")
          .select("*")
          .eq("user_id", user.id)
          .order("datetime", { ascending: true })

        if (remindersError) throw remindersError

        // Transform data to match our types
        const transformedTasks: Task[] = tasksData.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          completed: task.completed,
          createdAt: task.created_at,
          dueDate: task.due_date || undefined,
          priority: task.priority as TaskPriority,
          category: task.category as TaskCategory,
          userId: task.user_id,
        }))

        const transformedReminders: Reminder[] = remindersData.map((reminder) => ({
          id: reminder.id,
          title: reminder.title,
          description: reminder.description || undefined,
          datetime: reminder.datetime,
          completed: reminder.completed,
          priority: reminder.priority as TaskPriority,
          category: reminder.category as TaskCategory,
          recurrence: reminder.recurrence as RecurrenceInfo | undefined,
          originalId: reminder.original_id || undefined,
          userId: reminder.user_id,
        }))

        setTasks(transformedTasks)
        setReminders(transformedReminders)
      } catch (error: any) {
        console.error("Error fetching data:", error)
        toast({
          title: t.error,
          description: t.task_fetch_error,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Request notification permission on component mount
    requestPermission()

    // Check for due reminders every minute
    const checkRemindersInterval = setInterval(checkReminders, 60000)
    return () => clearInterval(checkRemindersInterval)
  }, [user])

  const checkReminders = () => {
    if (!user) return

    const now = new Date()
    const updatedReminders: Reminder[] = [...reminders]
    let hasChanges = false

    reminders.forEach((reminder, index) => {
      if (!reminder.completed) {
        const reminderTime = new Date(reminder.datetime)

        // If the reminder is due within the next minute
        if (reminderTime > now && reminderTime.getTime() - now.getTime() <= 60000) {
          sendNotification(reminder.title, {
            body: reminder.description || "Eslatma vaqti keldi!",
            icon: "/favicon.ico",
          })
        }

        // Handle recurring reminders that are past due
        if (reminder.recurrence && isBefore(reminderTime, now) && !reminder.completed) {
          // Mark the current reminder as completed
          updatedReminders[index] = { ...reminder, completed: true }
          hasChanges = true

          // Create the next occurrence
          const nextReminder = createNextRecurrence(reminder)
          if (nextReminder) {
            updatedReminders.push(nextReminder)
          }
        }
      }
    })

    if (hasChanges) {
      setReminders(updatedReminders)
      // Update in Supabase
      updatedReminders.forEach(async (reminder) => {
        if (reminder.id) {
          await supabase
            .from("reminders")
            .update({
              completed: reminder.completed,
            })
            .eq("id", reminder.id)
        }
      })
    }
  }

  const createNextRecurrence = (reminder: Reminder): Reminder | null => {
    if (!reminder.recurrence || reminder.recurrence.type === "none" || !user) {
      return null
    }

    const currentDate = new Date(reminder.datetime)
    let nextDate: Date

    switch (reminder.recurrence.type) {
      case "daily":
        nextDate = addDays(currentDate, reminder.recurrence.interval)
        break
      case "weekly":
        nextDate = addWeeks(currentDate, reminder.recurrence.interval)
        break
      case "monthly":
        nextDate = addMonths(currentDate, reminder.recurrence.interval)
        break
      default:
        return null
    }

    // Check if we've reached the end date
    if (reminder.recurrence.endDate && isBefore(new Date(reminder.recurrence.endDate), nextDate)) {
      return null
    }

    // Create the next reminder
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: reminder.title,
      description: reminder.description,
      datetime: nextDate.toISOString(),
      completed: false,
      priority: reminder.priority,
      category: reminder.category,
      recurrence: reminder.recurrence,
      originalId: reminder.originalId || reminder.id,
      userId: user.id,
    }

    // Add to Supabase
    supabase
      .from("reminders")
      .insert({
        id: newReminder.id,
        title: newReminder.title,
        description: newReminder.description || null,
        datetime: newReminder.datetime,
        completed: newReminder.completed,
        priority: newReminder.priority,
        category: newReminder.category,
        recurrence: newReminder.recurrence || null,
        original_id: newReminder.originalId || null,
        user_id: user.id,
      })
      .then(({ error }) => {
        if (error) {
          console.error("Error creating recurring reminder:", error)
        }
      })

    return newReminder
  }

  const addTask = async (
    title: string,
    description: string,
    dueDate: string,
    priority: TaskPriority,
    category: TaskCategory,
  ) => {
    if (!user) return

    setIsLoading(true)
    try {
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        description,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDate || undefined,
        priority,
        category,
        userId: user.id,
      }

      // Add to Supabase
      const { error } = await supabase.from("tasks").insert({
        id: newTask.id,
        title: newTask.title,
        description: newTask.description || null,
        completed: newTask.completed,
        created_at: newTask.createdAt,
        due_date: newTask.dueDate || null,
        priority: newTask.priority,
        category: newTask.category,
        user_id: user.id,
      })

      if (error) throw error

      setTasks([newTask, ...tasks])
      setShowTaskForm(false)
      toast({
        title: t.task_added,
        description: t.task_added_description,
      })
    } catch (error: any) {
      console.error("Error adding task:", error)
      toast({
        title: t.error,
        description: t.task_added_error,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addReminder = async (
    title: string,
    description: string,
    datetime: string,
    priority: TaskPriority,
    category: TaskCategory,
    recurrence?: RecurrenceInfo,
  ) => {
    if (!user) return

    setIsLoading(true)
    try {
      const newReminder: Reminder = {
        id: Date.now().toString(),
        title,
        description,
        datetime,
        completed: false,
        priority,
        category,
        recurrence: recurrence?.type !== "none" ? recurrence : undefined,
        userId: user.id,
      }

      // Add to Supabase
      const { error } = await supabase.from("reminders").insert({
        id: newReminder.id,
        title: newReminder.title,
        description: newReminder.description || null,
        datetime: newReminder.datetime,
        completed: newReminder.completed,
        priority: newReminder.priority,
        category: newReminder.category,
        recurrence: newReminder.recurrence || null,
        user_id: user.id,
      })

      if (error) throw error

      setReminders([...reminders, newReminder])
      setShowReminderForm(false)
      toast({
        title: "Eslatma qo'shildi",
        description: "Yangi eslatma muvaffaqiyatli qo'shildi",
      })

      // Schedule notification
      const reminderTime = new Date(datetime)
      const now = new Date()
      const timeUntilReminder = reminderTime.getTime() - now.getTime()

      if (timeUntilReminder > 0) {
        setTimeout(() => {
          sendNotification(title, {
            body: description || "Eslatma vaqti keldi!",
            icon: "/favicon.ico",
          })
        }, timeUntilReminder)
      }
    } catch (error: any) {
      console.error("Error adding reminder:", error)
      toast({
        title: "Xatolik yuz berdi",
        description: "Eslatma qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTaskCompletion = async (id: string) => {
    if (!user) return

    try {
      const taskIndex = tasks.findIndex((t) => t.id === id)
      if (taskIndex === -1) return

      const task = tasks[taskIndex]
      const updatedTask = { ...task, completed: !task.completed }
      const updatedTasks = [...tasks]
      updatedTasks[taskIndex] = updatedTask

      // Update in Supabase
      const { error } = await supabase
        .from("tasks")
        .update({ completed: updatedTask.completed })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      setTasks(updatedTasks)
    } catch (error: any) {
      console.error("Error updating task:", error)
      toast({
        title: "Xatolik yuz berdi",
        description: "Vazifani yangilashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const toggleReminderCompletion = async (id: string) => {
    if (!user) return

    try {
      const reminderIndex = reminders.findIndex((r) => r.id === id)
      if (reminderIndex === -1) return

      const reminder = reminders[reminderIndex]
      const updatedReminders = [...reminders]

      // Toggle the completion status
      const updatedReminder = {
        ...reminder,
        completed: !reminder.completed,
      }
      updatedReminders[reminderIndex] = updatedReminder

      // Update in Supabase
      const { error } = await supabase
        .from("reminders")
        .update({ completed: updatedReminder.completed })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error

      // If marking as completed and it's a recurring reminder, create the next occurrence
      if (!reminder.completed && reminder.recurrence && reminder.recurrence.type !== "none") {
        const nextReminder = createNextRecurrence(reminder)
        if (nextReminder) {
          updatedReminders.push(nextReminder)
        }
      }

      setReminders(updatedReminders)
    } catch (error: any) {
      console.error("Error updating reminder:", error)
      toast({
        title: "Xatolik yuz berdi",
        description: "Eslatmani yangilashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (id: string) => {
    if (!user) return

    try {
      // Delete from Supabase
      const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      setTasks(tasks.filter((task) => task.id !== id))
      toast({
        title: t.task_deleted,
        description: t.task_deleted_description,
      })
    } catch (error: any) {
      console.error("Error deleting task:", error)
      toast({
        title: t.error,
        description: t.task_deleted_error,
        variant: "destructive",
      })
    }
  }

  const deleteReminder = async (id: string) => {
    if (!user) return

    try {
      // Find the reminder to check if it's recurring
      const reminder = reminders.find((r) => r.id === id)

      if (reminder?.recurrence && reminder.recurrence.type !== "none") {
        // If it's recurring, ask if they want to delete all occurrences
        const originalId = reminder.originalId || reminder.id
        const isSeriesDelete = window.confirm(t.delete_all_reminders)

        if (isSeriesDelete) {
          // Delete all reminders in the series from Supabase
          const { error } = await supabase
            .from("reminders")
            .delete()
            .or(`id.eq.${originalId},original_id.eq.${originalId}`)
            .eq("user_id", user.id)

          if (error) throw error

          // Delete all reminders in the series from state
          setReminders(reminders.filter((r) => !(r.id === originalId || r.originalId === originalId)))
          toast({
            title: t.reminder_deleted,
            description: t.reminder_deleted_description,
          })
        } else {
          // Delete only this occurrence from Supabase
          const { error } = await supabase.from("reminders").delete().eq("id", id).eq("user_id", user.id)

          if (error) throw error

          // Delete only this occurrence from state
          setReminders(reminders.filter((r) => r.id !== id))
          toast({
            title: t.reminder_deleted,
            description: t.reminder_deleted_description,
          })
        }
      } else {
        // Regular non-recurring reminder
        const { error } = await supabase.from("reminders").delete().eq("id", id).eq("user_id", user.id)

        if (error) throw error

        setReminders(reminders.filter((r) => r.id !== id))
        toast({
          title: t.reminder_deleted,
          description: t.reminder_deleted_description,
        })
      }
    } catch (error: any) {
      console.error("Error deleting reminder:", error)
      toast({
        title: t.error,
        description: t.reminder_deleted_error,
        variant: "destructive", 
      })
    }
  }

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority
    const categoryMatch = filterCategory === "all" || task.category === filterCategory
    const completedMatch =
      filterCompleted === "all" ||
      (filterCompleted === "completed" && task.completed) ||
      (filterCompleted === "pending" && !task.completed)
    return priorityMatch && categoryMatch && completedMatch
  })

  // Filter reminders based on selected filters
  const filteredReminders = reminders.filter((reminder) => {
    const priorityMatch = filterPriority === "all" || reminder.priority === filterPriority
    const categoryMatch = filterCategory === "all" || reminder.category === filterCategory
    const completedMatch =
      filterCompleted === "all" ||
      (filterCompleted === "completed" && reminder.completed) ||
      (filterCompleted === "pending" && !reminder.completed)
    return priorityMatch && categoryMatch && completedMatch
  })

  const sortedReminders = [...filteredReminders].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  )

  const resetFilters = () => {
    setFilterPriority("all")
    setFilterCategory("all")
    setFilterCompleted("all")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 },
  }

  const getRecurrenceText = (recurrence?: RecurrenceInfo) => {
    if (!recurrence || recurrence.type === "none") return null

    switch (recurrence.type) {
      case "daily":
        return `Har ${recurrence.interval} kunda takrorlanadi`
      case "weekly":
        return `Har ${recurrence.interval} haftada takrorlanadi`
      case "monthly":
        return `Har ${recurrence.interval} oyda takrorlanadi`
      default:
        return null
    }
  }

  const handleAddClick = () => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }
    if (showReminders) {
      setShowReminderForm(true)
    } else {
      setShowTaskForm(true)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showLoginPrompt && (
          <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                {t.filter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{t.priority}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterPriority("all")}>{t.all}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("low")}>{t.low}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("medium")}>{t.medium}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("high")}>{t.high}</DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>{t.category}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterCategory("all")}>{t.all}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("ish")}>{t.work}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("shaxsiy")}>{t.personal}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("o'qish")}>{t.study}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("sport")}>{t.sport}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCategory("boshqa")}>{t.other}</DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>{t.status}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterCompleted("all")}>{t.all}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCompleted("completed")}>{t.completed}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterCompleted("pending")}>{t.pending}</DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetFilters}>{t.clear_filters}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {filterPriority !== "all" && (
            <Badge variant="outline" className={`${priorityColors[filterPriority]} animate-pulse`}>
              {filterPriority === "low" && t.low}
              {filterPriority === "medium" && t.medium}
              {filterPriority === "high" && t.high}
            </Badge>
          )}

          {filterCategory !== "all" && (
            <Badge variant="outline" className={`${categoryColors[filterCategory]} animate-pulse`}>
              {filterCategory === "ish" && t.work}
              {filterCategory === "shaxsiy" && t.personal}
              {filterCategory === "o'qish" && t.study}
              {filterCategory === "sport" && t.sport}
              {filterCategory === "boshqa" && t.other}
            </Badge>
          )}

          {filterCompleted !== "all" && (
            <Badge variant="outline" className="animate-pulse">
              {filterCompleted === "completed" && t.completed}
              {filterCompleted === "pending" && t.pending}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            {t.export}
          </Button>

          <Button
            onClick={handleAddClick}
            className="group bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
          >
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
            {showReminders ? t.add_reminder : t.add_task}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showTaskForm && !showReminders && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskForm onSubmit={addTask} onCancel={() => setShowTaskForm(false)} />
          </motion.div>
        )}

        {showReminderForm && showReminders && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReminderForm onSubmit={addReminder} onCancel={() => setShowReminderForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
        <AnimatePresence>
          {!showReminders &&
            (filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-medium">
                  {t.tasks_empty}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.add_task_button}
                </p>
              </motion.div>
            ) : (
              filteredTasks.map((task) => (
                <motion.div key={task.id} variants={itemVariants} exit="exit" layout className="overflow-hidden">
                  <Card
                    className={`overflow-hidden border-l-4 transition-all hover:shadow-md ${
                      task.completed
                        ? "border-l-primary"
                        : `border-l-${task.priority === "high" ? "red" : task.priority === "medium" ? "orange" : "green"}-500`
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="mt-0.5 h-6 w-6 rounded-full p-0"
                              onClick={() => toggleTaskCompletion(task.id)}
                            >
                              {task.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                              <span className="sr-only">
                                {task.completed ? "Bajarilgan deb belgilash" : "Bajarilmagan deb belgilash"}
                              </span>
                            </Button>
                            <div className="space-y-1">
                              <p
                                className={`font-medium ${task.completed ? "text-muted-foreground line-through" : ""}`}
                              >
                                {task.title}
                              </p>
                              {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t.delete}</span>
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={priorityColors[task.priority]}>
                                  {priorityIcons[task.priority]}
                                  <span className="ml-1">
                                    {task.priority === "low" && t.low}
                                    {task.priority === "medium" && t.medium}
                                    {task.priority === "high" && t.high}
                                  </span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.priority}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={categoryColors[task.category]}>
                                  <Tag className="mr-1 h-3 w-3" />
                                  {task.category === "ish" && t.work}
                                  {task.category === "shaxsiy" && t.personal}
                                  {task.category === "o'qish" && t.study}
                                  {task.category === "sport" && t.sport}
                                  {task.category === "boshqa" && t.other}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Kategoriya</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {task.dueDate && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className={
                                      new Date(task.dueDate) < new Date() && !task.completed
                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    }
                                  >
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {format(new Date(task.dueDate), "d MMMM yyyy", { locale: uz })}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Muddati</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ))}

          {showReminders &&
            (sortedReminders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-medium">
                  {t.reminders_empty}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.add_reminder_button}
                </p>
              </motion.div>
            ) : (
              sortedReminders.map((reminder) => (
                <motion.div key={reminder.id} variants={itemVariants} exit="exit" layout className="overflow-hidden">
                  <Card
                    className={`overflow-hidden border-l-4 transition-all hover:shadow-md ${
                      reminder.completed
                        ? "border-l-primary"
                        : `border-l-${
                            reminder.priority === "high" ? "red" : reminder.priority === "medium" ? "orange" : "green"
                          }-500`
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="mt-0.5 h-6 w-6 rounded-full p-0"
                              onClick={() => toggleReminderCompletion(reminder.id)}
                            >
                              {reminder.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                              <span className="sr-only">
                                {reminder.completed ? "Bajarilgan deb belgilash" : "Bajarilmagan deb belgilash"}
                              </span>
                            </Button>
                            <div className="space-y-1">
                              <p
                                className={`font-medium ${
                                  reminder.completed ? "text-muted-foreground line-through" : ""
                                }`}
                              >
                                {reminder.title}
                              </p>
                              {reminder.description && (
                                <p className="text-sm text-muted-foreground">{reminder.description}</p>
                              )}
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                {format(new Date(reminder.datetime), "d MMMM yyyy, HH:mm", { locale: uz })}
                                {new Date(reminder.datetime) < new Date() && !reminder.completed && (
                                  <span className="ml-2 flex items-center text-red-500">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    O'tib ketgan
                                  </span>
                                )}
                              </div>

                              {reminder.recurrence && reminder.recurrence.type !== "none" && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <RefreshCw className="mr-1 h-3 w-3" />
                                  {getRecurrenceText(reminder.recurrence)}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteReminder(reminder.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">O'chirish</span>
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={priorityColors[reminder.priority]}>
                                  {priorityIcons[reminder.priority]}
                                  <span className="ml-1">
                                    {reminder.priority === "low" && "Past"}
                                    {reminder.priority === "medium" && "O'rta"}
                                    {reminder.priority === "high" && "Yuqori"}
                                  </span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.priority}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={categoryColors[reminder.category]}>
                                  <Tag className="mr-1 h-3 w-3" />
                                  {reminder.category === "ish" && t.work}
                                  {reminder.category === "shaxsiy" && t.personal}
                                  {reminder.category === "o'qish" && t.study}
                                  {reminder.category === "sport" && t.sport}
                                  {reminder.category === "boshqa" && t.other}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.category}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="bg-purple-500/10 text-purple-500 border-purple-500/20"
                                >
                                  <Bell className="mr-1 h-3 w-3" />
                                  {t.reminder}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t.reminder}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {reminder.recurrence && reminder.recurrence.type !== "none" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    {t.recurring}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getRecurrenceText(reminder.recurrence)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ))}
        </AnimatePresence>
      </motion.div>

      <ExportDialog open={showExportDialog} onOpenChange={setShowExportDialog} tasks={tasks} reminders={reminders} />
    </div>
  )
}
