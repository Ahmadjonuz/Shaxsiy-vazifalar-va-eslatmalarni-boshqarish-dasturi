"use client"

import { useState, useEffect, useCallback } from "react"

interface NotificationOptions {
  body?: string
  icon?: string
  tag?: string
  data?: any
  vibrate?: number[]
  image?: string
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default")

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported")
      return
    }

    setPermission(Notification.permission)
  }, [])

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      return false
    }

    if (Notification.permission === "granted") {
      setPermission("granted")
      return true
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === "granted"
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return false
    }
  }, [])

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return null
    }

    try {
      const notification = new Notification(title, options)
      return notification
    } catch (error) {
      console.error("Error sending notification:", error)
      return null
    }
  }, [])

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: permission !== "unsupported",
  }
}
