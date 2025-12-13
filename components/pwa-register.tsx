"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
        })
        .then((registration) => {
          console.log("✅ Service Worker registrado:", registration)
        })
        .catch((error) => {
          console.error("❌ Error registrando Service Worker:", error)
        })
    }
  }, [])

  return null
}
