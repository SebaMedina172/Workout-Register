import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import WorkoutCalendar from "@/components/workout-calendar"
import SignOutButton from "@/components/sign-out-button"

export default async function HomePage() {
  // Verificar si el usuario está autenticado
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mi Entrenamiento
              </h1>
              <p className="text-sm text-gray-600 mt-1">Planifica y registra tus entrenamientos</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <WorkoutCalendar />
        </div>
      </main>
    </div>
  )
}
