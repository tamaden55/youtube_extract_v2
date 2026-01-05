// YouTube関連の型定義

/**
 * 動画情報
 * YouTube Data API v3 の検索結果から抽出した動画の基本情報
 */
export interface VideoInfo {
    videoId: string
    title: string
    channelId: string
    channelTitle: string
    publishedAt: string
    description: string
    thumbnailUrl: string
}

/**
 * 検索パラメータ
 * YouTube動画検索時のクエリパラメータ
 */
export interface SearchParams {
    q: string              // 検索キーワード
    maxResults?: number    // 最大結果数（デフォルト: 50, 最大: 50）
    days?: number          // 過去N日以内の動画を検索
}

/**
 * YouTube API 検索レスポンス
 * YouTube Data API v3 の search.list エンドポイントのレスポンス型
 */
export interface YouTubeSearchResponse {
    kind: string
    etag: string
    nextPageToken?: string
    prevPageToken?: string
    pageInfo: {
        totalResults: number
        resultsPerPage: number
    }
    items: Array<{
        kind: string
        etag: string
        id: {
            kind: string
            videoId: string
        }
        snippet: {
            publishedAt: string
            channelId: string
            title: string
            description: string
            thumbnails: {
                default: {
                    url: string
                    width: number
                    height: number
                }
                medium: {
                    url: string
                    width: number
                    height: number
                }
                high: {
                    url: string
                    width: number
                    height: number
                }
            }
            channelTitle: string
            liveBroadcastContent: string
            publishTime: string
        }
    }>
}

/**
 * API エラーレスポンス
 */
export interface YouTubeAPIError {
    error: {
        code: number
        message: string
        errors: Array<{
            message: string
            domain: string
            reason: string
        }>
    }
}
