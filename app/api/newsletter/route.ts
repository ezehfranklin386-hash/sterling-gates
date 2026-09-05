import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utilities';
import { CreateNewsletterSchema } from '@/lib/validation/schemas';
import { toCamelCase, toSnakeCase } from '@/lib/utils/supabase-helpers';

/**
 * POST /api/newsletter
 * - Public endpoint for newsletter subscription
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = CreateNewsletterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.errors }, { status: 400 });
    }

    const supabase = createServerSupabaseClient(request);
    const { data, error } = await supabase
      .from('newsletter')
      .insert(toSnakeCase(result.data))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(toCamelCase(data), { status: 201 });
  } catch (error) {
    console.error('Newsletter POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/newsletter
 * - Requires authentication
 * - Returns list of subscribers
 */
export async function GET(request: Request) {
  try {
    await requireAuth(request);
    const supabase = createServerSupabaseClient(request);
    const { data, error } = await supabase
      .from('newsletter')
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
