import { NextRequest, NextResponse } from 'next/server'
import { searchVideos } from '@/lib/youtube'
import type { SearchParams } from '@/types/youtube'

/**
 * YouTube動画検索API
 * GET /api/youtube/search?q=keyword&maxResults=50&days=7
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const q = searchParams.get('q')

        // 検索キーワードは必須
        if (!q) {
            return NextResponse.json(
                { error: 'Search query (q) is required' },
                { status: 400 }
            )
        }

        // クエリパラメータの構築
        const params: SearchParams = {
            q,
            maxResults: searchParams.get('maxResults')
                ? parseInt(searchParams.get('maxResults')!)
                : 50,
            days: searchParams.get('days')
                ? parseInt(searchParams.get('days')!)
                : undefined,
        }

        // バリデーション
        if (params.maxResults && (params.maxResults < 1 || params.maxResults > 50)) {
            return NextResponse.json(
                { error: 'maxResults must be between 1 and 50' },
                { status: 400 }
            )
        }

        if (params.days && params.days < 1) {
            return NextResponse.json(
                { error: 'days must be greater than 0' },
                { status: 400 }
            )
        }

        // YouTube動画検索を実行
        const videos = await searchVideos(params)

        return NextResponse.json({
            success: true,
            count: videos.length,
            videos,
        })
    } catch (error) {
        console.error('YouTube API Error:', error)

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
