# OAuth 2.0の仕組み

## OAuth 2.0とは

OAuth 2.0は、ユーザーが自分のパスワードを第三者アプリに渡すことなく、特定のリソースへのアクセス権限を付与するための認可フレームワークです。

## OAuth 2.0の主要な登場人物

1. **リソースオーナー（Resource Owner）**: ユーザー（あなた）
2. **クライアント（Client）**: アクセスを求めるアプリケーション（このNext.jsアプリ）
3. **認可サーバー（Authorization Server）**: Googleの認証サーバー
4. **リソースサーバー（Resource Server）**: YouTube Data API

## OAuth 2.0の基本的なフロー

### 1. 認可コードフロー（Authorization Code Flow）

これはWebアプリケーションで最も一般的なフローです。

```
ユーザー
  |
  | (1) アプリにログイン要求
  v
Next.jsアプリ（クライアント）
  |
  | (2) Googleの認可画面にリダイレクト
  v
Google認可サーバー
  |
  | (3) ユーザーがログイン＋権限承認
  | (4) 認可コード（code）を発行してコールバックURLにリダイレクト
  v
Next.jsアプリ
  |
  | (5) 認可コードをアクセストークンに交換（バックエンドで実行）
  v
Google認可サーバー
  |
  | (6) アクセストークン + リフレッシュトークンを返す
  v
Next.jsアプリ
  |
  | (7) アクセストークンを使ってYouTube APIを呼び出す
  v
YouTube API（リソースサーバー）
```

## 主要な概念

### アクセストークン（Access Token）
- リソース（YouTube API）にアクセスするための一時的な鍵
- 有効期限がある（通常1時間）
- ユーザーに代わってAPIリクエストを実行する際に使用

### リフレッシュトークン（Refresh Token）
- アクセストークンの有効期限が切れた時に、新しいアクセストークンを取得するための鍵
- 長期間有効（有効期限なし、または数ヶ月〜数年）
- セキュリティのため、サーバーサイドでのみ保管・使用

### スコープ（Scope）
- アプリが要求する権限の範囲
- 例: `https://www.googleapis.com/auth/youtube` = YouTube データへの読み書き権限

### 認可コード（Authorization Code）
- ユーザーが認可した後に発行される一時的なコード
- このコードをアクセストークンに交換する
- 一度しか使用できない（セキュリティのため）

## OAuth 2.0のセキュリティ上の重要ポイント

### なぜ認可コードフローが必要なのか？

直接アクセストークンを返さずに、認可コードを経由する理由：

1. **フロントエンドでトークンを露出させない**
   - ブラウザのURLやJavaScriptからトークンが漏れるリスクを防ぐ

2. **クライアントシークレットで検証**
   - 認可コードをトークンに交換する際、サーバー側でクライアントシークレットを使って検証
   - これによりアプリの正当性を確認

3. **リフレッシュトークンの安全な保管**
   - リフレッシュトークンはサーバーサイドでのみ扱う
   - ブラウザに直接渡されることはない

### PKCE（Proof Key for Code Exchange）

より高度なセキュリティ対策として、SPAやネイティブアプリで使われます：

1. クライアントがランダムな文字列（code_verifier）を生成
2. code_verifierをハッシュ化したもの（code_challenge）を認可リクエストに含める
3. トークン交換時に元のcode_verifierを送信して検証

## OAuth 2.0の主要なグラントタイプ

### 1. Authorization Code Grant（認可コードグラント）
- **用途**: Webアプリケーション（サーバーサイド）
- **特徴**: 最も安全、リフレッシュトークンが使える
- **このプロジェクトで使用**

### 2. Implicit Grant（インプリシットグラント）
- **用途**: SPA（Single Page Application）- 旧方式
- **特徴**: 認可コードなしで直接アクセストークンを取得
- **非推奨**: セキュリティ上の理由で現在は推奨されない

### 3. Resource Owner Password Credentials Grant
- **用途**: 自社の信頼できるアプリのみ
- **特徴**: ユーザー名とパスワードを直接使用
- **非推奨**: OAuth本来の目的に反する

### 4. Client Credentials Grant
- **用途**: マシン間通信（ユーザー不在）
- **特徴**: ユーザー認証なしでアプリ自体の認証のみ

## 実装上のベストプラクティス

### 1. state パラメータの使用
- CSRF攻撃を防ぐため、ランダムな文字列を生成して検証
- NextAuth.jsは自動的に処理

### 2. HTTPSの必須化
- トークンの盗聴を防ぐため、必ずHTTPSを使用
- Vercelは自動的にHTTPSを提供

### 3. トークンの安全な保管
- アクセストークンはメモリ内またはセキュアなCookieに保管
- リフレッシュトークンはサーバーサイドでのみ扱う
- LocalStorageには保管しない（XSS攻撃のリスク）

### 4. 最小権限の原則
- 必要最小限のスコープのみを要求
- 不要な権限は削除

### 5. トークンの有効期限管理
- アクセストークンの有効期限をチェック
- 期限切れ前にリフレッシュトークンで更新

## OAuth 2.0 vs OpenID Connect (OIDC)

- **OAuth 2.0**: 認可（Authorization）のためのフレームワーク
  - 「このアプリにYouTubeデータへのアクセスを許可する」

- **OpenID Connect**: OAuth 2.0をベースにした認証（Authentication）のプロトコル
  - 「このユーザーは誰か」を確認
  - IDトークン（JWT形式）を使用
  - このプロジェクトではNextAuth.jsがOIDCをサポート

## 参考リソース

- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [The OAuth 2.0 Authorization Framework](https://oauth.net/2/)
