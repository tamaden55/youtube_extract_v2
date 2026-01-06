import type { VideoInfo, ChannelStats, FilterMode, FilterPreset } from '@/types/youtube'

/**
 * フィルタープリセット定義
 */
export const FILTER_PRESETS: Record<FilterMode, FilterPreset> = {
    none: {
        mode: 'none',
    },
    moderate: {
        mode: 'moderate',
        minSubscribers: 10000,
        minVideoCount: 10,
    },
    strict: {
        mode: 'strict',
        minSubscribers: 100000,
        minVideoCount: 50,
    },
}

/**
 * 動画をフィルタリング
 * @param videos 動画リスト
 * @param channelStats チャンネル統計情報
 * @param filterMode フィルターモード
 * @returns フィルタリングされた動画リスト
 */
export function filterVideos(
    videos: VideoInfo[],
    channelStats: ChannelStats[],
    filterMode: FilterMode
): VideoInfo[] {
    // フィルターなしの場合はそのまま返す
    if (filterMode === 'none') {
        return videos
    }

    const preset = FILTER_PRESETS[filterMode]

    // チャンネルIDをキーとしたマップを作成
    const statsMap = new Map<string, ChannelStats>()
    channelStats.forEach(stats => {
        statsMap.set(stats.channelId, stats)
    })

    // フィルタリング条件に基づいて動画をフィルタリング
    return videos.filter(video => {
        const stats = statsMap.get(video.channelId)

        // 統計情報が取得できない場合は除外
        if (!stats) {
            return false
        }

        // 登録者数チェック
        if (preset.minSubscribers && stats.subscriberCount < preset.minSubscribers) {
            return false
        }

        // 動画数チェック
        if (preset.minVideoCount && stats.videoCount < preset.minVideoCount) {
            return false
        }

        // キーワード除外チェック
        if (preset.excludeKeywords && preset.excludeKeywords.length > 0) {
            const titleLower = video.title.toLowerCase()
            const descriptionLower = video.description.toLowerCase()

            for (const keyword of preset.excludeKeywords) {
                const keywordLower = keyword.toLowerCase()
                if (titleLower.includes(keywordLower) || descriptionLower.includes(keywordLower)) {
                    return false
                }
            }
        }

        return true
    })
}

/**
 * 動画リストからユニークなチャンネルIDを抽出
 * @param videos 動画リスト
 * @returns チャンネルIDの配列
 */
export function extractUniqueChannelIds(videos: VideoInfo[]): string[] {
    const channelIds = videos.map(video => video.channelId)
    return Array.from(new Set(channelIds))
}
