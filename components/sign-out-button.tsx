"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

export default function SignOutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

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
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant="ghost"
      className="w-full md:w-auto justify-start md:justify-center text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors font-medium"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isLoading ? t.navigation.signOutProcess : t.navigation.signOut}
    </Button>
  )
}
