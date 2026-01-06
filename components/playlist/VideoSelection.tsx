'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import type { VideoInfo } from '@/types/youtube'
import { getVideoUrl, getChannelUrl } from '@/lib/youtube'

interface VideoSelectionProps {
    videos: VideoInfo[]
    onCreatePlaylist: (selectedVideos: VideoInfo[]) => void
    isCreatingPlaylist: boolean
}

export default function VideoSelection({
    videos,
    onCreatePlaylist,
    isCreatingPlaylist
}: VideoSelectionProps) {
    const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set())
    const { data: session } = useSession()

    const handleToggleVideo = (videoId: string) => {
        const newSelected = new Set(selectedVideoIds)
        if (newSelected.has(videoId)) {
            newSelected.delete(videoId)
        } else {
            newSelected.add(videoId)
        }
        setSelectedVideoIds(newSelected)
    }

    const handleSelectAll = () => {
        if (selectedVideoIds.size === videos.length) {
            setSelectedVideoIds(new Set())
        } else {
            setSelectedVideoIds(new Set(videos.map(v => v.videoId)))
        }
    }

    const handleCreatePlaylist = () => {
        const selectedVideos = videos.filter(v => selectedVideoIds.has(v.videoId))
        onCreatePlaylist(selectedVideos)
    }

    if (videos.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                検索結果がありません
            </div>
        )
    }

    const selectedCount = selectedVideoIds.size

    return (
        <div className="w-full max-w-4xl">
            {/* 選択コントロール */}
            <div className="mb-4 flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSelectAll}
                        className="text-sm text-blue-400 hover:text-blue-300"
                    >
                        {selectedCount === videos.length ? '全て解除' : '全て選択'}
                    </button>
                    <span className="text-sm text-gray-300">
                        {selectedCount} / {videos.length} 件選択中
                    </span>
                </div>

                {session ? (
                    <button
                        onClick={handleCreatePlaylist}
                        disabled={selectedCount === 0 || isCreatingPlaylist}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {isCreatingPlaylist ? 'プレイリスト作成中...' : 'プレイリスト作成'}
                    </button>
                ) : (
                    <span className="text-sm text-gray-400">
                        プレイリストを作成するにはログインしてください
                    </span>
                )}
            </div>

            {/* 動画リスト */}
            <div className="grid gap-4">
                {videos.map((video) => (
                    <VideoCard
                        key={video.videoId}
                        video={video}
                        isSelected={selectedVideoIds.has(video.videoId)}
                        onToggle={() => handleToggleVideo(video.videoId)}
                    />
                ))}
            </div>
        </div>
    )
}

interface VideoCardProps {
    video: VideoInfo
    isSelected: boolean
    onToggle: () => void
}

function VideoCard({ video, isSelected, onToggle }: VideoCardProps) {
    return (
        <div className={`
            bg-gray-800 border rounded-lg overflow-hidden transition-all
            ${isSelected
                ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                : 'border-gray-700 hover:shadow-lg hover:shadow-blue-500/10'
            }
        `}>
            <div className="flex gap-4 p-4">
                {/* チェックボックス */}
                <div className="flex-shrink-0 flex items-start pt-2">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggle}
                        className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                    />
                </div>

                {/* サムネイル */}
                <a
                    href={getVideoUrl(video.videoId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                >
                    <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-48 h-36 object-cover rounded"
                    />
                </a>

                {/* 動画情報 */}
                <div className="flex-1 min-w-0">
                    <a
                        href={getVideoUrl(video.videoId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                    >
                        <h3 className="text-lg font-semibold text-white hover:text-blue-400 line-clamp-2 mb-2">
                            {video.title}
                        </h3>
                    </a>

                    <a
                        href={getChannelUrl(video.channelId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 hover:text-white mb-2 block"
                    >
                        {video.channelTitle}
                    </a>

                    <p className="text-sm text-gray-400 mb-2">
                        {new Date(video.publishedAt).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>

                    <p className="text-sm text-gray-300 line-clamp-2">
                        {video.description}
                    </p>
                </div>
            </div>
        </div>
    )
}
