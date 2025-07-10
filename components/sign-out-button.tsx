"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignOutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/auth/signout", {
        method: "POST",
      })

      if (response.ok) {
        // Redirigir al usuario a la página de login después del logout
        router.push("/auth")
        router.refresh()
      } else {
        console.error("Error during signout")
      }
    } catch (error) {
      console.error("Error during signout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
    >
      {isLoading ? "Cerrando..." : "Cerrar Sesión"}
    </button>
  )
}
