"use client"

import { useLanguage } from "./context"

export function useCalendarTranslation() {
  const { t, language } = useLanguage()

  const getMonthName = (monthIndex: number): string => {
    const months = [
      t.calendar.january,
      t.calendar.february,
      t.calendar.march,
      t.calendar.april,
      t.calendar.may,
      t.calendar.june,
      t.calendar.july,
      t.calendar.august,
      t.calendar.september,
      t.calendar.october,
      t.calendar.november,
      t.calendar.december,
    ]
    return months[monthIndex] || ""
  }

  const getDayName = (dayIndex: number, short = false): string => {
    if (short) {
      const shortDays = [
        t.calendar.sun,
        t.calendar.mon,
        t.calendar.tue,
        t.calendar.wed,
        t.calendar.thu,
        t.calendar.fri,
        t.calendar.sat,
      ]
      return shortDays[dayIndex] || ""
    } else {
      const fullDays = [
        t.calendar.sunday,
        t.calendar.monday,
        t.calendar.tuesday,
        t.calendar.wednesday,
        t.calendar.thursday,
        t.calendar.friday,
        t.calendar.saturday,
      ]
      return fullDays[dayIndex] || ""
    }
  }

  const formatDate = (date: Date): string => {
    const dayName = getDayName(date.getDay())
    const day = date.getDate()
    const monthName = getMonthName(date.getMonth())
    const year = date.getFullYear()

    if (language === "es") {
      return `${dayName}, ${day} de ${monthName} de ${year}`
    } else {
      return `${dayName}, ${monthName} ${day}, ${year}`
    }
  }

  const formatWeight = (weight: number | undefined | null): string => {
    if (!weight || weight === 0) {
      return t.calendar.freeWeight
    }
    return `${weight} kg`
  }

  return {
    getMonthName,
    getDayName,
    formatDate,
    formatWeight,
    t: t.calendar,
  }
}
