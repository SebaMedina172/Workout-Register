import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/i18n/context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mi Entrenamiento - Workout Tracker",
  description:
    "Aplicación para planificación y registro de entrenamientos. Lleva el control de tus rutinas de ejercicio de forma fácil y eficiente.",
  generator: "v0.app",
  keywords: ["entrenamiento", "fitness", "ejercicio", "rutina", "gym", "workout", "tracker"],
  authors: [{ name: "Mi Entrenamiento App" }],
  creator: "Mi Entrenamiento App",
  publisher: "Mi Entrenamiento App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://mi-entrenamiento.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mi Entrenamiento - Workout Tracker",
    description: "Aplicación para planificación y registro de entrenamientos",
    url: "https://mi-entrenamiento.vercel.app",
    siteName: "Mi Entrenamiento",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Mi Entrenamiento Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Entrenamiento - Workout Tracker",
    description: "Aplicación para planificación y registro de entrenamientos",
    images: ["/android-chrome-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mi Entrenamiento",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Mi Entrenamiento",
    "application-name": "Mi Entrenamiento",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#3b82f6",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
