import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

interface CreatePlaylistRequest {
    title: string
    description?: string
    videoIds: string[]
}

/**
 * YouTubeプレイリスト作成API
 * POST /api/youtube/playlist
 */
export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const session = await getServerSession(authOptions)

        if (!session || !session.accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in with Google.' },
                { status: 401 }
            )
        }

        const body: CreatePlaylistRequest = await request.json()
        const { title, description = '', videoIds } = body

        // バリデーション
        if (!title || !title.trim()) {
            return NextResponse.json(
                { error: 'Playlist title is required' },
                { status: 400 }
            )
        }

        if (!videoIds || videoIds.length === 0) {
            return NextResponse.json(
                { error: 'At least one video is required' },
                { status: 400 }
            )
        }

        // 1. プレイリストを作成
        const playlistResponse = await fetch(
            `${YOUTUBE_API_BASE_URL}/playlists?part=snippet,status`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    snippet: {
                        title,
                        description,
                    },
                    status: {
                        privacyStatus: 'private', // デフォルトは非公開
                    },
                }),
            }
        )

        if (!playlistResponse.ok) {
            const errorData = await playlistResponse.json()
            throw new Error(
                `Failed to create playlist: ${errorData.error?.message || 'Unknown error'}`
            )
        }

        const playlistData = await playlistResponse.json()
        const playlistId = playlistData.id

        // 2. 動画をプレイリストに追加（順番に1つずつ）
        const results = []
        for (const videoId of videoIds) {
            try {
                const response = await fetch(
                    `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${session.accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            snippet: {
                                playlistId,
                                resourceId: {
                                    kind: 'youtube#video',
                                    videoId,
                                },
                            },
                        }),
                    }
                )

                if (!response.ok) {
                    const errorData = await response.json()
                    console.error(`Failed to add video ${videoId}:`, errorData)
                    results.push({ videoId, success: false, error: errorData })
                } else {
                    results.push({ videoId, success: true })
                }
            } catch (error) {
                console.error(`Error adding video ${videoId}:`, error)
                results.push({ videoId, success: false, error })
            }
        }

        const successCount = results.filter(r => r.success).length

        return NextResponse.json({
            success: true,
            playlistId,
            playlistUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
            title,
            videosAdded: successCount,
            totalVideos: videoIds.length,
            results,
        })
    } catch (error) {
        console.error('YouTube Playlist API Error:', error)

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
