import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utilities';
import { toCamelCase } from '@/lib/utils/supabase-helpers';

export async function GET(request: Request) {
  try {
    await requireAuth(request);
    const supabase = createServerSupabaseClient(request);
    const { data, error } = await supabase
      .from('curations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.map(item => toCamelCase(item)) || []);
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
