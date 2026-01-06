'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import SearchForm from '@/components/search/SearchForm'
import FilterSettings from '@/components/filter/FilterSettings'
import VideoSelection from '@/components/playlist/VideoSelection'
import type { VideoInfo, ChannelStats, FilterMode } from '@/types/youtube'
import { filterVideos, extractUniqueChannelIds } from '@/lib/filter'

export default function SearchPage() {
    const { data: session } = useSession()
    const [videos, setVideos] = useState<VideoInfo[]>([])
    const [filteredVideos, setFilteredVideos] = useState<VideoInfo[]>([])
    const [channelStats, setChannelStats] = useState<ChannelStats[]>([])
    const [whitelistChannelIds, setWhitelistChannelIds] = useState<string[]>([])
    const [filterMode, setFilterMode] = useState<FilterMode>('none')
    const [isLoading, setIsLoading] = useState(false)
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // ホワイトリストを取得
    useEffect(() => {
        const fetchWhitelist = async () => {
            try {
                const response = await fetch('/api/whitelist')
                const data = await response.json()
                if (response.ok && data.channels) {
                    const channelIds = data.channels.map((ch: any) => ch.channel_id)
                    setWhitelistChannelIds(channelIds)
                }
            } catch (err) {
                console.error('Failed to fetch whitelist:', err)
            }
        }
        fetchWhitelist()
    }, [])

    const handleSearch = async (query: string) => {
        setIsLoading(true)
        setError(null)

        try {
            // 動画検索
            const searchParams = new URLSearchParams({
                q: query,
                maxResults: '50',
            })

            const searchResponse = await fetch(`/api/youtube/search?${searchParams.toString()}`)
            const searchData = await searchResponse.json()

            if (!searchResponse.ok) {
                throw new Error(searchData.error || 'An error occurred')
            }

            const searchedVideos: VideoInfo[] = searchData.videos
            setVideos(searchedVideos)

            // チャンネル統計情報を取得
            const channelIds = extractUniqueChannelIds(searchedVideos)

            if (channelIds.length > 0) {
                const channelParams = new URLSearchParams({
                    channelIds: channelIds.join(','),
                })

                const channelResponse = await fetch(`/api/youtube/channels?${channelParams.toString()}`)
                const channelData = await channelResponse.json()

                if (channelResponse.ok) {
                    setChannelStats(channelData.channels)
                } else {
                    console.error('Failed to fetch channel stats:', channelData.error)
                    setChannelStats([])
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
            setVideos([])
            setChannelStats([])
        } finally {
            setIsLoading(false)
        }
    }

    // フィルターモードが変更されたら再フィルタリング
    useEffect(() => {
        const filtered = filterVideos(videos, channelStats, filterMode, whitelistChannelIds)
        setFilteredVideos(filtered)
    }, [videos, channelStats, filterMode, whitelistChannelIds])

    // プレイリスト作成ハンドラー
    const handleCreatePlaylist = async (selectedVideos: VideoInfo[]) => {
        setIsCreatingPlaylist(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const response = await fetch('/api/youtube/playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `Playlist - ${new Date().toLocaleDateString('ja-JP')}`,
                    description: `Created by YouTube Extract v2`,
                    videoIds: selectedVideos.map(v => v.videoId),
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create playlist')
            }

            setSuccessMessage(
                `プレイリストを作成しました！ ${data.videosAdded}/${data.totalVideos} 件の動画を追加しました。`
            )

            // プレイリストURLを新しいタブで開く
            if (data.playlistUrl) {
                window.open(data.playlistUrl, '_blank')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'プレイリストの作成に失敗しました')
        } finally {
            setIsCreatingPlaylist(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* ヘッダー */}
                <div className="text-center mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <Link
                            href="/whitelist"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            ホワイトリスト管理
                        </Link>
                        <div className="flex items-center gap-4">
                            {session ? (
                                <>
                                    <span className="text-sm text-gray-300">
                                        {session.user?.email}
                                    </span>
                                    <button
                                        onClick={() => signOut()}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        ログアウト
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => signIn('google')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Googleでログイン
                                </button>
                            )}
                        </div>
                    </div>
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

                {/* フィルター設定 */}
                {videos.length > 0 && (
                    <div className="flex justify-center mb-8">
                        <FilterSettings currentMode={filterMode} onModeChange={setFilterMode} />
                    </div>
                )}

                {/* 成功メッセージ */}
                {successMessage && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                        <p className="text-green-200">
                            <span className="font-semibold">成功: </span>
                            {successMessage}
                        </p>
                    </div>
                )}

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
                    <>
                        <div className="max-w-4xl mx-auto mb-4">
                            <p className="text-gray-400 text-sm">
                                {filteredVideos.length} / {videos.length} 件の動画を表示中
                                {filterMode !== 'none' && ` (${filterMode}フィルター適用中)`}
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <VideoSelection
                                videos={filteredVideos}
                                onCreatePlaylist={handleCreatePlaylist}
                                isCreatingPlaylist={isCreatingPlaylist}
                            />
                        </div>
                    </>
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
