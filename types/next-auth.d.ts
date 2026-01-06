import 'next-auth'
import 'next-auth/jwt'

/**
 * NextAuth.jsの型定義を拡張
 * カスタムフィールド（accessToken, refreshToken等）を追加
 */
declare module 'next-auth' {
    interface Session {
        accessToken?: string
        refreshToken?: string
        expiresAt?: number
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string
        refreshToken?: string
        expiresAt?: number
    }
}
