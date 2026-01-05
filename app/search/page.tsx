'use client'

import { useState } from 'react'
import SearchForm from '@/components/search/SearchForm'
import VideoList from '@/components/search/VideoList'
import type { VideoInfo } from '@/types/youtube'

export default function SearchPage() {
    const [videos, setVideos] = useState<VideoInfo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSearch = async (query: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                q: query,
                maxResults: '50',
            })

            const response = await fetch(`/api/youtube/search?${params.toString()}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'An error occurred')
            }

            setVideos(data.videos)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
            setVideos([])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* ヘッダー */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        YouTube Extract v2
                    </h1>
                    <p className="text-gray-300">
                        YouTubeの動画を検索してプレイリストを作成
                    </p>
                </div>

                {/* 検索フォーム */}
                <div className="flex justify-center mb-8">
                    <SearchForm onSearch={handleSearch} isLoading={isLoading} />
                </div>

                {/* エラー表示 */}
                {error && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                        <p className="text-red-200">
                            <span className="font-semibold">エラー: </span>
                            {error}
                        </p>
                    </div>
                )}

                {/* ローディング表示 */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                        <p className="mt-4 text-gray-300">検索中...</p>
                    </div>
                )}

                {/* 検索結果 */}
                {!isLoading && videos.length > 0 && (
                    <div className="flex justify-center">
                        <VideoList videos={videos} />
                    </div>
                )}

                {/* 初期状態のメッセージ */}
                {!isLoading && !error && videos.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        キーワードを入力して動画を検索してください
                    </div>
                )}
            </div>
        </div>
    )
}
