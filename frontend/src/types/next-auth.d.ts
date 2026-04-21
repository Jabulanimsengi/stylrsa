/* eslint-disable @typescript-eslint/no-explicit-any */
import 'next-auth';
import type { ReactNode, FC } from 'react';

declare module 'next-auth' {
  interface Session {
    backendJwt?: string;
    user?: {
      id?: string;
      email?: string;
      name?: string;
      role?: string;
      firstName?: string;
      lastName?: string;
      onboardingStatus?: string;
      emailVerified?: boolean;
      phoneNumber?: string | null;
      salonId?: string | null;
    };
  }
}

declare module 'next-auth/react' {
  import type { Session } from 'next-auth';

  export interface UseSessionOptions {
    required?: boolean;
    onUnauthenticated?: () => void;
  }

  export interface SessionContextValue {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    update: (data?: any) => Promise<Session | null>;
  }

  export interface SignInOptions {
    callbackUrl?: string;
    redirect?: boolean;
  }

  export interface SignOutOptions {
    callbackUrl?: string;
    redirect?: boolean;
  }

  export interface SessionProviderProps {
    children: ReactNode;
    session?: Session | null;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  }

  export function useSession(options?: UseSessionOptions): SessionContextValue;
  export function signIn(provider?: string, options?: SignInOptions): Promise<any>;
  export function signOut(options?: SignOutOptions): Promise<any>;
  export function getSession(options?: any): Promise<Session | null>;
  export function getCsrfToken(): Promise<string | undefined>;
  export function getProviders(): Promise<Record<string, any> | null>;
  export const SessionProvider: FC<SessionProviderProps>;
}
