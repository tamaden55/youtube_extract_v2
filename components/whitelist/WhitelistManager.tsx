'use client'

import { useState, useEffect } from 'react'
import type { WhitelistChannel } from '@/types/youtube'

export default function WhitelistManager() {
    const [channels, setChannels] = useState<WhitelistChannel[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const [channelInput, setChannelInput] = useState('')
    const [isLookingUp, setIsLookingUp] = useState(false)
    const [lookedUpChannel, setLookedUpChannel] = useState<{
        channel_id: string
        channel_name: string
        subscriber_count: number
    } | null>(null)
    const [category, setCategory] = useState('')

    useEffect(() => {
        fetchWhitelist()
    }, [])

    const fetchWhitelist = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/whitelist')
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch whitelist')
            }

            setChannels(data.channels)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleLookupChannel = async () => {
        setIsLookingUp(true)
        setError(null)
        setLookedUpChannel(null)

        if (!channelInput.trim()) {
            setError('チャンネルURL、ハンドル名、またはチャンネルIDを入力してください')
            setIsLookingUp(false)
            return
        }

        try {
            const response = await fetch(
                `/api/youtube/channel-lookup?input=${encodeURIComponent(channelInput.trim())}`
            )
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to lookup channel')
            }

            setLookedUpChannel({
                channel_id: data.channelId,
                channel_name: data.channelName,
                subscriber_count: data.subscriberCount,
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'チャンネルの検索に失敗しました')
        } finally {
            setIsLookingUp(false)
        }
    }

    const handleAddChannel = async () => {
        setError(null)
        setSuccessMessage(null)

        if (!lookedUpChannel) {
            setError('まずチャンネルを検索してください')
            return
        }

        try {
            const response = await fetch('/api/whitelist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel_id: lookedUpChannel.channel_id,
                    channel_name: lookedUpChannel.channel_name,
                    category: category || null,
                    subscriber_count: lookedUpChannel.subscriber_count,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add channel')
            }

            setSuccessMessage('チャンネルをホワイトリストに追加しました')
            setChannelInput('')
            setLookedUpChannel(null)
            setCategory('')
            fetchWhitelist()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        }
    }

    const handleRemoveChannel = async (id: string) => {
        if (!confirm('このチャンネルをホワイトリストから削除しますか？')) {
            return
        }

        try {
            const response = await fetch(`/api/whitelist/${id}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove channel')
            }

            setSuccessMessage('チャンネルをホワイトリストから削除しました')
            fetchWhitelist()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">ホワイトリスト管理</h2>

            {/* 成功メッセージ */}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                    <p className="text-green-200">{successMessage}</p>
                </div>
            )}

            {/* エラー表示 */}
            {error && (
                <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-200">{error}</p>
                </div>
            )}

            {/* チャンネル追加フォーム */}
            <div className="mb-8 p-6 bg-gray-800 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">チャンネルを追加</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            チャンネルURL / ハンドル名 / チャンネルID *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={channelInput}
                                onChange={(e) => setChannelInput(e.target.value)}
                                placeholder="@tbsnewsdig または https://www.youtube.com/@tbsnewsdig"
                                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={handleLookupChannel}
                                disabled={isLookingUp}
                                className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isLookingUp ? '検索中...' : '検索'}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            例: @tbsnewsdig, UCxxxxxx, https://www.youtube.com/@tbsnewsdig
                        </p>
                    </div>

                    {/* 検索結果表示 */}
                    {lookedUpChannel && (
                        <div className="p-4 bg-gray-900/50 border border-gray-600 rounded-lg">
                            <h4 className="text-sm font-semibold text-white mb-2">検索結果</h4>
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-300">
                                    <span className="font-medium">チャンネル名:</span> {lookedUpChannel.channel_name}
                                </p>
                                <p className="text-gray-300">
                                    <span className="font-medium">チャンネルID:</span> {lookedUpChannel.channel_id}
                                </p>
                                <p className="text-gray-300">
                                    <span className="font-medium">登録者数:</span>{' '}
                                    {lookedUpChannel.subscriber_count.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* カテゴリ入力 */}
                    {lookedUpChannel && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                カテゴリ（任意）
                            </label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="例: 教育, エンタメ, 技術"
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    )}

                    {/* 追加ボタン */}
                    {lookedUpChannel && (
                        <button
                            onClick={handleAddChannel}
                            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            ホワイトリストに追加
                        </button>
                    )}
                </div>
            </div>

            {/* ホワイトリスト一覧 */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">
                        登録チャンネル ({channels.length})
                    </h3>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">
                        読み込み中...
                    </div>
                ) : channels.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        ホワイトリストにチャンネルが登録されていません
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {channels.map((channel) => (
                            <div key={channel.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50">
                                <div className="flex-1">
                                    <h4 className="text-white font-medium">{channel.channel_name}</h4>
                                    <p className="text-sm text-gray-400">ID: {channel.channel_id}</p>
                                    {channel.category && (
                                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-900/50 text-blue-300 rounded">
                                            {channel.category}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleRemoveChannel(channel.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                >
                                    削除
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
