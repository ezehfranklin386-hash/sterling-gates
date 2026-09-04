import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utilities';

/**
 * DELETE /api/newsletter/[id]
 * - Requires authentication
 * - Deletes a newsletter subscriber by ID
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth(request);

    const supabase = createServerSupabaseClient(request);

    const { error } = await supabase
      .from('newsletter')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Newsletter DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
