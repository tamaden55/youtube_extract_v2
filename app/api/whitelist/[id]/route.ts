import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * ホワイトリストチャンネル削除API
 * DELETE /api/whitelist/[id]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        if (!id) {
            return NextResponse.json(
                { error: 'Channel ID is required' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('whitelist_channels')
            .delete()
            .eq('id', id)

        if (error) {
            throw new Error(`Failed to delete from whitelist: ${error.message}`)
        }

        return NextResponse.json({
            success: true,
            message: 'Channel removed from whitelist',
        })
    } catch (error) {
        console.error('Whitelist DELETE Error:', error)

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
