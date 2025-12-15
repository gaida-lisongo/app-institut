import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middlewares/authMiddleware';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Gérer les requêtes OPTIONS (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });
  }

  // Exclure les pages de login et auth
  const isAuthPage = pathname.includes('/signin') || 
                     pathname.includes('/signup') ||
                     pathname.startsWith('/api/auth') ||
                     pathname === '/';

  if (isAuthPage) {
    return NextResponse.next();
  }

  // 1. Vérifier l'authentification pour les pages admin
  // Les routes avec (admin) dans Next.js sont transformées, on vérifie différemment
  const isAdminRoute = pathname.startsWith('/admin') || 
                      pathname.includes('/(admin)') ||
                      // Vérifier si c'est une route qui devrait être protégée
                      (pathname !== '/' && 
                       !pathname.startsWith('/api') && 
                       !pathname.startsWith('/_next') &&
                       !pathname.startsWith('/public'));
  
  if (isAdminRoute) {
    const pageAuthResult = await AuthMiddleware.verifyPageAuth(request);
    if (pageAuthResult) {
      return pageAuthResult;
    }
  }

  // 2. Vérifier l'authentification pour les routes API protégées
  if (pathname.startsWith('/api/')) {
    const apiAuthResult = await AuthMiddleware.verifyApiAuth(request);
    if (apiAuthResult) {
      return apiAuthResult;
    }
  }

  // Laisser passer toutes les autres requêtes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login pages (but not login/[id])
     */
    '/((?!_next/static|_next/image|favicon.ico|public|signin|signup).*)',
  ],
};
