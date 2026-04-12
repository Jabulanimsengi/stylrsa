import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { cookies } from "next/headers";
import { getInternalBackendOrigin } from "@/lib/server/backend-origin";

type GoogleProfile = {
  email?: string | null;
  name?: string | null;
};

type BackendAuthUser = {
  id?: string;
  role?: string;
  onboardingStatus?: string;
};

type BackendSsoResponse = {
  jwt?: string;
  user?: BackendAuthUser;
};

type AppToken = JWT & {
  backendJwt?: string;
  userId?: string;
  role?: string;
  onboardingStatus?: string;
};

type AppSession = Session & {
  backendJwt?: string;
  user?: Session["user"] & {
    id?: string;
    role?: string;
    onboardingStatus?: string;
  };
};

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
      const appToken = token as AppToken;
      if (account && account.provider === 'google') {
        try {
          const cookieStore = await cookies();
          const backendOrigin = getInternalBackendOrigin();
          console.log('[NextAuth] Calling backend SSO at:', `${backendOrigin}/api/auth/sso`);
          
          const r = await fetch(`${backendOrigin}/api/auth/sso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              email: (profile as GoogleProfile | null)?.email,
              name: (profile as GoogleProfile | null)?.name,
            })
          });
          
          console.log('[NextAuth] Backend SSO response status:', r.status);
          
          if (r.ok) {
            const data = await r.json() as BackendSsoResponse;
            console.log('[NextAuth] Got backend JWT:', data.jwt ? 'Yes' : 'No');
            console.log('[NextAuth] Got user:', data.user?.id, data.user?.role);
            
            appToken.backendJwt = data.jwt;
            appToken.userId = data.user?.id;
            appToken.role = data.user?.role;
            appToken.onboardingStatus = data.user?.onboardingStatus;
            
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
      return appToken;
    },
    async session({ session, token }) {
      const appSession = session as AppSession;
      const appToken = token as AppToken;
      appSession.backendJwt = appToken.backendJwt;
      if (appSession.user) {
        appSession.user.id = appToken.userId;
        appSession.user.role = appToken.role;
        appSession.user.onboardingStatus = appToken.onboardingStatus;
      }
      return appSession;
    },
  },
});

export { handler as GET, handler as POST };
