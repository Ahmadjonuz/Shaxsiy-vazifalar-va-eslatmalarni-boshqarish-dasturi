"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, X } from "lucide-react"
import { useTranslation } from '@/lib/translation-context'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TaskPriority, TaskCategory } from "@/components/task-manager"

interface TaskFormProps {
  onSubmit: (
    title: string,
    description: string,
    dueDate: string,
    priority: TaskPriority,
    category: TaskCategory,
  ) => void
  onCancel: () => void
}

export default function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [category, setCategory] = useState<TaskCategory>("boshqa")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit(title.trim(), description.trim(), dueDate, priority, category)
      setTitle("")
      setDescription("")
      setDueDate("")
      setPriority("medium")
      setCategory("boshqa")
    }
  }

  // Get current date in local timezone for min attribute
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const currentDate = `${year}-${month}-${day}`

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">{t.new_task}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t.task_name}</Label>
              <Input
                id="title"
                placeholder={t.enter_task_name}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="focus-visible:ring-primary"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.description_optional}</Label>
              <Textarea
                id="description"
                placeholder={t.additional_info}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="focus-visible:ring-primary"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="dueDate">{t.due_date_optional}</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={currentDate}
                  className="focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">{t.priority}</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                  <SelectTrigger id="priority" className="focus-visible:ring-primary">
                    <SelectValue placeholder={t.select_priority} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t.low}</SelectItem>
                    <SelectItem value="medium">{t.medium}</SelectItem>
                    <SelectItem value="high">{t.high}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t.category}</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as TaskCategory)}>
                  <SelectTrigger id="category" className="focus-visible:ring-primary">
                    <SelectValue placeholder={t.select_category} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ish">{t.work}</SelectItem>
                    <SelectItem value="shaxsiy">{t.personal}</SelectItem>
                    <SelectItem value="o'qish">{t.study}</SelectItem>
                    <SelectItem value="sport">{t.sport}</SelectItem>
                    <SelectItem value="boshqa">{t.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="group">
              <X className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="group bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              {t.add}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
