import { useLanguage } from "./context"

export function useCalendarTranslation() {
  const { language, t } = useLanguage()

  const monthNames = {
    es: [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ],
    en: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
  }

  // Always start with Monday (1) for both languages to maintain consistency
  const dayNames = {
    es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  }

  const dayNamesShort = {
    es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  }

  const getMonthName = (monthIndex: number) => {
    return monthNames[language][monthIndex]
  }

  const getDayName = (dayIndex: number, short: boolean = false) => {
    const names = short ? dayNamesShort[language] : dayNames[language]
    return names[dayIndex]
  }

  // Get day names in Monday-first order for consistent calendar display
  const getWeekDayNames = (short: boolean = false) => {
    const names = short ? dayNamesShort[language] : dayNames[language]
    // Reorder to start with Monday: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    return [names[1], names[2], names[3], names[4], names[5], names[6], names[0]]
  }

  const formatDate = (date: Date, format: "full" | "short" = "full") => {
    const day = date.getDate()
    const month = getMonthName(date.getMonth())
    const year = date.getFullYear()
    const dayName = getDayName(date.getDay())

    if (format === "short") {
      return language === "es" ? `${day}/${date.getMonth() + 1}/${year}` : `${date.getMonth() + 1}/${day}/${year}`
    }

    return language === "es" 
      ? `${dayName}, ${day} de ${month.toLowerCase()} de ${year}`
      : `${dayName}, ${month} ${day}, ${year}`
  }

  return {
    getMonthName,
    getDayName,
    getWeekDayNames,
    formatDate,
    t: t.calendar
  }
}
