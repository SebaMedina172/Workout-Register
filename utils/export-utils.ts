export type ExportType = "weekly-summary" | "weekly-detail"

export interface ExportOptions {
  startDate: string
  endDate: string
  type: ExportType
  includeCustomColumns: boolean
  locale: string //locale para internacionalización
}

export interface PDFSections {
  overview: boolean
  volumeChart: boolean
  exercisePerformance: boolean
  weeklyProgress: boolean
}

export interface PDFExportOptions {
  startDate: string
  endDate: string
  sections: PDFSections
  locale: string
}

export async function downloadExport(options: ExportOptions): Promise<void> {
  const { startDate, endDate, type, includeCustomColumns, locale } = options

  const params = new URLSearchParams({
    startDate,
    endDate,
    type,
    includeCustomColumns: String(includeCustomColumns),
    locale, // Pasar locale a la API
  })


  const response = await fetch(`/api/export/csv?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al exportar datos")
  }

  // Obtener el nombre del archivo del header
  const contentDisposition = response.headers.get("Content-Disposition")
  let filename = `export-${startDate}-${endDate}.csv`
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/)
    if (match) {
      filename = match[1]
    }
  }

  // Descargar el archivo
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export async function downloadPDFExport(options: PDFExportOptions): Promise<void> {
  const { startDate, endDate, sections, locale } = options

  const params = new URLSearchParams({
    startDate,
    endDate,
    locale,
    sections: JSON.stringify(sections),
  })

  const response = await fetch(`/api/export/pdf?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al exportar PDF")
  }

  const contentDisposition = response.headers.get("Content-Disposition")
  let filename = `workout-report-${startDate}-${endDate}.pdf`
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/)
    if (match) {
      filename = match[1]
    }
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
