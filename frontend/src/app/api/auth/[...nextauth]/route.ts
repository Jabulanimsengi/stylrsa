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
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  onboardingStatus?: string;
  phoneNumber?: string | null;
  salonId?: string | null;
  emailVerified?: boolean;
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
  backendUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    onboardingStatus?: string;
    phoneNumber?: string | null;
    salonId?: string | null;
    emailVerified?: boolean;
  };
};

type AppSession = Session & {
  backendJwt?: string;
  user?: Session["user"] & {
    id?: string;
    role?: string;
    onboardingStatus?: string;
    firstName?: string;
    lastName?: string;
    emailVerified?: boolean;
    phoneNumber?: string | null;
    salonId?: string | null;
  };
};

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
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
            if (data.user?.id) {
              const backendUser = data.user;
              const backendUserId = backendUser.id!;
              appToken.backendUser = {
                id: backendUserId,
                email: backendUser.email ?? (profile as GoogleProfile | null)?.email ?? '',
                firstName: backendUser.firstName ?? '',
                lastName: backendUser.lastName ?? '',
                role: backendUser.role ?? 'PENDING',
                onboardingStatus: backendUser.onboardingStatus,
                phoneNumber: backendUser.phoneNumber ?? null,
                salonId: backendUser.salonId ?? null,
                emailVerified: backendUser.emailVerified,
              };
            }
            
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
        if (appToken.backendUser) {
          appSession.user.email = appToken.backendUser.email;
          appSession.user.name = [appToken.backendUser.firstName, appToken.backendUser.lastName].filter(Boolean).join(' ');
          appSession.user.firstName = appToken.backendUser.firstName;
          appSession.user.lastName = appToken.backendUser.lastName;
          appSession.user.emailVerified = appToken.backendUser.emailVerified;
          appSession.user.phoneNumber = appToken.backendUser.phoneNumber;
          appSession.user.salonId = appToken.backendUser.salonId;
        }
      }
      return appSession;
    },
  },
});

export { handler as GET, handler as POST };
