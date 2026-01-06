# REST API と生成AIのリアルタイム推論

このドキュメントでは、REST APIの基礎、生成AIのリアルタイム推論の仕組み、そしてAWS API Gatewayの活用について説明します。

## REST API の基礎

### REST（Representational State Transfer）とは

RESTは、Webサービスを設計するためのアーキテクチャスタイルです。

#### RESTの主要な原則

1. **クライアント・サーバーモデル**
   - クライアントとサーバーが独立して動作
   - 責任の分離（UI vs データ管理）

2. **ステートレス**
   - 各リクエストは独立している
   - サーバーはリクエスト間で状態を保持しない
   - すべての必要情報をリクエストに含める

3. **キャッシュ可能**
   - レスポンスにキャッシュ情報を含める
   - クライアント側でキャッシュして効率化

4. **統一インターフェース**
   - 一貫したURL設計
   - 標準的なHTTPメソッド使用

5. **階層化システム**
   - ロードバランサー、CDN、キャッシュサーバーなど
   - クライアントは最終的なサーバーを意識しない

### HTTPメソッド

RESTful APIで使用される主要なメソッド：

```
GET     - リソースの取得（読み取り専用）
POST    - リソースの作成
PUT     - リソースの完全な更新
PATCH   - リソースの部分的な更新
DELETE  - リソースの削除
```

### このプロジェクトのREST API例

#### YouTube 動画検索
```
GET /api/youtube/search?q=keyword&maxResults=50&days=7

レスポンス:
{
  "videos": [
    {
      "videoId": "abc123",
      "title": "Example Video",
      "channelTitle": "Channel Name",
      "publishedAt": "2024-01-01T00:00:00Z",
      "duration": 300
    }
  ]
}
```

#### ホワイトリスト取得
```
GET /api/whitelist

レスポンス:
{
  "success": true,
  "channels": [...],
  "count": 10
}
```

#### ホワイトリスト追加
```
POST /api/whitelist
Content-Type: application/json

{
  "channel_id": "UCxxxxx",
  "channel_name": "Example",
  "category": "tech"
}

レスポンス:
{
  "success": true,
  "channel": { ... }
}
```

## 生成AIのリアルタイム推論

### 生成AIの推論とは

**推論（Inference）**: 学習済みモデルに入力を与えて出力を生成するプロセス

```
入力（プロンプト） → モデル → 出力（生成テキスト）
```

### リアルタイム推論の仕組み

#### 1. 同期型リクエスト（Synchronous）

```
クライアント
  |
  | (1) リクエスト送信
  v
APIサーバー
  |
  | (2) モデルに推論依頼
  v
AIモデル
  |
  | (3) 推論実行（数秒〜数十秒）
  v
APIサーバー
  |
  | (4) レスポンス返却（待機中）
  v
クライアント（結果受信）
```

**特徴**:
- シンプルな実装
- タイムアウトリスクあり（長時間推論）
- サーバーリソースを占有

#### 2. ストリーミング型（Streaming）

```
クライアント
  |
  | (1) ストリーミングリクエスト
  v
APIサーバー
  |
  | (2) モデルに推論依頼
  v
AIモデル（トークン生成中）
  ↓ ↓ ↓
  | トークン1 → サーバー → クライアント（即座に表示）
  | トークン2 → サーバー → クライアント（即座に表示）
  | トークン3 → サーバー → クライアント（即座に表示）
  ↓
完了
```

**特徴**:
- ユーザー体験が向上（即座にフィードバック）
- チャットUIに最適
- Server-Sent Events（SSE）やWebSocketを使用

**実装例（OpenAI API）**:
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }],
    stream: true,  // ストリーミング有効化
  }),
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  // チャンクごとに処理（UIに表示など）
  console.log(chunk)
}
```

#### 3. 非同期型（Asynchronous）

```
クライアント
  |
  | (1) ジョブ投入リクエスト
  v
APIサーバー
  |
  | (2) ジョブIDを即座に返却
  v
クライアント（ジョブIDを保持）
  |
  | (3) 定期的にステータス確認（ポーリング）
  v
APIサーバー（バックグラウンドで推論実行中）
  |
  | (4) 完了したら結果を取得
  v
クライアント（結果受信）
```

**特徴**:
- 長時間推論に適している
- タイムアウトの心配なし
- ポーリング実装が必要

**実装例**:
```typescript
// (1) ジョブ投入
const jobResponse = await fetch('/api/ai/infer', {
  method: 'POST',
  body: JSON.stringify({ prompt: '...' })
})
const { jobId } = await jobResponse.json()

// (2) ポーリングでステータス確認
const pollInterval = setInterval(async () => {
  const statusResponse = await fetch(`/api/ai/status/${jobId}`)
  const { status, result } = await statusResponse.json()

  if (status === 'completed') {
    clearInterval(pollInterval)
    console.log('Result:', result)
  } else if (status === 'failed') {
    clearInterval(pollInterval)
    console.error('Job failed')
  }
}, 2000) // 2秒ごとに確認
```

### 生成AIのコスト最適化

#### 1. バッチ推論
複数のリクエストをまとめて処理：

```typescript
// 単一リクエスト（非効率）
for (const prompt of prompts) {
  await callAI(prompt)
}

// バッチリクエスト（効率的）
await callAIBatch(prompts)
```

#### 2. キャッシング
同じ入力に対する出力をキャッシュ：

```typescript
const cache = new Map<string, string>()

async function getCachedAIResponse(prompt: string) {
  if (cache.has(prompt)) {
    return cache.get(prompt)
  }

  const response = await callAI(prompt)
  cache.set(prompt, response)
  return response
}
```

#### 3. モデル選択
タスクに応じた適切なモデル選択：

```
簡単なタスク → 小型モデル（gpt-3.5-turbo）
複雑なタスク → 大型モデル（gpt-4）
```

## AWS API Gateway の活用

### API Gateway とは

AWS API Gatewayは、APIの作成、公開、管理、モニタリングを行うフルマネージドサービスです。

### 主要な機能

#### 1. REST API vs HTTP API vs WebSocket API

```
REST API:
- フル機能（認証、変換、キャッシュなど）
- 高コスト
- エンタープライズ向け

HTTP API:
- シンプル、高速、低コスト
- 基本機能のみ
- マイクロサービス向け（推奨）

WebSocket API:
- 双方向通信
- リアルタイムアプリケーション
- チャット、ゲーム向け
```

#### 2. Lambda統合

```
クライアント
  |
  | HTTPS リクエスト
  v
API Gateway
  |
  | イベントとしてLambdaを起動
  v
Lambda関数（サーバーレス）
  |
  | ビジネスロジック実行
  v
API Gateway
  |
  | レスポンス変換
  v
クライアント
```

**メリット**:
- サーバー管理不要
- 自動スケーリング
- 使った分だけ課金

### 生成AIリアルタイム推論での活用

#### パターン1: 同期型推論（Lambda）

```
API Gateway → Lambda → AI推論 → レスポンス
```

**構成**:
```typescript
// Lambda関数
export const handler = async (event) => {
  const { prompt } = JSON.parse(event.body)

  // AI推論実行（例: OpenAI API呼び出し）
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    })
  })

  const result = await response.json()

  return {
    statusCode: 200,
    body: JSON.stringify(result)
  }
}
```

**制約**:
- Lambdaタイムアウト: 最大15分
- API Gatewayタイムアウト: 最大30秒（REST API）、29秒（HTTP API）
- **長時間推論には不向き**

#### パターン2: 非同期型推論（SQS + Lambda）

```
API Gateway → Lambda（ジョブ投入）→ SQS → Lambda（推論実行）→ DynamoDB
                ↓（即座にジョブID返却）                               ↓
              クライアント ←（ポーリング）← API Gateway ← Lambda（ステータス取得）
```

**構成**:
```typescript
// (1) ジョブ投入Lambda
export const submitJob = async (event) => {
  const jobId = uuidv4()
  const { prompt } = JSON.parse(event.body)

  // SQSにメッセージ送信
  await sqs.sendMessage({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: JSON.stringify({ jobId, prompt })
  }).promise()

  return {
    statusCode: 202,
    body: JSON.stringify({ jobId })
  }
}

// (2) 推論実行Lambda（SQSトリガー）
export const processJob = async (event) => {
  for (const record of event.Records) {
    const { jobId, prompt } = JSON.parse(record.body)

    // AI推論実行
    const result = await callAI(prompt)

    // DynamoDBに結果保存
    await dynamodb.putItem({
      TableName: 'JobResults',
      Item: { jobId, status: 'completed', result }
    }).promise()
  }
}

// (3) ステータス確認Lambda
export const getJobStatus = async (event) => {
  const { jobId } = event.pathParameters

  const result = await dynamodb.getItem({
    TableName: 'JobResults',
    Key: { jobId }
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item)
  }
}
```

**メリット**:
- タイムアウトの心配なし
- スケーラビリティが高い
- 推論時間に関係なく安定

#### パターン3: WebSocket API（リアルタイム双方向通信）

```
クライアント
  |
  | WebSocket接続確立
  v
API Gateway（WebSocket）
  |
  | 接続ID保存
  v
Lambda（接続管理）
  |
  | メッセージ受信
  v
Lambda（推論実行）
  |
  | ストリーミング結果を送信
  v
API Gateway → クライアント（リアルタイム表示）
```

**用途**:
- チャットアプリケーション
- リアルタイムコラボレーション
- ゲーム

### AWS API Gateway のコスト

#### REST API（高機能）
```
リクエスト: $3.50 / 100万リクエスト
キャッシュ: $0.02 / 時間 / GB
データ転送: $0.09 / GB（最初の10TB）
```

#### HTTP API（低コスト・推奨）
```
リクエスト: $1.00 / 100万リクエスト
データ転送: $0.09 / GB
```

#### WebSocket API
```
接続分数: $0.25 / 100万分
メッセージ: $1.00 / 100万メッセージ
```

### 代替案: Vercel Serverless Functions

このプロジェクトではVercelを使用しているため、API Gatewayの代わりにVercel Serverless Functionsが利用可能：

```typescript
// pages/api/ai/infer.ts
export default async function handler(req, res) {
  const { prompt } = req.body

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    })
  })

  const result = await response.json()
  res.status(200).json(result)
}
```

**Vercelの特徴**:
- タイムアウト: 10秒（Hobby）、60秒（Pro）、900秒（Enterprise）
- 自動スケーリング
- GitHub連携で自動デプロイ
- **Next.js統合が容易**

### AWS API Gateway vs Vercel Serverless Functions

| 項目 | AWS API Gateway + Lambda | Vercel Serverless |
|------|-------------------------|-------------------|
| セットアップ | 複雑（IAM、VPC設定など） | 簡単（ゼロコンフィグ） |
| スケーリング | 高度な制御可能 | 自動（設定不要） |
| タイムアウト | 最大15分（Lambda） | 最大15分（Enterprise） |
| コスト | 従量課金（詳細） | プラン料金+従量課金 |
| Next.js統合 | 手動設定必要 | ネイティブサポート |
| 推奨用途 | エンタープライズ、複雑なワークフロー | Next.jsアプリ、スタートアップ |

## 生成AIリアルタイム推論のベストプラクティス

### 1. タイムアウト対策
```typescript
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 30000) // 30秒

try {
  const response = await fetch(url, {
    signal: controller.signal
  })
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timed out')
  }
} finally {
  clearTimeout(timeout)
}
```

### 2. リトライロジック
```typescript
async function callAIWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callAI(prompt)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000)) // 指数バックオフ
    }
  }
}
```

### 3. ユーザーフィードバック
```typescript
// ローディング状態の表示
const [loading, setLoading] = useState(false)

async function handleSubmit() {
  setLoading(true)
  try {
    const result = await callAI(prompt)
    // 結果表示
  } finally {
    setLoading(false)
  }
}
```

## まとめ

### REST API
- ステートレス、統一インターフェース
- HTTPメソッドでCRUD操作

### 生成AIリアルタイム推論
- **同期型**: シンプル、タイムアウトリスク
- **ストリーミング**: UX向上、チャット向け
- **非同期型**: 長時間推論、スケーラブル

### AWS API Gateway
- **活用可能**: Lambda、SQS、DynamoDBと組み合わせ
- **コスト**: HTTP API（$1/100万リクエスト）が低コスト
- **制約**: タイムアウト（30秒）に注意
- **代替案**: Vercel Serverless Functions（Next.js統合が容易）

## 参考リソース

- [RESTful API Design](https://restfulapi.net/)
- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [AWS Lambda Limits](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)
