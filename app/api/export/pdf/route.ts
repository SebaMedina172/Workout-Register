import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { jsPDF } from "jspdf"

// PDF Translations
const pdfTranslations = {
  en: {
    title: "Weekly Workout Report",
    period: "Period",
    to: "to",
    generatedOn: "Generated on",
    overview: "Overview",
    trainingDays: "Training Days",
    restDays: "Rest Days",
    unregisteredDays: "Unregistered",
    missedDays: "Missed Days",
    completionRate: "Completion Rate",
    trainingTime: "Training Time",
    minutes: "minutes",
    consistency: "Consistency",
    volumeDistribution: "Volume Distribution by Muscle Group",
    muscleGroup: "Muscle Group",
    sets: "Sets",
    percentage: "Percentage",
    notWorked: "Not Worked",
    exercisePerformance: "Exercise Performance",
    exercise: "Exercise",
    completedSets: "Completed",
    totalSets: "Total",
    bestWeight: "Best Weight",
    bestReps: "Best Reps",
    weeklyProgress: "Weekly Progress",
    day: "Day",
    status: "Status",
    setsCompleted: "Sets",
    workout: "Workout",
    rest: "Rest",
    planned: "Planned",
    missed: "Missed",
    unregistered: "Unregistered",
    noExercises: "No exercises recorded",
    kg: "kg",
    reps: "reps",
    // File name
    fileName: "workout-report",
  },
  es: {
    title: "Informe Semanal de Entrenamiento",
    period: "Período",
    to: "a",
    generatedOn: "Generado el",
    overview: "Resumen General",
    trainingDays: "Días de Entrenamiento",
    restDays: "Días de Descanso",
    unregisteredDays: "Sin Registro",
    missedDays: "Días Perdidos",
    completionRate: "Tasa de Cumplimiento",
    trainingTime: "Tiempo de Entrenamiento",
    minutes: "minutos",
    consistency: "Consistencia",
    volumeDistribution: "Distribución de Volumen por Grupo Muscular",
    muscleGroup: "Grupo Muscular",
    sets: "Series",
    percentage: "Porcentaje",
    notWorked: "No Trabajados",
    exercisePerformance: "Rendimiento por Ejercicio",
    exercise: "Ejercicio",
    completedSets: "Completadas",
    totalSets: "Total",
    bestWeight: "Mejor Peso",
    bestReps: "Mejores Reps",
    weeklyProgress: "Progreso Semanal",
    day: "Día",
    status: "Estado",
    setsCompleted: "Series",
    workout: "Entrenamiento",
    rest: "Descanso",
    planned: "Planificado",
    missed: "Perdido",
    unregistered: "Sin Registro",
    noExercises: "Sin ejercicios registrados",
    kg: "kg",
    reps: "reps",
    fileName: "informe-entrenamiento",
  },
}

// Muscle group translations for PDF
const muscleGroupTranslations: Record<string, Record<string, string>> = {
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

// Exercise translations for PDF
const exerciseTranslations: Record<string, Record<string, string>> = {
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

// Day translations
const dayTranslations: Record<string, Record<number, string>> = {
  en: { 0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun" },
  es: { 0: "Lun", 1: "Mar", 2: "Mié", 3: "Jue", 4: "Vie", 5: "Sáb", 6: "Dom" },
}

type Locale = "en" | "es"

function getT(locale: string) {
  return pdfTranslations[locale as Locale] || pdfTranslations.en
}

function translateMuscleGroup(name: string, locale: string): string {
  if (locale === "es") return name
  return muscleGroupTranslations.en[name] || name
}

function translateExercise(name: string, locale: string): string {
  if (locale === "es") return name
  return exerciseTranslations.en[name] || name
}

function translateStatus(status: string, t: typeof pdfTranslations.en): string {
  const statusMap: Record<string, string> = {
    workout: t.workout,
    rest: t.rest,
    planned: t.planned,
    missed: t.missed,
    unregistered: t.unregistered,
  }
  return statusMap[status] || status
}

// Colors for PDF
const COLORS = {
  primary: [99, 102, 241] as [number, number, number], // Indigo
  secondary: [147, 51, 234] as [number, number, number], // Purple
  success: [34, 197, 94] as [number, number, number], // Green
  warning: [234, 179, 8] as [number, number, number], // Yellow
  danger: [239, 68, 68] as [number, number, number], // Red
  info: [59, 130, 246] as [number, number, number], // Blue
  muted: [107, 114, 128] as [number, number, number], // Gray
  dark: [31, 41, 55] as [number, number, number], // Dark gray
  light: [249, 250, 251] as [number, number, number], // Light gray
}

const CHART_COLORS = [
  [136, 132, 216], // Purple
  [130, 202, 157], // Green
  [255, 198, 88], // Yellow
  [255, 115, 0], // Orange
  [0, 196, 159], // Teal
  [255, 187, 40], // Gold
  [255, 128, 66], // Coral
  [162, 141, 255], // Light Purple
  [0, 136, 254], // Blue
  [255, 107, 107], // Red
]

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
    const locale = searchParams.get("locale") || "en"
    const sectionsParam = searchParams.get("sections")

    const t = getT(locale)

    const sections = sectionsParam
      ? JSON.parse(sectionsParam)
      : {
          overview: true,
          volumeChart: true,
          exercisePerformance: true,
          weeklyProgress: true,
        }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Se requieren fechas de inicio y fin" }, { status: 400 })
    }

    // Fetch stats data
    const statsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL ? request.url.split("/api")[0] : ""}/api/stats?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      },
    )

    if (!statsResponse.ok) {
      return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
    }

    const stats = await statsResponse.json()

    // Generate PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    let yPos = margin

    // Helper functions
    const addNewPageIfNeeded = (neededSpace: number) => {
      if (yPos + neededSpace > pageHeight - margin) {
        doc.addPage()
        yPos = margin
        return true
      }
      return false
    }

    const drawRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      color: [number, number, number],
    ) => {
      doc.setFillColor(...color)
      doc.roundedRect(x, y, w, h, r, r, "F")
    }

    // Header with gradient effect
    drawRoundedRect(0, 0, pageWidth, 45, 0, COLORS.primary)
    drawRoundedRect(pageWidth * 0.6, 0, pageWidth * 0.4, 45, 0, COLORS.secondary)

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text(t.title, margin, 20)

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`${t.period}: ${startDate} ${t.to} ${endDate}`, margin, 30)

    const today = new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    doc.text(`${t.generatedOn}: ${today}`, margin, 38)

    yPos = 55

    // Overview Section
    if (sections.overview) {
      doc.setTextColor(...COLORS.dark)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(t.overview, margin, yPos)
      yPos += 8

      // Draw overview cards in grid
      const cardWidth = (contentWidth - 10) / 2
      const cardHeight = 25
      const cardGap = 5

      const overviewData = [
        { label: t.trainingDays, value: stats.summary.workoutDays.toString(), color: COLORS.success },
        { label: t.restDays, value: stats.summary.restDays.toString(), color: COLORS.info },
        { label: t.unregisteredDays, value: stats.summary.unregisteredDays.toString(), color: COLORS.muted },
        { label: t.missedDays, value: stats.summary.missedDays.toString(), color: COLORS.danger },
        { label: t.completionRate, value: `${stats.summary.completionRate}%`, color: COLORS.primary },
        { label: t.trainingTime, value: `${stats.summary.totalTrainingMinutes} ${t.minutes}`, color: COLORS.secondary },
      ]

      overviewData.forEach((item, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = margin + col * (cardWidth + cardGap)
        const y = yPos + row * (cardHeight + cardGap)

        // Card background
        drawRoundedRect(x, y, cardWidth, cardHeight, 3, COLORS.light)

        // Colored left accent
        doc.setFillColor(...item.color)
        doc.roundedRect(x, y, 4, cardHeight, 2, 2, "F")

        // Label
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...COLORS.muted)
        doc.text(item.label, x + 10, y + 9)

        // Value
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...COLORS.dark)
        doc.text(item.value, x + 10, y + 20)
      })

      yPos += Math.ceil(overviewData.length / 2) * (cardHeight + cardGap) + 10
    }

    // Volume Distribution Section
    if (sections.volumeChart) {
      addNewPageIfNeeded(80)

      doc.setTextColor(...COLORS.dark)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(t.volumeDistribution, margin, yPos)
      yPos += 10

      const workedMuscleGroups = stats.muscleGroups.filter((mg: any) => mg.sets > 0)
      const totalSets = workedMuscleGroups.reduce((sum: number, mg: any) => sum + mg.sets, 0)

      if (workedMuscleGroups.length > 0) {
        // Draw a simple bar chart representation
        const barHeight = 8
        const barGap = 3
        const maxBarWidth = contentWidth * 0.6
        const maxSets = Math.max(...workedMuscleGroups.map((mg: any) => mg.sets))

        workedMuscleGroups.slice(0, 10).forEach((mg: any, index: number) => {
          addNewPageIfNeeded(barHeight + barGap)

          const barWidth = (mg.sets / maxSets) * maxBarWidth
          const percentage = totalSets > 0 ? ((mg.sets / totalSets) * 100).toFixed(1) : "0"
          const color = CHART_COLORS[index % CHART_COLORS.length] as [number, number, number]

          // Muscle group name
          doc.setFontSize(9)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(...COLORS.dark)
          const translatedName = translateMuscleGroup(mg.name, locale)
          doc.text(translatedName, margin, yPos + barHeight - 2)

          // Bar
          const barX = margin + 50
          drawRoundedRect(barX, yPos, barWidth, barHeight, 2, color)

          // Value label
          doc.setFontSize(8)
          doc.setTextColor(...COLORS.muted)
          doc.text(`${mg.sets} ${t.sets} (${percentage}%)`, barX + barWidth + 3, yPos + barHeight - 2)

          yPos += barHeight + barGap
        })

        // Not worked muscle groups
        const notWorkedGroups = stats.muscleGroups.filter((mg: any) => mg.sets === 0)
        if (notWorkedGroups.length > 0) {
          yPos += 5
          doc.setFontSize(10)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(...COLORS.muted)
          doc.text(t.notWorked + ":", margin, yPos)
          yPos += 5

          doc.setFontSize(9)
          doc.setFont("helvetica", "normal")
          const notWorkedNames = notWorkedGroups.map((mg: any) => translateMuscleGroup(mg.name, locale)).join(", ")
          const splitText = doc.splitTextToSize(notWorkedNames, contentWidth)
          doc.text(splitText, margin, yPos)
          yPos += splitText.length * 4 + 5
        }
      }

      yPos += 10
    }

    // Exercise Performance Section
    if (sections.exercisePerformance) {
      addNewPageIfNeeded(60)

      doc.setTextColor(...COLORS.dark)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(t.exercisePerformance, margin, yPos)
      yPos += 10

      // Table header
      const colWidths = [60, 25, 25, 35, 30]
      const headers = [t.exercise, t.completedSets, t.totalSets, t.bestWeight, t.bestReps]

      drawRoundedRect(margin, yPos, contentWidth, 8, 2, COLORS.primary)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(255, 255, 255)

      let xPos = margin + 3
      headers.forEach((header, i) => {
        doc.text(header, xPos, yPos + 5.5)
        xPos += colWidths[i]
      })
      yPos += 10

      // Exercise rows
      let exerciseCount = 0
      Object.entries(stats.exercisesByMuscleGroup || {}).forEach(([muscleGroup, exercises]: [string, any]) => {
        if (!Array.isArray(exercises) || exercises.length === 0) return
        if (exerciseCount >= 15) return // Limit exercises to prevent overflow

        // Group exercises by name
        const grouped = new Map<string, any>()
        exercises.forEach((ex: any) => {
          if (ex.completedSets === 0) return
          const existing = grouped.get(ex.name)
          if (existing) {
            existing.completedSets += ex.completedSets
            existing.totalSets += ex.totalSets
            existing.bestWeight = Math.max(existing.bestWeight, ex.weight || 0)
            existing.bestReps = Math.max(existing.bestReps, ex.reps || 0)
          } else {
            grouped.set(ex.name, {
              name: ex.name,
              completedSets: ex.completedSets,
              totalSets: ex.totalSets,
              bestWeight: ex.weight || 0,
              bestReps: ex.reps || 0,
            })
          }
        })

        grouped.forEach((exercise) => {
          if (exerciseCount >= 15) return

          addNewPageIfNeeded(8)

          // Alternating row background
          if (exerciseCount % 2 === 0) {
            drawRoundedRect(margin, yPos, contentWidth, 7, 1, COLORS.light)
          }

          doc.setFontSize(8)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(...COLORS.dark)

          xPos = margin + 3
          const translatedExercise = translateExercise(exercise.name, locale)
          const truncatedName =
            translatedExercise.length > 28 ? translatedExercise.substring(0, 25) + "..." : translatedExercise
          doc.text(truncatedName, xPos, yPos + 5)
          xPos += colWidths[0]

          doc.text(exercise.completedSets.toString(), xPos, yPos + 5)
          xPos += colWidths[1]

          doc.text(exercise.totalSets.toString(), xPos, yPos + 5)
          xPos += colWidths[2]

          const weightStr = exercise.bestWeight > 0 ? `${exercise.bestWeight} ${t.kg}` : "-"
          doc.text(weightStr, xPos, yPos + 5)
          xPos += colWidths[3]

          doc.text(exercise.bestReps.toString(), xPos, yPos + 5)

          yPos += 7
          exerciseCount++
        })
      })

      if (exerciseCount === 0) {
        doc.setFontSize(10)
        doc.setTextColor(...COLORS.muted)
        doc.text(t.noExercises, margin, yPos + 5)
        yPos += 10
      }

      yPos += 10
    }

    // Weekly Progress Section
    if (sections.weeklyProgress) {
      addNewPageIfNeeded(50)

      doc.setTextColor(...COLORS.dark)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(t.weeklyProgress, margin, yPos)
      yPos += 10

      // Draw weekly calendar
      const dayWidth = (contentWidth - 6) / 7
      const dayHeight = 30

      stats.dailyBreakdown.forEach((day: any, index: number) => {
        const x = margin + index * (dayWidth + 1)
        const date = new Date(day.date + "T12:00:00")
        const dayNum = date.getDate()
        const dayName = dayTranslations[locale as Locale]?.[index] || dayTranslations.en[index]

        // Status color
        let statusColor: [number, number, number] = COLORS.muted
        if (day.status === "workout") statusColor = COLORS.success
        else if (day.status === "rest") statusColor = COLORS.info
        else if (day.status === "planned") statusColor = COLORS.primary
        else if (day.status === "missed") statusColor = COLORS.danger

        // Day card
        drawRoundedRect(x, yPos, dayWidth, dayHeight, 3, COLORS.light)

        // Status indicator
        drawRoundedRect(x + 2, yPos + 2, dayWidth - 4, 6, 2, statusColor)

        // Day name
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(255, 255, 255)
        doc.text(dayName, x + dayWidth / 2, yPos + 6, { align: "center" })

        // Day number
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...COLORS.dark)
        doc.text(dayNum.toString(), x + dayWidth / 2, yPos + 17, { align: "center" })

        // Sets count
        if (day.completedSets > 0) {
          doc.setFontSize(7)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(...COLORS.muted)
          doc.text(`${day.completedSets} ${t.sets}`, x + dayWidth / 2, yPos + 25, { align: "center" })
        }
      })

      yPos += dayHeight + 10

      // Legend
      const legendItems = [
        { label: t.workout, color: COLORS.success },
        { label: t.rest, color: COLORS.info },
        { label: t.planned, color: COLORS.primary },
        { label: t.missed, color: COLORS.danger },
        { label: t.unregistered, color: COLORS.muted },
      ]

      let legendX = margin
      doc.setFontSize(8)
      legendItems.forEach((item) => {
        doc.setFillColor(...item.color)
        doc.circle(legendX + 2, yPos, 2, "F")
        doc.setTextColor(...COLORS.dark)
        doc.text(item.label, legendX + 6, yPos + 1)
        legendX += 35
      })
    }

    // Footer on last page
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.muted)
    doc.text("WorkoutRegister - " + t.generatedOn + " " + today, pageWidth / 2, pageHeight - 10, { align: "center" })

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer")
    const filename = `${t.fileName}-${startDate}-${endDate}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/export/pdf:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
