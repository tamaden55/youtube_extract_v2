# YouTube Extract v2 - 設計書

## 技術スタック

### フロントエンド
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

### バックエンド/インフラ
- Next.js API Routes
- Supabase (データベース + 認証)
- Vercel (ホスティング)

### 外部API
- YouTube Data API v3
- Google OAuth 2.0

## アーキテクチャ

### ディレクトリ構成
```
youtube_extract_v2/
├── app/                  # Next.js App Router
│   ├── api/             # API Routes
│   │   ├── youtube/     # YouTube API endpoints
│   │   └── auth/        # NextAuth.js
│   ├── search/          # 検索ページ
│   └── layout.tsx       # ルートレイアウト
├── components/          # Reactコンポーネント
│   ├── search/          # 検索関連
│   ├── filter/          # フィルター関連
│   └── playlist/        # プレイリスト関連
├── lib/                 # ユーティリティ
│   ├── youtube.ts       # YouTube API ラッパー
│   └── supabase.ts      # Supabase クライアント
├── types/               # TypeScript型定義
└── docs/                # ドキュメント
```

## データモデル

### VideoInfo
```typescript
interface VideoInfo {
  videoId: string
  title: string
  channelId: string
  channelTitle: string
  publishedAt: string
  description: string
  thumbnailUrl: string
}
```

### ChannelStats
```typescript
interface ChannelStats {
  channelId: string
  subscriberCount: number
  videoCount: number
}
```

### FilterPreset
```typescript
type FilterMode = 'strict' | 'moderate' | 'none'

interface FilterPreset {
  mode: FilterMode
  minSubscribers?: number
  minVideoCount?: number
  excludeKeywords?: string[]
}
```

## API設計

### GET /api/youtube/search
- Query: `q` (keyword), `maxResults`, `days`
- Response: `VideoInfo[]`

### GET /api/youtube/channels
- Query: `channelIds[]`
- Response: `ChannelStats[]`

### POST /api/youtube/playlist
- Body: `{ title, description, videoIds[] }`
- Response: `{ playlistId, url }`
