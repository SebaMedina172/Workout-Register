import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Se requieren fechas de inicio y fin" }, { status: 400 })
    }


    const { data: workouts, error: workoutsError } = await supabase
      .from("workouts")
      .select(`
        *,
        workout_exercises (
          id,
          exercise_name,
          muscle_group,
          sets,
          reps,
          rest_seconds,
          weight,
          is_saved,
          is_completed,
          workout_set_records (
            id,
            set_number,
            reps,
            weight,
            is_completed
          )
        )
      `)
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    if (workoutsError) {
      console.error("❌ Error fetching workouts for stats:", workoutsError)
      return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
    }

    // Calcular estadísticas
    const stats = calculateWeeklyStats(workouts || [], startDate, endDate)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("💥 Error in GET /api/stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

function calculateWeeklyStats(workouts: any[], startDate: string, endDate: string) {
  // Generar array de todos los días de la semana
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date().toISOString().split("T")[0]
  const allDays = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    allDays.push(new Date(d).toISOString().split("T")[0])
  }

  // Grupos musculares disponibles (sincronizado con workout-form/constants.ts)
  const allMuscleGroups = [
    "Pecho",
    "Espalda",
    "Deltoides anterior",
    "Deltoides medio",
    "Deltoides posterior",
    "Bíceps",
    "Tríceps",
    "Antebrazos",
    "Cuádriceps",
    "Isquiotibiales",
    "Glúteo",
    "Gemelos",
    "Abductores",
    "Abdominales",
    "Oblicuos",
  ]

  let workoutDays = 0
  let restDays = 0
  let unregisteredDays = 0
  let missedDays = 0
  let totalTrainingSeconds = 0
  let totalPlannedSets = 0
  let totalCompletedSets = 0

  const muscleGroupSets: Record<string, number> = {}
  allMuscleGroups.forEach((group) => (muscleGroupSets[group] = 0))

  const exercisesByMuscleGroup: Record<
    string,
    Array<{
      name: string
      sets: number
      reps: number
      weight: number
      completedSets: number
      totalSets: number
      date: string
      isCompleted: boolean
    }>
  > = {}
  allMuscleGroups.forEach((group) => {
    exercisesByMuscleGroup[group] = []
  })

  const ESTIMATED_SET_EXECUTION_TIME = 45 // segundos por cada set ejecutado


  // Procesar cada día
  allDays.forEach((day) => {
    const dayWorkout = workouts.find((w) => w.date === day)
    const isPastDay = day < today

    if (!dayWorkout) {
      unregisteredDays++
    } else if (dayWorkout.is_rest_day) {
      restDays++
    } else {
      // Es un día de entrenamiento

      let hasCompletedExercises = false
      let savedExercisesCount = 0
      let completedSetsCount = 0

      if (dayWorkout.workout_exercises && dayWorkout.workout_exercises.length > 0) {
        dayWorkout.workout_exercises.forEach((ex: any, index: number) => {

          if (ex.is_saved) {
            savedExercisesCount++

            if (ex.workout_set_records && ex.workout_set_records.length > 0) {
              const completedSets = ex.workout_set_records.filter((sr: any) => {
                const isCompleted = sr.is_completed === true || sr.is_completed === "true"
                return isCompleted
              })

              completedSetsCount += completedSets.length

              if (completedSets.length > 0) {
                hasCompletedExercises = true
              }
            } else {
            }
          } else {
          }
        })
      }

      if (hasCompletedExercises) {
        workoutDays++
      } else if (isPastDay) {
        missedDays++
      } else {
        unregisteredDays++
      }

      // Procesar ejercicios del día para estadísticas detalladas
      dayWorkout.workout_exercises?.forEach((exercise: any) => {
        let muscleGroup = exercise.muscle_group || "Sin clasificar"
        const lowerCaseMuscleGroup = muscleGroup.toLowerCase()

        // Normalizar nombres de grupos musculares
        if (lowerCaseMuscleGroup.includes("cuadriceps") || lowerCaseMuscleGroup.includes("cuádriceps")) {
          muscleGroup = "Cuádriceps"
        } else if (lowerCaseMuscleGroup.includes("isquio")) {
          muscleGroup = "Isquiotibiales"
        } else if (lowerCaseMuscleGroup.includes("gluteo") || lowerCaseMuscleGroup.includes("glúteo")) {
          muscleGroup = "Glúteo"
        } else if (lowerCaseMuscleGroup.includes("gemelo")) {
          muscleGroup = "Gemelos"
        } else if (lowerCaseMuscleGroup.includes("abductor")) {
          muscleGroup = "Abductores"
        } else if (lowerCaseMuscleGroup.includes("abdominal") || lowerCaseMuscleGroup.includes("core")) {
          muscleGroup = "Abdominales"
        } else if (lowerCaseMuscleGroup.includes("oblicuo")) {
          muscleGroup = "Oblicuos"
        } else if (lowerCaseMuscleGroup.includes("bicep") || lowerCaseMuscleGroup.includes("bícep")) {
          muscleGroup = "Bíceps"
        } else if (lowerCaseMuscleGroup.includes("tricep") || lowerCaseMuscleGroup.includes("trícep")) {
          muscleGroup = "Tríceps"
        } else if (lowerCaseMuscleGroup.includes("antebrazo")) {
          muscleGroup = "Antebrazos"
        } else if (lowerCaseMuscleGroup.includes("pecho")) {
          muscleGroup = "Pecho"
        } else if (lowerCaseMuscleGroup.includes("espalda")) {
          muscleGroup = "Espalda"
        } else if (lowerCaseMuscleGroup.includes("deltoides anterior")) {
          muscleGroup = "Deltoides anterior"
        } else if (lowerCaseMuscleGroup.includes("deltoides medio")) {
          muscleGroup = "Deltoides medio"
        } else if (lowerCaseMuscleGroup.includes("deltoides posterior")) {
          muscleGroup = "Deltoides posterior"
        }

        // Contar series planificadas
        totalPlannedSets += exercise.sets || 0

        // Procesar registros de series reales y calcular tiempo de entrenamiento
        if (exercise.workout_set_records && exercise.workout_set_records.length > 0) {
          const completedSetRecords = exercise.workout_set_records.filter((sr: any) => {
            return sr.is_completed === true || sr.is_completed === "true"
          })
          const completedSetCount = completedSetRecords.length

          if (completedSetCount > 0) {
            // Tiempo de ejecución de los sets (45s por set)
            const executionTime = completedSetCount * ESTIMATED_SET_EXECUTION_TIME
            totalTrainingSeconds += executionTime

            // Tiempo de descanso entre sets
            // Solo hay descanso ENTRE sets, no después del último
            if (completedSetCount > 1) {
              const restTime = (completedSetCount - 1) * (exercise.rest_seconds || 0)
              totalTrainingSeconds += restTime
            } else {
            }

            // Contar sets por grupo muscular
            completedSetRecords.forEach(() => {
              if (allMuscleGroups.includes(muscleGroup)) {
                muscleGroupSets[muscleGroup]++
              }
              totalCompletedSets++
            })
          }

          if (allMuscleGroups.includes(muscleGroup)) {
            // Find best set (highest weight, or highest reps if weight is same)
            let bestWeight = exercise.weight || 0
            let bestReps = exercise.reps || 0

            completedSetRecords.forEach((sr: any) => {
              const setWeight = sr.weight || 0
              const setReps = sr.reps || 0
              if (setWeight > bestWeight || (setWeight === bestWeight && setReps > bestReps)) {
                bestWeight = setWeight
                bestReps = setReps
              }
            })

            exercisesByMuscleGroup[muscleGroup].push({
              name: exercise.exercise_name,
              sets: exercise.sets || 0,
              reps: bestReps,
              weight: bestWeight,
              completedSets: completedSetRecords.length,
              totalSets: exercise.workout_set_records.length,
              date: day,
              isCompleted: exercise.is_completed === true || exercise.is_completed === "true",
            })
          }
        }
      })
    }
  })

  const totalTrainingMinutes = Math.round(totalTrainingSeconds / 60)

  // Calcular porcentaje de cumplimiento
  const completionRate = totalPlannedSets > 0 ? Math.round((totalCompletedSets / totalPlannedSets) * 100) : 0

  // Convertir a array y ordenar por series
  const muscleGroupsArray = allMuscleGroups
    .map((name) => ({ name, sets: muscleGroupSets[name] || 0 }))
    .sort((a, b) => b.sets - a.sets)

  return {
    summary: {
      workoutDays,
      restDays,
      unregisteredDays,
      missedDays,
      totalDays: allDays.length,
      completionRate,
      totalTrainingMinutes,
    },
    muscleGroups: muscleGroupsArray,
    exercisesByMuscleGroup,
    dailyBreakdown: allDays.map((day) => {
      const workout = workouts.find((w) => w.date === day)
      const isPastDay = day < today
      let status = "unregistered"
      let completedSets = 0

      if (workout) {
        if (workout.is_rest_day) {
          status = "rest"
        } else {
          const hasCompleted = workout.workout_exercises?.some((ex: any) => {
            if (!ex.is_saved) return false
            return ex.workout_set_records?.some((sr: any) => sr.is_completed === true || sr.is_completed === "true")
          })

          if (hasCompleted) {
            status = "workout"
          } else if (isPastDay) {
            status = "missed"
          } else {
            status = "planned"
          }

          // Contar series completadas del día
          workout.workout_exercises?.forEach((ex: any) => {
            ex.workout_set_records?.forEach((sr: any) => {
              if (sr.is_completed === true || sr.is_completed === "true") {
                completedSets++
              }
            })
          })
        }
      }

      return {
        date: day,
        status,
        completedSets,
      }
    }),
  }
}
