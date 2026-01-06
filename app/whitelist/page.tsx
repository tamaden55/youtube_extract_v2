'use client'

import Link from 'next/link'
import WhitelistManager from '@/components/whitelist/WhitelistManager'

export default function WhitelistPage() {
    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* ヘッダー */}
                <div className="mb-8">
                    <Link
                        href="/search"
                        className="inline-block mb-4 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        ← 検索ページに戻る
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        ホワイトリスト管理
                    </h1>
                    <p className="text-gray-300">
                        信頼できるチャンネルを管理します
                    </p>
                </div>

                {/* ホワイトリスト管理 */}
                <WhitelistManager />
            </div>
        </div>
    )
}
