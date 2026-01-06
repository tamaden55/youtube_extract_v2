'use client'

import { SessionProvider } from 'next-auth/react'

/**
 * NextAuth SessionProvider
 * Client Componentとして分離
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>
}
