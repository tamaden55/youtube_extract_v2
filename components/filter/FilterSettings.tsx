'use client'

import type { FilterMode } from '@/types/youtube'

interface FilterSettingsProps {
    currentMode: FilterMode
    onModeChange: (mode: FilterMode) => void
    excludeShorts: boolean
    onExcludeShortsChange: (exclude: boolean) => void
}

const FILTER_PRESETS = {
    none: {
        label: 'なし',
        description: 'フィルタリングしない',
        color: 'bg-gray-600',
    },
    whitelist: {
        label: 'ホワイトリスト',
        description: '登録済みチャンネルのみ',
        color: 'bg-green-600',
    },
    moderate: {
        label: '中程度',
        description: '登録者数 10,000人以上',
        color: 'bg-blue-600',
    },
    strict: {
        label: '厳格',
        description: '登録者数 100,000人以上',
        color: 'bg-purple-600',
    },
} as const

export default function FilterSettings({
    currentMode,
    onModeChange,
    excludeShorts,
    onExcludeShortsChange
}: FilterSettingsProps) {
    return (
        <div className="w-full max-w-2xl">
            <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-300">フィルター設定</h3>
            </div>
            <div className="flex gap-3 mb-4">
                {(Object.keys(FILTER_PRESETS) as FilterMode[]).map((mode) => {
                    const preset = FILTER_PRESETS[mode]
                    const isActive = currentMode === mode

                    return (
                        <button
                            key={mode}
                            onClick={() => onModeChange(mode)}
                            className={`
                                flex-1 px-4 py-3 rounded-lg border-2 transition-all
                                ${isActive
                                    ? `${preset.color} border-transparent text-white shadow-lg`
                                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                                }
                            `}
                        >
                            <div className="font-medium">{preset.label}</div>
                            <div className={`text-xs mt-1 ${isActive ? 'text-gray-100' : 'text-gray-400'}`}>
                                {preset.description}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* ショート動画除外チェックボックス */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg">
                <input
                    type="checkbox"
                    id="exclude-shorts"
                    checked={excludeShorts}
                    onChange={(e) => onExcludeShortsChange(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-500 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
                />
                <label
                    htmlFor="exclude-shorts"
                    className="text-gray-300 font-medium cursor-pointer flex-1"
                >
                    ショート動画を除外（60秒以下）
                </label>
            </div>
        </div>
    )
}
