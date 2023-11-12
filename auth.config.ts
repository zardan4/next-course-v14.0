import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
    // auth providers in NextAuth.js are services that can be used to sign in a user.
    providers: [],

    // routes to redirect into to do auth stuff
    // if route is not specified the default routes will be used
    pages: {
        signIn: '/login',
    },

    secret: process.env.AUTH_SECRET,

    // middleware that is called to check if user is authorized
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            console.log(1)
            // if user is authorized
            const isLoggedIn = !!auth?.user;
            // if user is on route that may be forbidden
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

            if (isOnDashboard) {
                if (isLoggedIn) return NextResponse.next();
                return NextResponse.redirect(new URL('/dashboard', nextUrl)); // redirect unauthenticated user to login page
            } else if (isLoggedIn) {
                // if user is already logged in redirect to dashboard
                return NextResponse.redirect(new URL('/dashboard', nextUrl))
            }

            return NextResponse.next();
        },
    }
} satisfies NextAuthConfig;