"use client"

import { useEffect, useState, ReactNode } from "react"
import { Toast, ToastType } from "./toast-provider"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

interface ToastConfig {
  icon: ReactNode
  classes: string
  bar: string
}

const config: { [key in ToastType]: ToastConfig } = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    classes: "bg-background border border-border text-foreground",
    bar: "bg-green-500",
  },
  error: {
    icon: <AlertCircle className="w-4 h-4" />,
    classes: "bg-background border border-border text-foreground",
    bar: "bg-red-500",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    classes: "bg-background border border-border text-foreground",
    bar: "bg-yellow-500",
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    classes: "bg-background border border-border text-foreground",
    bar: "bg-blue-500",
  },
}

const iconColor: { [key in ToastType]: string } = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const duration = toast.duration ?? 4000
  const { icon, classes, bar } = config[toast.type]

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => handleDismiss(), duration)
    return () => clearTimeout(t)
  }, [duration])

  function handleDismiss() {
    setLeaving(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  return (
    <div
      className={`
        pointer-events-auto w-80 rounded-lg shadow-lg overflow-hidden
        transition-all duration-300 ease-in-out
        ${classes}
        ${visible && !leaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <span className={`mt-0.5 shrink-0 ${iconColor[toast.type]}`}>
          {icon}
        </span>
        <p className="flex-1 text-sm leading-snug">{toast.message}</p>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-0.5 w-full bg-muted">
        <div
          className={`h-full ${bar}`}
          style={{ animation: `shrink ${duration}ms linear forwards` }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}