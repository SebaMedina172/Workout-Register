"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { downloadExport, type ExportType } from "@/utils/export-utils"
import { useLanguage } from "@/lib/i18n/context"
import { toast } from "sonner"

interface ExportButtonProps {
  startDate: string
  endDate: string
  className?: string
}

export function ExportButton({ startDate, endDate, className }: ExportButtonProps) {
  const { t, locale } = useLanguage()
  const [isExporting, setIsExporting] = useState(false)
  const [includeCustomColumns, setIncludeCustomColumns] = useState(false)

  const handleExport = async (type: ExportType) => {
    setIsExporting(true)
    try {
      await downloadExport({
        startDate,
        endDate,
        type,
        includeCustomColumns,
        locale, // Pasar locale a la función de descarga
      })
      toast.success(t.export.exportSuccess)
    } catch (error) {
      console.error("Error exporting:", error)
      toast.error(t.export.exportError)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className} disabled={isExporting}>
          {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          <span className="hidden sm:inline">{t.export.export}</span>
          <span className="sm:hidden">CSV</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          {t.export.exportToCSV}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleExport("weekly-summary")}>
          <div className="flex flex-col">
            <span className="font-medium">{t.export.weeklySummary}</span>
            <span className="text-xs text-muted-foreground">{t.export.weeklySummaryDesc}</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport("weekly-detail")}>
          <div className="flex flex-col">
            <span className="font-medium">{t.export.weeklyDetail}</span>
            <span className="text-xs text-muted-foreground">{t.export.weeklyDetailDesc}</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={includeCustomColumns}
          onCheckedChange={setIncludeCustomColumns}
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex flex-col">
            <span>{t.export.includeCustomColumns}</span>
            <span className="text-xs text-muted-foreground">{t.export.includeCustomColumnsDesc}</span>
          </div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
