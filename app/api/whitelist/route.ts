import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { WhitelistChannel } from '@/types/youtube'

/**
 * ホワイトリストチャンネル取得API
 * GET /api/whitelist?category=xxx
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')

        let query = supabase
            .from('whitelist_channels')
            .select('*')
            .order('created_at', { ascending: false })

        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query

        if (error) {
            throw new Error(`Failed to fetch whitelist: ${error.message}`)
        }

        return NextResponse.json({
            success: true,
            channels: data as WhitelistChannel[],
            count: data?.length || 0,
        })
    } catch (error) {
        console.error('Whitelist GET Error:', error)

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

/**
 * ホワイトリストチャンネル追加API
 * POST /api/whitelist
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { channel_id, channel_name, category, subscriber_count } = body

        if (!channel_id || !channel_name) {
            return NextResponse.json(
                { error: 'channel_id and channel_name are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('whitelist_channels')
            .insert([
                {
                    channel_id,
                    channel_name,
                    category: category || null,
                    subscriber_count: subscriber_count || null,
                }
            ])
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'This channel is already in the whitelist' },
                    { status: 409 }
                )
            }
            throw new Error(`Failed to add to whitelist: ${error.message}`)
        }

        return NextResponse.json({
            success: true,
            channel: data as WhitelistChannel,
        })
    } catch (error) {
        console.error('Whitelist POST Error:', error)

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
