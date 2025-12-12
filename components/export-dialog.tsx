"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { downloadExport, downloadPDFExport, type ExportType, type PDFSections } from "@/utils/export-utils"
import { useLanguage } from "@/lib/i18n/context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ExportDialogProps {
  startDate: string
  endDate: string
  className?: string
}

type ExportFormat = "csv" | "pdf"

export function ExportDialog({ startDate, endDate, className }: ExportDialogProps) {
  const { t, locale } = useLanguage()
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Format selection
  const [format, setFormat] = useState<ExportFormat>("pdf")

  // CSV options
  const [csvType, setCsvType] = useState<ExportType>("weekly-summary")
  const [includeCustomColumns, setIncludeCustomColumns] = useState(false)

  // PDF sections
  const [pdfSections, setPdfSections] = useState<PDFSections>({
    overview: true,
    volumeChart: true,
    exercisePerformance: true,
    weeklyProgress: true,
  })

  const handleSectionToggle = (section: keyof PDFSections) => {
    setPdfSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const selectedSectionsCount = Object.values(pdfSections).filter(Boolean).length

  const handleExport = async () => {
    setIsExporting(true)
    try {
      if (format === "csv") {
        await downloadExport({
          startDate,
          endDate,
          type: csvType,
          includeCustomColumns,
          locale,
        })
      } else {
        await downloadPDFExport({
          startDate,
          endDate,
          sections: pdfSections,
          locale,
        })
      }
      toast.success(t.export.exportSuccess)
      setOpen(false)
    } catch (error) {
      console.error("Error exporting:", error)
      toast.error(t.export.exportError)
    } finally {
      setIsExporting(false)
    }
  }

  const canExport = format === "csv" || selectedSectionsCount > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t.export.export}</span>
          <span className="sm:hidden">{t.export.export}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t.export.exportData}
          </DialogTitle>
          <DialogDescription>{t.export.exportDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t.export.selectFormat}</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="pdf"
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  format === "pdf" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50",
                )}
              >
                <RadioGroupItem value="pdf" id="pdf" className="sr-only" />
                <FileText className={cn("h-8 w-8", format === "pdf" ? "text-primary" : "text-muted-foreground")} />
                <div className="text-center">
                  <p className="font-medium">PDF</p>
                  <p className="text-xs text-muted-foreground">{t.export.pdfDesc}</p>
                </div>
                {format === "pdf" && (
                  <Badge variant="secondary" className="mt-1">
                    <Check className="h-3 w-3 mr-1" />
                    {t.export.selected}
                  </Badge>
                )}
              </Label>

              <Label
                htmlFor="csv"
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  format === "csv" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50",
                )}
              >
                <RadioGroupItem value="csv" id="csv" className="sr-only" />
                <FileSpreadsheet
                  className={cn("h-8 w-8", format === "csv" ? "text-primary" : "text-muted-foreground")}
                />
                <div className="text-center">
                  <p className="font-medium">CSV</p>
                  <p className="text-xs text-muted-foreground">{t.export.csvDesc}</p>
                </div>
                {format === "csv" && (
                  <Badge variant="secondary" className="mt-1">
                    <Check className="h-3 w-3 mr-1" />
                    {t.export.selected}
                  </Badge>
                )}
              </Label>
            </RadioGroup>
          </div>

          <Separator />

          {/* PDF Options */}
          {format === "pdf" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{t.export.sectionsToInclude}</Label>
                <Badge variant="outline">
                  {selectedSectionsCount} {t.export.sectionsSelected}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    pdfSections.overview ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50",
                  )}
                  onClick={() => handleSectionToggle("overview")}
                >
                  <Checkbox
                    id="overview"
                    checked={pdfSections.overview}
                    onCheckedChange={() => handleSectionToggle("overview")}
                  />
                  <div className="flex-1">
                    <Label htmlFor="overview" className="font-medium cursor-pointer">
                      {t.export.overviewSection}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t.export.overviewSectionDesc}</p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    pdfSections.volumeChart ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50",
                  )}
                  onClick={() => handleSectionToggle("volumeChart")}
                >
                  <Checkbox
                    id="volumeChart"
                    checked={pdfSections.volumeChart}
                    onCheckedChange={() => handleSectionToggle("volumeChart")}
                  />
                  <div className="flex-1">
                    <Label htmlFor="volumeChart" className="font-medium cursor-pointer">
                      {t.export.volumeChartSection}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t.export.volumeChartSectionDesc}</p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    pdfSections.exercisePerformance ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50",
                  )}
                  onClick={() => handleSectionToggle("exercisePerformance")}
                >
                  <Checkbox
                    id="exercisePerformance"
                    checked={pdfSections.exercisePerformance}
                    onCheckedChange={() => handleSectionToggle("exercisePerformance")}
                  />
                  <div className="flex-1">
                    <Label htmlFor="exercisePerformance" className="font-medium cursor-pointer">
                      {t.export.exercisePerformanceSection}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t.export.exercisePerformanceSectionDesc}</p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    pdfSections.weeklyProgress ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50",
                  )}
                  onClick={() => handleSectionToggle("weeklyProgress")}
                >
                  <Checkbox
                    id="weeklyProgress"
                    checked={pdfSections.weeklyProgress}
                    onCheckedChange={() => handleSectionToggle("weeklyProgress")}
                  />
                  <div className="flex-1">
                    <Label htmlFor="weeklyProgress" className="font-medium cursor-pointer">
                      {t.export.weeklyProgressSection}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t.export.weeklyProgressSectionDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CSV Options */}
          {format === "csv" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t.export.csvType}</Label>
                <RadioGroup value={csvType} onValueChange={(v) => setCsvType(v as ExportType)} className="space-y-2">
                  <div
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      csvType === "weekly-summary" ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50",
                    )}
                    onClick={() => setCsvType("weekly-summary")}
                  >
                    <RadioGroupItem value="weekly-summary" id="weekly-summary" />
                    <div className="flex-1">
                      <Label htmlFor="weekly-summary" className="font-medium cursor-pointer">
                        {t.export.weeklySummary}
                      </Label>
                      <p className="text-xs text-muted-foreground">{t.export.weeklySummaryDesc}</p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      csvType === "weekly-detail" ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50",
                    )}
                    onClick={() => setCsvType("weekly-detail")}
                  >
                    <RadioGroupItem value="weekly-detail" id="weekly-detail" />
                    <div className="flex-1">
                      <Label htmlFor="weekly-detail" className="font-medium cursor-pointer">
                        {t.export.weeklyDetail}
                      </Label>
                      <p className="text-xs text-muted-foreground">{t.export.weeklyDetailDesc}</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                  includeCustomColumns ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50",
                )}
                onClick={() => setIncludeCustomColumns(!includeCustomColumns)}
              >
                <Checkbox
                  id="customColumns"
                  checked={includeCustomColumns}
                  onCheckedChange={(checked) => setIncludeCustomColumns(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="customColumns" className="font-medium cursor-pointer">
                    {t.export.includeCustomColumns}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t.export.includeCustomColumnsDesc}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t.export.cancel}
          </Button>
          <Button onClick={handleExport} disabled={isExporting || !canExport} className="min-w-[120px]">
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t.export.exporting}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t.export.exportNow}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
