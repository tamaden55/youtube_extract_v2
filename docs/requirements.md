# YouTube Extract v2 - 要件定義

## プロジェクト概要
YouTube Data APIを使用した動画検索・プレイリスト作成Webアプリケーション

## 目的
- Next.js/React/TypeScriptの学習
- 既存のCLIツール（youtube_extract）をWebアプリ化
- グラフィカルでインタラクティブなUI/UX提供

## 機能要件

### Phase 1: 基本的な動画検索機能
- キーワードによる動画検索
- 検索結果一覧表示（サムネイル、タイトル、チャンネル名）
- YouTube Data API v3との連携

### Phase 2: フィルタリング機能
- フィルタープリセット選択（strict/moderate/none）
- チャンネル統計に基づくフィルタリング
- リアルタイムフィルター適用

### Phase 3: プレイリスト作成機能
- Google OAuth認証
- 動画選択UI
- YouTube プレイリスト作成

### Phase 4: ホワイトリスト管理
- 信頼できるチャンネルの登録・管理
- カテゴリ分類
- チャンネル検索・追加UI

## 非機能要件
- TypeScriptによる型安全性
- レスポンシブデザイン
- YouTube API quota管理（10,000 units/day以内）
- 環境変数による秘密情報管理
