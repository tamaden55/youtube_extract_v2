# Next.js + Supabase + OAuth連携

このドキュメントでは、Next.jsプロジェクトにおけるSupabaseとOAuthの連携について、このプロジェクトの実装例を交えて説明します。

## アーキテクチャ概要

このプロジェクトでは、2つの異なる認証・データ管理システムを組み合わせています：

1. **NextAuth.js（OAuth）**: Google OAuth経由でYouTube APIにアクセス
2. **Supabase**: データベースとしてホワイトリストチャンネルを管理

```
[ユーザー]
    |
    +-- Google OAuth（NextAuth.js） --> YouTube API
    |                                    - プレイリスト作成
    |                                    - 動画検索
    |
    +-- Supabase Database -----------> ホワイトリスト管理
                                        - チャンネル登録
                                        - カテゴリ分類
```

## NextAuth.js による OAuth 実装

### 設定ファイル: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    // 必要なスコープを指定
                    scope: [
                        'openid',
                        'email',
                        'profile',
                        'https://www.googleapis.com/auth/youtube',
                        'https://www.googleapis.com/auth/youtube.force-ssl',
                    ].join(' '),
                    access_type: 'offline',  // リフレッシュトークン取得
                    prompt: 'consent',       // 毎回同意画面を表示
                },
            },
        }),
    ],
    callbacks: {
        // JWT トークンにアクセストークンを保存
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
                token.expiresAt = account.expires_at
            }
            return token
        },
        // セッションにアクセストークンを渡す
        async session({ session, token }) {
            session.accessToken = token.accessToken as string
            session.refreshToken = token.refreshToken as string
            session.expiresAt = token.expiresAt as number
            return session
        },
    },
    session: {
        strategy: 'jwt',  // JWTベースのセッション管理
    },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### NextAuth.js の重要ポイント

#### 1. スコープ設定
```typescript
scope: [
    'openid',           // OpenID Connect（ユーザー識別）
    'email',            // メールアドレス取得
    'profile',          // プロフィール情報取得
    'https://www.googleapis.com/auth/youtube',          // YouTube読み書き
    'https://www.googleapis.com/auth/youtube.force-ssl', // HTTPS経由アクセス
].join(' ')
```

- **OpenID Connect**: ユーザーの認証情報（誰がログインしているか）
- **YouTube スコープ**: プレイリスト作成などの操作権限

#### 2. アクセストークンの保存
```typescript
async jwt({ token, account }) {
    if (account) {
        token.accessToken = account.access_token    // YouTube APIアクセス用
        token.refreshToken = account.refresh_token  // トークン更新用
        token.expiresAt = account.expires_at        // 有効期限
    }
    return token
}
```

- **JWT**: JSON Web Token、セッション情報をクライアント側で保持
- **account**: 初回ログイン時のみ存在（Google から返される情報）

#### 3. セッション管理
```typescript
session: {
    strategy: 'jwt',  // データベースセッションではなくJWT
}
```

- **JWT戦略**: サーバーサイドでセッションストアを持たない
- **利点**: スケーラブル（サーバーレス環境に適している）
- **欠点**: トークンの即座な無効化が困難

## Supabase によるデータベース管理

### Supabase クライアント設定: `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Supabase の特徴

1. **PostgreSQL ベースのデータベース**
   - リレーショナルデータベースの強力な機能
   - SQLクエリが使える

2. **Row Level Security（RLS）**
   - テーブル単位でアクセス制御
   - ユーザーごとに表示・編集権限を設定可能

3. **リアルタイム機能**
   - データベースの変更をリアルタイムで購読可能

4. **RESTful API 自動生成**
   - テーブル作成と同時にAPIエンドポイントが利用可能

### データベーススキーマ例

```sql
CREATE TABLE whitelist_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT UNIQUE NOT NULL,
  channel_name TEXT NOT NULL,
  category TEXT,
  subscriber_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whitelist_channel_id ON whitelist_channels(channel_id);
CREATE INDEX idx_whitelist_category ON whitelist_channels(category);
```

### Supabase を使ったCRUD操作

#### データ取得（Read）
```typescript
// GET /api/whitelist
const { data, error } = await supabase
    .from('whitelist_channels')
    .select('*')
    .order('created_at', { ascending: false })
```

#### データ追加（Create）
```typescript
// POST /api/whitelist
const { data, error } = await supabase
    .from('whitelist_channels')
    .insert({
        channel_id: 'UCxxxxx',
        channel_name: 'Example Channel',
        category: 'tech',
        subscriber_count: 100000
    })
    .select()
    .single()
```

#### データ削除（Delete）
```typescript
// DELETE /api/whitelist/[id]
const { error } = await supabase
    .from('whitelist_channels')
    .delete()
    .eq('id', channelId)
```

## Next.js における環境変数管理

### 環境変数の種類

#### 1. サーバーサイドのみ（秘密情報）
```
GOOGLE_CLIENT_SECRET=your_secret
YOUTUBE_API_KEY=your_api_key
```

- ブラウザに露出しない
- API Routes やサーバーコンポーネントでのみアクセス可能

#### 2. クライアントサイドでも使用可能
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

- `NEXT_PUBLIC_` プレフィックスが必要
- ブラウザのJavaScriptから参照可能
- 秘密情報は含めない

### Next.js 15 App Router の特徴

#### サーバーコンポーネント vs クライアントコンポーネント

```typescript
// サーバーコンポーネント（デフォルト）
export default async function ServerPage() {
    // 直接データベースにアクセス可能
    const { data } = await supabase.from('whitelist_channels').select('*')
    return <div>{data.length} channels</div>
}

// クライアントコンポーネント
'use client'
export default function ClientComponent() {
    const [data, setData] = useState([])

    useEffect(() => {
        // APIルート経由でデータ取得
        fetch('/api/whitelist')
            .then(res => res.json())
            .then(setData)
    }, [])

    return <div>{data.length} channels</div>
}
```

## 一般的な Next.js + Supabase + OAuth 連携パターン

### パターン1: Supabase Auth + OAuth（本プロジェクトでは未使用）

Supabaseの認証機能を使用してOAuthを実装：

```typescript
// Supabase Authでサインイン
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        scopes: 'https://www.googleapis.com/auth/youtube',
    }
})
```

**利点**:
- Supabaseが認証とデータベースを統合管理
- ユーザー情報とデータの紐付けが容易

**欠点**:
- NextAuth.jsほど柔軟性がない
- カスタマイズが限定的

### パターン2: NextAuth.js + Supabase（本プロジェクトで採用）

NextAuth.jsで認証、Supabaseはデータベースのみ：

```typescript
// NextAuth.jsで認証
const session = await getServerSession(authOptions)

// Supabaseでデータ管理
const { data } = await supabase
    .from('whitelist_channels')
    .select('*')
```

**利点**:
- 認証とデータ管理の分離（関心の分離）
- NextAuth.jsの柔軟な設定が使える

**欠点**:
- ユーザー情報とデータの紐付けは手動実装
- 2つのシステムを管理する必要がある

### パターン3: NextAuth.js + Supabase Adapter

NextAuth.jsのセッションデータをSupabaseに保存：

```typescript
import { SupabaseAdapter } from '@auth/supabase-adapter'

export const authOptions: NextAuthOptions = {
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
    }),
    // ...
}
```

**利点**:
- セッション管理がデータベース化
- ユーザー情報の永続化

**欠点**:
- データベースへの依存が増える
- サーバーレス環境でのパフォーマンス懸念

## セキュリティのベストプラクティス

### 1. 環境変数の保護
- `.env.local` をGit管理外にする（`.gitignore`に追加）
- Vercel環境変数に本番用の値を設定

### 2. Supabase Row Level Security（RLS）
```sql
-- 例: ログインユーザーのみデータ取得可能
CREATE POLICY "Enable read for authenticated users only"
ON whitelist_channels
FOR SELECT
TO authenticated
USING (true);
```

### 3. API Route の保護
```typescript
// app/api/protected/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 認証済みユーザーのみ実行
}
```

## デプロイ時の注意点

### Vercel へのデプロイ
1. GitHub リポジトリと連携
2. 環境変数を設定:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `YOUTUBE_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXTAUTH_URL`（本番URL）
   - `NEXTAUTH_SECRET`（ランダム文字列）

3. Google Cloud Console で許可されたリダイレクトURIを設定:
   - `https://your-app.vercel.app/api/auth/callback/google`

### Supabase プロジェクト設定
1. プロジェクト作成
2. テーブル作成（SQL Editor使用）
3. RLS ポリシー設定
4. API キーをVercel環境変数に追加

## 参考リソース

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
