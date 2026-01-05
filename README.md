# YouTube Extract v2

YouTube Data APIを使った動画検索・プレイリスト作成Webアプリケーション

## 概要

既存のCLIツール [youtube_extract](https://github.com/your-username/youtube_extract) をNext.jsでWebアプリ化。
グラフィカルでインタラクティブなUIで、YouTubeの動画検索、フィルタリング、プレイリスト作成を実現します。

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Hosting**: Vercel
- **API**: YouTube Data API v3

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成：

```bash
cp .env.example .env.local
```

以下の値を設定：
- `YOUTUBE_API_KEY`: [Google Cloud Console](https://console.cloud.google.com/apis/credentials) から取得
- `GOOGLE_CLIENT_ID/SECRET`: OAuth認証用（Phase 3で使用）
- `NEXTAUTH_SECRET`: `openssl rand -base64 32` で生成

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

## 開発フェーズ

- [x] Phase 0: プロジェクトセットアップ
- [ ] Phase 1: 基本的な動画検索機能
- [ ] Phase 2: フィルタリング機能
- [ ] Phase 3: プレイリスト作成機能
- [ ] Phase 4: ホワイトリスト管理

詳細は [docs/tasks.md](docs/tasks.md) を参照

## Git ワークフロー

- `main`: 本番環境（Vercelデプロイ）
- `dev`: 開発環境（安定版）
- `feature/*`: 機能開発ブランチ

## ドキュメント

- [要件定義](docs/requirements.md)
- [設計書](docs/design.md)
- [タスク管理](docs/tasks.md)

## ライセンス

MIT
