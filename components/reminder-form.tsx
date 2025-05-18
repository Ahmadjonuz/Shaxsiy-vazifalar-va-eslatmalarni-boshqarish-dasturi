"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, X, Info } from "lucide-react"
import { useTranslation } from '@/lib/translation-context'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { TaskPriority, TaskCategory, RecurrenceType, RecurrenceInfo } from "@/components/task-manager"

interface ReminderFormProps {
  onSubmit: (
    title: string,
    description: string,
    datetime: string,
    priority: TaskPriority,
    category: TaskCategory,
    recurrence?: RecurrenceInfo,
  ) => void
  onCancel: () => void
}

export default function ReminderForm({ onSubmit, onCancel }: ReminderFormProps) {
  const { t } = useTranslation()
  
  const daysOfWeek = [
    { value: 0, label: t.sunday },
    { value: 1, label: t.monday },
    { value: 2, label: t.tuesday },
    { value: 3, label: t.wednesday },
    { value: 4, label: t.thursday },
    { value: 5, label: t.friday },
    { value: 6, label: t.saturday },
  ]

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [datetime, setDatetime] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [category, setCategory] = useState<TaskCategory>("boshqa")

  // Recurrence settings
  const [recurrenceTab, setRecurrenceTab] = useState<"none" | "recurrence">("none")
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("daily")
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([])
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && datetime) {
      // Create recurrence info if recurrence is enabled
      let recurrence: RecurrenceInfo | undefined

      if (recurrenceTab === "recurrence") {
        recurrence = {
          type: recurrenceType,
          interval: recurrenceInterval,
        }

        if (recurrenceType === "weekly") {
          recurrence.daysOfWeek = selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek : [new Date(datetime).getDay()] // Default to the day of the selected date
        }

        if (recurrenceType === "monthly") {
          recurrence.dayOfMonth = dayOfMonth
        }

        if (hasEndDate && endDate) {
          recurrence.endDate = endDate
        }
      } else {
        recurrence = { type: "none", interval: 0 }
      }

      onSubmit(title.trim(), description.trim(), datetime, priority, category, recurrence)

      // Reset form
      setTitle("")
      setDescription("")
      setDatetime("")
      setPriority("medium")
      setCategory("boshqa")
      setRecurrenceTab("none")
      setRecurrenceType("daily")
      setRecurrenceInterval(1)
      setSelectedDaysOfWeek([])
      setDayOfMonth(1)
      setHasEndDate(false)
      setEndDate("")
    }
  }

  // Get current datetime in local timezone for min attribute
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const currentDatetime = `${year}-${month}-${day}T${hours}:${minutes}`

  // Handle day of week selection
  const toggleDayOfWeek = (day: number) => {
    setSelectedDaysOfWeek((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  // Generate days of month options (1-31)
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">{t.new_reminder}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t.reminder_name}</Label>
              <Input
                id="title"
                placeholder={t.enter_reminder_name}
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
                placeholder={t.reminder_description}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="focus-visible:ring-primary"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="datetime">{t.date_and_time}</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  min={currentDatetime}
                  className="focus-visible:ring-primary"
                  required
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t.recurring}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">{t.recurring_reminders_info}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">{t.recurring_reminders}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t.recurring_reminders_description}
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Tabs value={recurrenceTab} onValueChange={(value) => setRecurrenceTab(value as "none" | "recurrence")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="none">{t.no_recurrence}</TabsTrigger>
                  <TabsTrigger value="recurrence">{t.recurrence}</TabsTrigger>
                </TabsList>

                <TabsContent value="recurrence" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceType">{t.recurrence}</Label>
                    <Select
                      value={recurrenceType}
                      onValueChange={(value) => setRecurrenceType(value as RecurrenceType)}
                    >
                      <SelectTrigger id="recurrenceType" className="focus-visible:ring-primary">
                        <SelectValue placeholder={t.select_priority} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t.daily}</SelectItem>
                        <SelectItem value="weekly">{t.weekly}</SelectItem>
                        <SelectItem value="monthly">{t.monthly}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurrenceInterval">
                      {recurrenceType === "daily" && t.every_n_days}
                      {recurrenceType === "weekly" && t.every_n_weeks}
                      {recurrenceType === "monthly" && t.every_n_months}
                    </Label>
                    <Select
                      value={recurrenceInterval.toString()}
                      onValueChange={(value) => setRecurrenceInterval(Number.parseInt(value))}
                    >
                      <SelectTrigger id="recurrenceInterval" className="focus-visible:ring-primary">
                        <SelectValue placeholder={t.select_priority} />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 14, 30].map((interval) => (
                          <SelectItem key={interval} value={interval.toString()}>
                            {interval}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {recurrenceType === "weekly" && (
                    <div className="space-y-2">
                      <Label>{t.week_days}</Label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <Button
                            key={day.value}
                            type="button"
                            variant={selectedDaysOfWeek.includes(day.value) ? "default" : "outline"}
                            className={`h-8 w-8 p-0 ${
                              selectedDaysOfWeek.includes(day.value) ? "bg-primary hover:bg-primary/90" : ""
                            }`}
                            onClick={() => toggleDayOfWeek(day.value)}
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t.if_no_day_selected}
                      </p>
                    </div>
                  )}

                  {recurrenceType === "monthly" && (
                    <div className="space-y-2">
                      <Label htmlFor="dayOfMonth">{t.month_day}</Label>
                      <Select
                        value={dayOfMonth.toString()}
                        onValueChange={(value) => setDayOfMonth(Number.parseInt(value))}
                      >
                        <SelectTrigger id="dayOfMonth" className="focus-visible:ring-primary">
                          <SelectValue placeholder={t.select_priority} />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfMonth.map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasEndDate"
                        checked={hasEndDate}
                        onCheckedChange={(checked) => setHasEndDate(!!checked)}
                      />
                      <Label htmlFor="hasEndDate">{t.end_date}</Label>
                    </div>

                    {hasEndDate && (
                      <div className="pt-2">
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={datetime ? datetime.split("T")[0] : currentDatetime.split("T")[0]}
                          className="focus-visible:ring-primary"
                          required={hasEndDate}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="group">
              <X className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !datetime}
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
