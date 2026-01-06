'use client'

import { useState, useEffect } from 'react'
import type { WhitelistChannel } from '@/types/youtube'

export default function WhitelistManager() {
    const [channels, setChannels] = useState<WhitelistChannel[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const [newChannel, setNewChannel] = useState({
        channel_id: '',
        channel_name: '',
        category: '',
    })

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

    const handleAddChannel = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccessMessage(null)

        if (!newChannel.channel_id || !newChannel.channel_name) {
            setError('チャンネルIDとチャンネル名は必須です')
            return
        }

        try {
            const response = await fetch('/api/whitelist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newChannel),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add channel')
            }

            setSuccessMessage('チャンネルをホワイトリストに追加しました')
            setNewChannel({ channel_id: '', channel_name: '', category: '' })
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
                <form onSubmit={handleAddChannel} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            チャンネルID *
                        </label>
                        <input
                            type="text"
                            value={newChannel.channel_id}
                            onChange={(e) => setNewChannel({ ...newChannel, channel_id: e.target.value })}
                            placeholder="UCxxxxxx"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            チャンネル名 *
                        </label>
                        <input
                            type="text"
                            value={newChannel.channel_name}
                            onChange={(e) => setNewChannel({ ...newChannel, channel_name: e.target.value })}
                            placeholder="チャンネル名"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            カテゴリ
                        </label>
                        <input
                            type="text"
                            value={newChannel.category}
                            onChange={(e) => setNewChannel({ ...newChannel, category: e.target.value })}
                            placeholder="例: 教育, エンタメ, 技術"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        追加
                    </button>
                </form>
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
