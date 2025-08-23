import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const pathname = req.nextUrl.pathname

    // Solo redirigir si no hay sesión y está en la página principal
    if (!session && pathname === "/") {
      const redirectUrl = new URL("/auth", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Solo redirigir si hay sesión y está en auth (pero no en callback)
    if (session && pathname === "/auth") {
      const redirectUrl = new URL("/", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    return response
  }
}

export const config = {
  matcher: ["/((?!api|auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
