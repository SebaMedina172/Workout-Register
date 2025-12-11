import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const csvTranslations = {
  en: {
    // Headers
    weeklySummary: "WEEKLY SUMMARY",
    period: "Period",
    to: "to",
    daysTrainedLabel: "Days trained",
    totalSetsLabel: "Total sets",
    totalTimeLabel: "Total time (min)",
    setsByMuscleGroup: "SETS BY MUSCLE GROUP",
    muscleGroup: "Muscle Group",
    sets: "Sets",
    percentage: "Percentage",
    // Detail headers
    date: "Date",
    exercise: "Exercise",
    set: "Set",
    weightKg: "Weight (kg)",
    reps: "Reps",
    restSeconds: "Rest (s)",
    completed: "Completed",
    // Values
    yes: "Yes",
    no: "No",
    unclassified: "Unclassified",
    // Filename
    weeklySummaryFile: "weekly-summary",
    workoutDetailFile: "workout-detail",
  },
  es: {
    // Headers
    weeklySummary: "RESUMEN SEMANAL",
    period: "Período",
    to: "a",
    daysTrainedLabel: "Días entrenados",
    totalSetsLabel: "Series totales",
    totalTimeLabel: "Tiempo total (min)",
    setsByMuscleGroup: "SERIES POR GRUPO MUSCULAR",
    muscleGroup: "Grupo Muscular",
    sets: "Series",
    percentage: "Porcentaje",
    // Detail headers
    date: "Fecha",
    exercise: "Ejercicio",
    set: "Serie",
    weightKg: "Peso (kg)",
    reps: "Repeticiones",
    restSeconds: "Descanso (s)",
    completed: "Completado",
    // Values
    yes: "Sí",
    no: "No",
    unclassified: "Sin clasificar",
    // Filename
    weeklySummaryFile: "resumen-semanal",
    workoutDetailFile: "entrenamiento-detalle",
  },
}

// Traducciones de grupos musculares
const muscleGroupTranslations = {
  en: {
    "Pecho": "Chest",
    "Espalda": "Back",
    "Deltoides anterior": "Front Deltoid",
    "Deltoides medio": "Middle Deltoid",
    "Deltoides posterior": "Rear Deltoid",
    "Bíceps": "Biceps",
    "Tríceps": "Triceps",
    "Antebrazos": "Forearms",
    "Cuádriceps": "Quadriceps",
    "Isquiotibiales": "Hamstrings",
    "Glúteo": "Glutes",
    "Gemelos": "Calves",
    "Abductores": "Abductors",
    "Abdominales": "Abs",
    "Oblicuos": "Obliques",
  },
  es: {
    // En español, los grupos musculares se mantienen como están
  }
}

// Traducciones de ejercicios
const exerciseTranslations = {
  en: {
    "Press de banca con barra": "Barbell bench press",
    "Press de banca con mancuernas": "Dumbbell bench press",
    "Press inclinado con barra": "Incline barbell press",
    "Press inclinado con mancuernas": "Incline dumbbell press",
    "Press declinado con barra": "Decline barbell press",
    "Aperturas con mancuernas": "Dumbbell flyes",
    "Aperturas en polea": "Cable flyes",
    "Cruces en máquina": "Machine flyes",
    "Push-ups": "Push-ups",
    "Dominadas": "Pull-ups",
    "Dominadas con agarre ancho": "Wide grip pull-ups",
    "Dominadas con agarre cerrado": "Close grip pull-ups",
    "Pull-ups": "Pull-ups",
    "Remo con barra": "Barbell rows",
    "Remo con mancuernas": "Dumbbell rows",
    "Remo en polea baja": "Cable rows",
    "Remo en máquina": "Machine rows",
    "Jalones al pecho": "Lat pulldowns",
    "Jalones tras nuca": "Behind neck pulldowns",
    "Press militar con barra": "Military press",
    "Press militar con mancuernas": "Dumbbell shoulder press",
    "Elevaciones frontales con mancuernas": "Front raises",
    "Elevaciones laterales con mancuernas": "Lateral raises",
    "Elevaciones laterales en polea": "Cable lateral raises",
    "Press tras nuca": "Behind neck press",
    "Pájaros con mancuernas": "Rear delt flyes",
    "Pájaros en máquina": "Machine rear delt flyes",
    "Remo al mentón": "Upright rows",
    "Face pulls": "Face pulls",
    "Curl de bíceps con barra": "Barbell curls",
    "Curl de bíceps con mancuernas": "Dumbbell curls",
    "Curl martillo": "Hammer curls",
    "Curl concentrado": "Concentration curls",
    "Curl en polea": "Cable curls",
    "Curl predicador": "Preacher curls",
    "Press francés": "French press",
    "Extensiones de tríceps": "Tricep extensions",
    "Extensiones tras nuca": "Overhead extensions",
    "Patadas de tríceps": "Tricep kickbacks",
    "Fondos para tríceps": "Tricep dips",
    "Press cerrado": "Close grip press",
    "Curl de muñeca": "Wrist curls",
    "Curl inverso": "Reverse curls",
    "Sentadillas": "Squats",
    "Sentadillas frontales": "Front squats",
    "Sentadillas búlgaras": "Bulgarian split squats",
    "Prensa de piernas": "Leg press",
    "Extensiones de cuádriceps": "Leg extensions",
    "Zancadas": "Lunges",
    "Zancadas laterales": "Lateral lunges",
    "Curl femoral": "Leg curls",
    "Curl femoral acostado": "Lying leg curls",
    "Curl femoral de pie": "Standing leg curls",
    "Peso muerto": "Deadlifts",
    "Peso muerto rumano": "Romanian deadlifts",
    "Buenos días": "Good mornings",
    "Sentadilla sumo": "Sumo squats",
    "Hip thrust": "Hip thrusts",
    "Puente de glúteo": "Glute bridges",
    "Peso muerto sumo": "Sumo deadlifts",
    "Patadas de glúteo": "Glute kickbacks",
    "Patadas de glúteo en polea": "Cable glute kickbacks",
    "Elevaciones de gemelos de pie": "Standing calf raises",
    "Elevaciones de gemelos sentado": "Seated calf raises",
    "Elevaciones en prensa": "Calf press",
    "Abducción de cadera": "Hip abduction",
    "Patadas laterales": "Side kicks",
    "Crunches": "Crunches",
    "Abdominales en máquina": "Machine crunches",
    "Plancha": "Plank",
    "Plancha lateral": "Side plank",
    "Elevaciones de piernas": "Leg raises",
    "Mountain climbers": "Mountain climbers",
    "Crunches oblicuos": "Oblique crunches",
    "Bicicleta": "Bicycle crunches",
    "Russian twists": "Russian twists",
    "Leñador": "Wood choppers",
  },
  es: {
    // En español, los ejercicios se mantienen como están
  }
}

type Locale = keyof typeof csvTranslations
type CsvTranslation = typeof csvTranslations.en

function getTranslations(locale: string): CsvTranslation {
  return csvTranslations[locale as Locale] || csvTranslations.en
}

function translateMuscleGroup(muscleGroup: string, locale: string): string {
  if (locale === "es" || !muscleGroup) return muscleGroup
  return muscleGroupTranslations.en[muscleGroup as keyof typeof muscleGroupTranslations.en] || muscleGroup
}

function translateExercise(exercise: string, locale: string): string {
  if (locale === "es" || !exercise) return exercise
  return exerciseTranslations.en[exercise as keyof typeof exerciseTranslations.en] || exercise
}

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
    const type = searchParams.get("type") || "weekly-detail"
    const includeCustomColumns = searchParams.get("includeCustomColumns") === "true"
    const locale = searchParams.get("locale") || "en"

    const t = getTranslations(locale)

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
          exercise_order,
          workout_set_records (
            id,
            set_number,
            reps,
            weight,
            is_completed,
            custom_data
          )
        )
      `)
      .eq("user_id", session.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    if (workoutsError) {
      console.error("❌ Error fetching workouts for export:", workoutsError)
      return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 })
    }

    let customColumns: any[] = []
    if (includeCustomColumns) {
      const { data: columns } = await supabase
        .from("user_custom_columns")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true })

      customColumns = columns || []
    }

    let csvContent: string
    let filename: string

    if (type === "weekly-summary") {
      csvContent = generateWeeklySummaryCSV(workouts || [], startDate, endDate, t, locale)
      filename = `${t.weeklySummaryFile}-${startDate}-${endDate}.csv`
    } else {
      const usedCustomColumns = includeCustomColumns ? filterUsedCustomColumns(workouts || [], customColumns) : []
      csvContent = generateWeeklyDetailCSV(workouts || [], usedCustomColumns, t, locale)
      filename = `${t.workoutDetailFile}-${startDate}-${endDate}.csv`
    }
    
    const csvWithBOM = "\uFEFF" + csvContent

    return new NextResponse(csvWithBOM, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("💥 Error in GET /api/export:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

function filterUsedCustomColumns(workouts: any[], customColumns: any[]): any[] {
  const usedColumnNames = new Set<string>()

  workouts.forEach((workout) => {
    workout.workout_exercises?.forEach((exercise: any) => {
      exercise.workout_set_records?.forEach((setRecord: any) => {
        if (setRecord.custom_data && typeof setRecord.custom_data === "object") {
          Object.keys(setRecord.custom_data).forEach((key) => {
            const value = setRecord.custom_data[key]
            if (value !== null && value !== undefined && value !== "") {
              usedColumnNames.add(key)
            }
          })
        }
      })
    })
  })

  return customColumns.filter((col) => usedColumnNames.has(col.column_name))
}

function generateWeeklySummaryCSV(workouts: any[], startDate: string, endDate: string, t: CsvTranslation, locale: string): string {
  const muscleGroupSets: Record<string, number> = {}
  let totalSets = 0
  let totalTrainingMinutes = 0
  let workoutDays = 0

  workouts.forEach((workout) => {
    if (workout.is_rest_day) return

    let hasCompletedSets = false

    workout.workout_exercises?.forEach((exercise: any) => {
      if (!exercise.is_saved) return

      const completedSets =
        exercise.workout_set_records?.filter((sr: any) => sr.is_completed === true || sr.is_completed === "true") || []

      if (completedSets.length > 0) {
        hasCompletedSets = true
        const muscleGroup = exercise.muscle_group || t.unclassified
        const translatedMuscleGroup = translateMuscleGroup(muscleGroup, locale)
        
        muscleGroupSets[translatedMuscleGroup] = (muscleGroupSets[translatedMuscleGroup] || 0) + completedSets.length
        totalSets += completedSets.length

        const executionTime = completedSets.length * 45
        const restTime = completedSets.length > 1 ? (completedSets.length - 1) * (exercise.rest_seconds || 0) : 0
        totalTrainingMinutes += (executionTime + restTime) / 60
      }
    })

    if (hasCompletedSets) workoutDays++
  })

  const lines: string[] = []

  lines.push(t.weeklySummary)
  lines.push(`${t.period},${startDate} ${t.to} ${endDate}`)
  lines.push(`${t.daysTrainedLabel},${workoutDays}`)
  lines.push(`${t.totalSetsLabel},${totalSets}`)
  lines.push(`${t.totalTimeLabel},${Math.round(totalTrainingMinutes)}`)
  lines.push("")

  lines.push(t.setsByMuscleGroup)
  lines.push(`${t.muscleGroup},${t.sets},${t.percentage}`)

  Object.entries(muscleGroupSets)
    .sort((a, b) => b[1] - a[1])
    .forEach(([group, sets]) => {
      const percentage = totalSets > 0 ? ((sets / totalSets) * 100).toFixed(1) : "0"
      lines.push(`${escapeCSV(group)},${sets},${percentage}%`)
    })

  return lines.join("\n")
}

function generateWeeklyDetailCSV(workouts: any[], customColumns: any[], t: CsvTranslation, locale: string): string {
  const lines: string[] = []
  
  const baseHeaders = [t.date, t.exercise, t.muscleGroup, t.set, t.weightKg, t.reps, t.restSeconds, t.completed]
  const customHeaders = customColumns.map((col) => col.column_name)
  lines.push([...baseHeaders, ...customHeaders].join(";"))

  workouts.forEach((workout) => {
    if (workout.is_rest_day) return

    const sortedExercises = [...(workout.workout_exercises || [])].sort(
      (a: any, b: any) => (a.exercise_order || 0) - (b.exercise_order || 0),
    )

    sortedExercises.forEach((exercise: any) => {
      if (!exercise.is_saved) return

      const sortedSets = [...(exercise.workout_set_records || [])].sort(
        (a: any, b: any) => (a.set_number || 0) - (b.set_number || 0),
      )

      sortedSets.forEach((setRecord: any) => {
        const isCompleted = setRecord.is_completed === true || setRecord.is_completed === "true"

        const translatedExercise = translateExercise(exercise.exercise_name, locale)
        const translatedMuscleGroup = translateMuscleGroup(exercise.muscle_group || "", locale)

        const baseData = [
          workout.date,
          escapeCSV(translatedExercise),
          escapeCSV(translatedMuscleGroup),
          setRecord.set_number || "",
          formatNumber(setRecord.weight), 
          setRecord.reps !== null ? setRecord.reps : "",
          exercise.rest_seconds || "",
          isCompleted ? t.yes : t.no,
        ]

        const customData = customColumns.map((col) => {
          const value = setRecord.custom_data?.[col.column_name]
          if (value === null || value === undefined) return ""
          if (col.column_type === "boolean") return value ? t.yes : t.no
          return escapeCSV(String(value))
        })

        lines.push([...baseData, ...customData].join(";"))
      })
    })
  })

  return lines.join("\n")
}

function escapeCSV(value: string): string {
  if (!value) return ""
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return ""
  return String(value).replace(',', '.')
}