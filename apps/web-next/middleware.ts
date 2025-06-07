// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    locales: ['en', 'es'],
    defaultLocale: 'es',
    localePrefix: 'always' // This ensures locale is always in URL
});

export default function middleware(request: NextRequest) {
    // Handle root path redirect
    if (request.nextUrl.pathname === '/') {
        return Response.redirect(new URL('/es', request.url));
    }

    return intlMiddleware(request);
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};