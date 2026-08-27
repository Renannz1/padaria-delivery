import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteção de borda no servidor Next.js para rotas do painel admin
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Adiciona header indicando que a rota é administrativa e deve ser verificada pelo servidor
    const response = NextResponse.next()
    response.headers.set('x-admin-route', 'true')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
