import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/utils/supabase-helpers';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const supabase = createServerSupabaseClient(request);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json(toCamelCase(data));
  } catch (error) {
    console.error('Properties GET by slug error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
