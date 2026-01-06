# YouTube Extract v2 - 要件定義

## プロジェクト概要
YouTube Data APIを使用した動画検索・プレイリスト作成Webアプリケーション

## 目的
- Next.js/React/TypeScriptの学習
- 既存のCLIツール（youtube_extract）をWebアプリ化
- グラフィカルでインタラクティブなUI/UX提供

## 機能要件

### Phase 1: 基本的な動画検索機能 ✅ 完了
- キーワードによる動画検索
- 検索結果一覧表示（サムネイル、タイトル、チャンネル名）
- YouTube Data API v3との連携
- 日付フィルター（過去N日以内の動画）

### Phase 2: フィルタリング機能 ✅ 完了
- フィルタープリセット選択（whitelist/strict/moderate/none）
- チャンネル統計に基づくフィルタリング
- リアルタイムフィルター適用
- 登録者数・動画本数による絞り込み

### Phase 3: プレイリスト作成機能 ✅ 完了
- Google OAuth認証（NextAuth.js）
- 動画選択UI（複数選択対応）
- YouTube プレイリスト作成
- 順次追加によるAPI競合回避

### Phase 4: ホワイトリスト管理 ✅ 完了
- 信頼できるチャンネルの登録・管理（Supabase）
- カテゴリ分類機能
- チャンネル検索・追加UI
- チャンネルURL/ハンドル名から自動的にチャンネルIDを取得
  - @username形式のハンドル名に対応
  - カスタムURL形式に対応
  - 既存のチャンネルID形式もサポート
- ホワイトリストフィルターモード

## 非機能要件
- TypeScriptによる型安全性
- レスポンシブデザイン（Tailwind CSS）
- YouTube API quota管理（10,000 units/day以内）
- 環境変数による秘密情報管理
- Next.js 15 App Router対応
- Vercel本番環境デプロイ
- Supabaseデータベース連携
- Google OAuth 2.0認証

## デプロイ情報
- **本番URL**: https://youtube-extract-v2.vercel.app
- **ホスティング**: Vercel
- **データベース**: Supabase
- **CI/CD**: GitHub連携による自動デプロイ
