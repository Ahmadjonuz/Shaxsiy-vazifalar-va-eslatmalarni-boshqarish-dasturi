"use client"

import { useState } from "react"
import { FileJson, FileSpreadsheet } from "lucide-react"
import { useTranslation } from '@/lib/translation-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Task, Reminder } from "@/components/task-manager"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: Task[]
  reminders: Reminder[]
}

export default function ExportDialog({ open, onOpenChange, tasks, reminders }: ExportDialogProps) {
  const [format, setFormat] = useState<"json" | "csv">("json")
  const { t } = useTranslation()

  const handleExport = () => {
    let fileContent: string
    let fileName: string
    let mimeType: string

    const exportData = {
      tasks,
      reminders,
    }

    if (format === "json") {
      fileContent = JSON.stringify(exportData, null, 2)
      fileName = "vazifalar-va-eslatmalar.json"
      mimeType = "application/json"
    } else {
      // CSV format
      const headers = [
        "id",
        "title",
        "description",
        "completed",
        "createdAt",
        "dueDate",
        "priority",
        "category",
        "datetime",
        "recurrence",
      ]
      const rows: string[][] = []

      // Add tasks to CSV
      tasks.forEach((task) => {
        rows.push([
          task.id,
          task.title,
          task.description || "",
          task.completed ? "1" : "0",
          task.createdAt,
          task.dueDate || "",
          task.priority,
          task.category,
          "",
          "",
        ])
      })

      // Add reminders to CSV
      reminders.forEach((reminder) => {
        rows.push([
          reminder.id,
          reminder.title,
          reminder.description || "",
          reminder.completed ? "1" : "0",
          "",
          "",
          reminder.priority,
          reminder.category,
          reminder.datetime,
          reminder.recurrence ? JSON.stringify(reminder.recurrence) : "",
        ])
      })

      // Convert to CSV string
      fileContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
      fileName = "vazifalar-va-eslatmalar.csv"
      mimeType = "text/csv"
    }

    // Create and download file
    const blob = new Blob([fileContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.export_data}</DialogTitle>
          <DialogDescription>{t.export_description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t.format}</h4>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as "json" | "csv")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-1">
                  <FileJson className="h-4 w-4" />
                  JSON
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
