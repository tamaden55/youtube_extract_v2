import type { VideoInfo, SearchParams, YouTubeSearchResponse, YouTubeAPIError, ChannelStats } from '@/types/youtube'

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

/**
 * YouTube動画検索
 * @param params 検索パラメータ
 * @returns VideoInfo配列
 */
export async function searchVideos(params: SearchParams): Promise<VideoInfo[]> {
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY is not set in environment variables')
    }

    // クエリパラメータの構築
    const queryParams = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        q: params.q,
        maxResults: (params.maxResults || 50).toString(),
        key: apiKey,
        order: 'date', // 日付順でソート
    })

    // 日付フィルタの設定（過去N日以内）
    if (params.days) {
        const publishedAfter = new Date()
        publishedAfter.setDate(publishedAfter.getDate() - params.days)
        queryParams.append('publishedAfter', publishedAfter.toISOString())
    }

    const url = `${YOUTUBE_API_BASE_URL}/search?${queryParams.toString()}`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            const errorData: YouTubeAPIError = await response.json()
            throw new Error(
                `YouTube API Error: ${errorData.error.message} (Code: ${errorData.error.code})`
            )
        }

        const data: YouTubeSearchResponse = await response.json()

        // レスポンスをVideoInfo型に変換
        const videos: VideoInfo[] = data.items.map((item) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        }))

        return videos
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('Unknown error occurred while searching videos')
    }
}

/**
 * YouTube動画のURLを生成
 * @param videoId 動画ID
 * @returns YouTube動画URL
 */
export function getVideoUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`
}

/**
 * YouTubeチャンネルのURLを生成
 * @param channelId チャンネルID
 * @returns YouTubeチャンネルURL
 */
export function getChannelUrl(channelId: string): string {
    return `https://www.youtube.com/channel/${channelId}`
}

/**
 * YouTube Data API v3 Channels レスポンス型
 */
interface YouTubeChannelsResponse {
    kind: string
    etag: string
    pageInfo: {
        totalResults: number
        resultsPerPage: number
    }
    items: Array<{
        kind: string
        etag: string
        id: string
        statistics: {
            viewCount: string
            subscriberCount: string
            hiddenSubscriberCount: boolean
            videoCount: string
        }
    }>
}

/**
 * チャンネルルックアップ結果
 */
export interface ChannelLookupResult {
    channelId: string
    channelName: string
    subscriberCount: number
}

/**
 * YouTube Data API v3 Channels レスポンス型（詳細版）
 */
interface YouTubeChannelsDetailResponse {
    kind: string
    etag: string
    pageInfo: {
        totalResults: number
        resultsPerPage: number
    }
    items: Array<{
        kind: string
        etag: string
        id: string
        snippet: {
            title: string
            description: string
            customUrl?: string
        }
        statistics: {
            viewCount: string
            subscriberCount: string
            hiddenSubscriberCount: boolean
            videoCount: string
        }
    }>
}

/**
 * チャンネルURL/ハンドル名/IDからチャンネル情報を取得
 * @param input チャンネルURL、ハンドル名（@username）、またはチャンネルID（UCxxx）
 * @returns チャンネル情報
 */
export async function lookupChannel(input: string): Promise<ChannelLookupResult> {
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY is not set in environment variables')
    }

    // 入力をパース
    let channelId: string | null = null
    let handle: string | null = null
    let username: string | null = null

    // URLの場合はパース
    if (input.includes('youtube.com') || input.includes('youtu.be')) {
        const url = new URL(input.startsWith('http') ? input : `https://${input}`)

        // チャンネルIDの形式: /channel/UCxxx
        const channelMatch = url.pathname.match(/\/channel\/([^\/]+)/)
        if (channelMatch) {
            channelId = channelMatch[1]
        }

        // ハンドル名の形式: /@username
        const handleMatch = url.pathname.match(/\/@([^\/]+)/)
        if (handleMatch) {
            handle = handleMatch[1]
        }

        // カスタムURL（古い形式）: /c/username または /user/username
        const customMatch = url.pathname.match(/\/(c|user)\/([^\/]+)/)
        if (customMatch) {
            username = customMatch[2]
        }
    } else if (input.startsWith('@')) {
        // @username形式
        handle = input.substring(1)
    } else if (input.startsWith('UC') && input.length === 24) {
        // チャンネルID形式
        channelId = input
    } else {
        // それ以外はハンドル名として扱う
        handle = input.startsWith('@') ? input.substring(1) : input
    }

    let queryParams: URLSearchParams

    if (channelId) {
        // チャンネルIDで検索
        queryParams = new URLSearchParams({
            part: 'snippet,statistics',
            id: channelId,
            key: apiKey,
        })
    } else if (handle) {
        // ハンドル名で検索
        queryParams = new URLSearchParams({
            part: 'snippet,statistics',
            forHandle: handle,
            key: apiKey,
        })
    } else if (username) {
        // カスタムURL名で検索（forUsername廃止されたため、forHandleを試す）
        queryParams = new URLSearchParams({
            part: 'snippet,statistics',
            forHandle: username,
            key: apiKey,
        })
    } else {
        throw new Error('Invalid channel input format')
    }

    const url = `${YOUTUBE_API_BASE_URL}/channels?${queryParams.toString()}`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            const errorData: YouTubeAPIError = await response.json()
            throw new Error(
                `YouTube API Error: ${errorData.error.message} (Code: ${errorData.error.code})`
            )
        }

        const data: YouTubeChannelsDetailResponse = await response.json()

        if (data.items.length === 0) {
            throw new Error('Channel not found')
        }

        const channel = data.items[0]

        return {
            channelId: channel.id,
            channelName: channel.snippet.title,
            subscriberCount: parseInt(channel.statistics.subscriberCount, 10),
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('Unknown error occurred while looking up channel')
    }
}

/**
 * チャンネル統計情報を取得
 * @param channelIds チャンネルIDの配列
 * @returns ChannelStats配列
 */
export async function getChannelStats(channelIds: string[]): Promise<ChannelStats[]> {
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY is not set in environment variables')
    }

    if (channelIds.length === 0) {
        return []
    }

    // YouTube API は最大50件まで一度に取得可能
    const queryParams = new URLSearchParams({
        part: 'statistics',
        id: channelIds.join(','),
        key: apiKey,
    })

    const url = `${YOUTUBE_API_BASE_URL}/channels?${queryParams.toString()}`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            const errorData: YouTubeAPIError = await response.json()
            throw new Error(
                `YouTube API Error: ${errorData.error.message} (Code: ${errorData.error.code})`
            )
        }

        const data: YouTubeChannelsResponse = await response.json()

        // レスポンスをChannelStats型に変換
        const channelStats: ChannelStats[] = data.items.map((item) => ({
            channelId: item.id,
            subscriberCount: parseInt(item.statistics.subscriberCount, 10),
            videoCount: parseInt(item.statistics.videoCount, 10),
        }))

        return channelStats
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('Unknown error occurred while fetching channel statistics')
    }
}
