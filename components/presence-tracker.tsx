"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

// Envia um heartbeat de presença enquanto o usuário autenticado tem a aba aberta
export function PresenceTracker() {
  useEffect(() => {
    let active = true

    const ping = async () => {
      if (!active) return
      // Só envia se houver sessão para evitar chamadas 401 desnecessárias
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return
      try {
        await fetch("/api/presence", { method: "POST", cache: "no-store" })
      } catch {
        // ignora falhas de rede
      }
    }

    // Primeiro ping imediato, depois a cada 45s
    ping()
    const interval = setInterval(ping, 45_000)

    // Re-ping quando a aba volta a ficar visível
    const onVisible = () => {
      if (document.visibilityState === "visible") ping()
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      active = false
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  return null
}
