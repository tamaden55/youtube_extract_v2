import type { VideoInfo } from '@/types/youtube'
import { getVideoUrl, getChannelUrl } from '@/lib/youtube'

interface VideoListProps {
    videos: VideoInfo[]
}

export default function VideoList({ videos }: VideoListProps) {
    if (videos.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                検索結果がありません
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl">
            <div className="mb-4 text-sm text-gray-300">
                {videos.length}件の動画が見つかりました
            </div>
            <div className="grid gap-4">
                {videos.map((video) => (
                    <VideoCard key={video.videoId} video={video} />
                ))}
            </div>
        </div>
    )
}

function VideoCard({ video }: { video: VideoInfo }) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-shadow">
            <div className="flex gap-4 p-4">
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
