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
  duration: string  // ISO 8601形式 (例: PT59S, PT1M30S) - Phase 5で追加
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
type FilterMode = 'whitelist' | 'strict' | 'moderate' | 'none'

interface FilterPreset {
  mode: FilterMode
  minSubscribers?: number
  minVideoCount?: number
  excludeKeywords?: string[]
  excludeShorts?: boolean  // Phase 5: ショート動画（60秒以下）を除外
}
```

### WhitelistChannel
```typescript
interface WhitelistChannel {
  id: string
  channel_id: string
  channel_name: string
  category: string | null
  subscriber_count: number | null
  created_at: string
  updated_at: string
}
```

## Supabase データベース設計

### whitelist_channels テーブル
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

## API設計

### GET /api/youtube/search
- Query: `q` (keyword), `maxResults`, `days`
- Response: `VideoInfo[]` (Phase 5: duration フィールドを含む)
- 実装: contentDetails.duration を取得して ISO 8601 形式で返す

### GET /api/youtube/channels
- Query: `channelIds[]`
- Response: `ChannelStats[]`

### POST /api/youtube/playlist
- Body: `{ title, description, videoIds[] }`
- Response: `{ playlistId, url, videosAdded, totalVideos, results }`
- 実装: 動画を順番に1つずつ追加（YouTube API の競合を回避）
- エラーハンドリング: 各動画の追加結果を個別に記録

### GET /api/whitelist
- Query: `category` (optional)
- Response: `{ success: boolean, channels: WhitelistChannel[], count: number }`

### POST /api/whitelist
- Body: `{ channel_id, channel_name, category?, subscriber_count? }`
- Response: `{ success: boolean, channel: WhitelistChannel }`

### DELETE /api/whitelist/[id]
- Params: `id` (UUID)
- Response: `{ success: boolean, message: string }`

### GET /api/youtube/channel-lookup
- Query: `input` (チャンネルURL、ハンドル名、またはチャンネルID)
- Response: `{ channelId: string, channelName: string, subscriberCount: number }`
- 用途: チャンネルURL（@username形式など）からチャンネルIDを自動取得
