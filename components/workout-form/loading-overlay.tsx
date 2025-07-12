import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  message: string
}

export const LoadingOverlay = ({ message }: LoadingOverlayProps) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      <p className="text-lg font-semibold text-gray-900">{message}</p>
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
)
