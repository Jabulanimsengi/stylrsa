import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { getInternalBackendOrigin } from "@/lib/server/backend-origin";

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && account.provider === 'google') {
        try {
          // Read role from cookie for Google OAuth
          const cookieStore = await cookies();
          const roleCookie = cookieStore.get('oauth_signup_role');
          const selectedRole = roleCookie?.value || 'CLIENT';
          
          console.log('[NextAuth] OAuth signup - role from cookie:', selectedRole);

          // Clear cookie after reading
          try {
            cookieStore.delete('oauth_signup_role');
          } catch {}

          const backendOrigin = getInternalBackendOrigin();
          console.log('[NextAuth] Calling backend SSO at:', `${backendOrigin}/api/auth/sso`);
          
          const r = await fetch(`${backendOrigin}/api/auth/sso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              email: (profile as any)?.email,
              name: (profile as any)?.name,
              role: selectedRole,
            })
          });
          
          console.log('[NextAuth] Backend SSO response status:', r.status);
          
          if (r.ok) {
            const data = await r.json();
            console.log('[NextAuth] Got backend JWT:', data.jwt ? 'Yes' : 'No');
            console.log('[NextAuth] Got user:', data.user?.id, data.user?.role);
            
            (token as any).backendJwt = data.jwt;
            (token as any).userId = data.user?.id;
            (token as any).role = data.user?.role;
            
            // Try to set cookie directly (may not work in all contexts)
            try {
              const isProduction = process.env.NODE_ENV === 'production';
              cookieStore.set('access_token', String(data.jwt), {
                httpOnly: true,
                sameSite: 'lax',
                secure: isProduction,
                path: '/',
                maxAge: 60 * 60 * 24,
              });
              console.log('[NextAuth] Set access_token cookie');
            } catch (cookieError) {
              console.warn('[NextAuth] Could not set cookie directly:', cookieError);
            }
          } else {
            const errorText = await r.text();
            console.error('[NextAuth] Backend SSO failed:', r.status, errorText);
          }
        } catch (error) {
          console.error('[NextAuth] OAuth callback error:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).backendJwt = (token as any).backendJwt;
      if (session.user) {
        (session.user as any).id = (token as any).userId;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
