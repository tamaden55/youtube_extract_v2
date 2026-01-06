# YouTube Extract v2

YouTube Data APIを使った動画検索・プレイリスト作成Webアプリケーション

## 本番環境

**Production URL**: https://youtube-extract-v2.vercel.app

- **検索ページ**: https://youtube-extract-v2.vercel.app/search
- **ホワイトリスト管理**: https://youtube-extract-v2.vercel.app/whitelist

## 概要

既存のCLIツール [youtube_extract](https://github.com/your-username/youtube_extract) をNext.jsでWebアプリ化。
グラフィカルでインタラクティブなUIで、YouTubeの動画検索、フィルタリング、プレイリスト作成を実現します。

## 主な機能

- YouTube動画のキーワード検索
- チャンネル統計に基づくフィルタリング（strict/moderate/none）
- ホワイトリストによる信頼できるチャンネル管理
- Google OAuth認証によるプレイリスト作成
- チャンネルURL/ハンドル名からの自動ID取得
- ショート動画除外フィルター（60秒以下の動画を除外）

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Hosting**: Vercel
- **Authentication**: NextAuth.js
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
- [x] Phase 1: 基本的な動画検索機能
- [x] Phase 2: フィルタリング機能
- [x] Phase 3: プレイリスト作成機能
- [x] Phase 4: ホワイトリスト管理
- [x] Phase 5: ショート動画除外フィルター
- [x] Vercel本番デプロイ完了

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
