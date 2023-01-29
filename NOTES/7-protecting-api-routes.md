# Protecting API Routes
- review https://next-auth.js.org/tutorials/role-based-login-strategy for role-based access
- https://blog.tericcabrel.com/protect-your-api-routes-in-next-js-with-middleware/
- https://next-auth.js.org/configuration/nextjs#middleware
- Available on Next 12 and above

## Middleware File
- Convention: <span class="pink monospace">/root/middleware.js</span>
- Runs logic before accessing any page
- Only supports a jwt strategy
- The config object constant takes a matcher property to identify routes to go through MW
- [Using Cookies](https://nextjs.org/docs/advanced-features/middleware#using-cookies)

```js
import {NextRequest, NextResponse} from 'next/server.js';

const isUserRoute = pathname => pathname.startsWith("/api/users");
const isAdminRoute = pathname => pathname.startsWith("/api/admin");

export async function middleware(NextRequest) {
    const role = NextRequest.headers.get("authorization");
    const {pathname} = NextRequest.nextUrl;

    if (isUserRoute(pathname) && !["user", "admin"].find(r => r === role)) {
        return NextResponse.redirect(new URL("/api/auth/unauthorized", NextRequest.url));
    }

     if (isAdminRoute(pathname) && !["admin"].find(r => r === role)) {
        return NextResponse.redirect(new URL("/api/auth/unauthorized", NextRequest.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/users/:path*', '/api/admin/:path*']
};
```