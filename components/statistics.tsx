"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { CheckCircle2, Clock, Calendar, Tag, Flag, Loader2 } from "lucide-react"
import { useTranslation } from '@/lib/translation-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task, Reminder } from "@/components/task-manager"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"]
const PRIORITY_COLORS = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
}

export default function Statistics() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*").eq("user_id", user.id)

        if (tasksError) throw tasksError

        // Fetch reminders
        const { data: remindersData, error: remindersError } = await supabase
          .from("reminders")
          .select("*")
          .eq("user_id", user.id)

        if (remindersError) throw remindersError

        // Transform data to match our types
        const transformedTasks: Task[] = tasksData.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          completed: task.completed,
          createdAt: task.created_at,
          dueDate: task.due_date || undefined,
          priority: task.priority as Task["priority"],
          category: task.category as Task["category"],
          userId: task.user_id,
        }))

        const transformedReminders: Reminder[] = remindersData.map((reminder) => ({
          id: reminder.id,
          title: reminder.title,
          description: reminder.description || undefined,
          datetime: reminder.datetime,
          completed: reminder.completed,
          priority: reminder.priority as Reminder["priority"],
          category: reminder.category as Reminder["category"],
          recurrence: reminder.recurrence as Reminder["recurrence"],
          originalId: reminder.original_id || undefined,
          userId: reminder.user_id,
        }))

        setTasks(transformedTasks)
        setReminders(transformedReminders)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalReminders = reminders.length
  const completedReminders = reminders.filter((reminder) => reminder.completed).length
  const pendingReminders = totalReminders - completedReminders
  const reminderCompletionRate = totalReminders > 0 ? Math.round((completedReminders / totalReminders) * 100) : 0

  // Count recurring reminders
  const recurringReminders = reminders.filter(
    (reminder) => reminder.recurrence && reminder.recurrence.type !== "none",
  ).length

  // Category distribution
  const categoryData = [
    { name: "Ish", value: tasks.filter((task) => task.category === "ish").length },
    { name: "Shaxsiy", value: tasks.filter((task) => task.category === "shaxsiy").length },
    { name: "O'qish", value: tasks.filter((task) => task.category === "o'qish").length },
    { name: "Sport", value: tasks.filter((task) => task.category === "sport").length },
    { name: "Boshqa", value: tasks.filter((task) => task.category === "boshqa").length },
  ].filter((item) => item.value > 0)

  // Priority distribution
  const priorityData = [
    { name: "Past", value: tasks.filter((task) => task.priority === "low").length, color: PRIORITY_COLORS.low },
    { name: "O'rta", value: tasks.filter((task) => task.priority === "medium").length, color: PRIORITY_COLORS.medium },
    { name: "Yuqori", value: tasks.filter((task) => task.priority === "high").length, color: PRIORITY_COLORS.high },
  ].filter((item) => item.value > 0)

  // Task completion by day of week
  const daysOfWeek = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"]
  const tasksByDayOfWeek = daysOfWeek.map((day, index) => {
    const count = tasks.filter((task) => {
      const taskDate = new Date(task.createdAt)
      return taskDate.getDay() === index && task.completed
    }).length
    return { name: day, value: count }
  })

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
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (totalTasks === 0 && totalReminders === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
      >
        <div className="rounded-full bg-primary/10 p-3">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-medium">{t.no_data}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.no_data}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.total_tasks}</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {completedTasks} {t.completed}, {pendingTasks} {t.pending}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-right">{completionRate}% {t.completed}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.total_reminders}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReminders}</div>
              <p className="text-xs text-muted-foreground">
                {completedReminders} {t.completed}, {pendingReminders} {t.pending}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-500"
                  style={{ width: `${reminderCompletionRate}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-right">
                {reminderCompletionRate}% {t.completed}
                {recurringReminders > 0 && `, ${recurringReminders} ${t.recurring}`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.by_priority}</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-2">
              {priorityData.length > 0 ? (
                <div className="h-[100px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={50} />
                      <Tooltip
                        formatter={(value) => [`${value} ${t.tasks}`, t.total_tasks]}
                        contentStyle={{ borderRadius: "0.5rem" }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">{t.no_data}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.by_category}</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-2">
              {categoryData.length > 0 ? (
                <div className="h-[100px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} ${t.tasks}`, t.total_tasks]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">{t.no_data}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t.tasks_by_weekday}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByDayOfWeek}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} ${t.tasks}`, t.completed_tasks]} />
                  <Legend />
                  <Bar dataKey="value" name={t.completed_tasks} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
