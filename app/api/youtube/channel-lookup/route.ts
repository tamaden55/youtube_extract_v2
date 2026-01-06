import { NextRequest, NextResponse } from 'next/server'
import { lookupChannel } from '@/lib/youtube'

/**
 * チャンネルルックアップAPI
 * GET /api/youtube/channel-lookup?input=@username
 *
 * チャンネルURL、ハンドル名、またはチャンネルIDから
 * チャンネル情報を自動的に取得します
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const input = searchParams.get('input')

        if (!input) {
            return NextResponse.json(
                { error: 'Input parameter is required' },
                { status: 400 }
            )
        }

        // チャンネル情報を取得
        const channelInfo = await lookupChannel(input.trim())

        return NextResponse.json({
            success: true,
            ...channelInfo,
        })
    } catch (error) {
        console.error('Channel Lookup Error:', error)

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
