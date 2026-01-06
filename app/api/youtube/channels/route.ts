import { NextRequest, NextResponse } from 'next/server'
import { getChannelStats } from '@/lib/youtube'

/**
 * YouTubeチャンネル統計情報取得API
 * GET /api/youtube/channels?channelIds=id1,id2,id3
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const channelIdsParam = searchParams.get('channelIds')

        // channelIdsは必須
        if (!channelIdsParam) {
            return NextResponse.json(
                { error: 'channelIds parameter is required' },
                { status: 400 }
            )
        }

        // カンマ区切りのチャンネルIDを配列に変換
        const channelIds = channelIdsParam.split(',').filter(id => id.trim() !== '')

        if (channelIds.length === 0) {
            return NextResponse.json(
                { error: 'At least one channel ID is required' },
                { status: 400 }
            )
        }

        // YouTube APIは最大50件まで
        if (channelIds.length > 50) {
            return NextResponse.json(
                { error: 'Maximum 50 channel IDs allowed per request' },
                { status: 400 }
            )
        }

        // チャンネル統計情報を取得
        const channelStats = await getChannelStats(channelIds)

        return NextResponse.json({
            success: true,
            count: channelStats.length,
            channels: channelStats,
        })
    } catch (error) {
        console.error('YouTube Channels API Error:', error)

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
