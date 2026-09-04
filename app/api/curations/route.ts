import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utilities';
import { CreateCurationSchema } from '@/lib/validation/schemas';
import { toCamelCase, toSnakeCase } from '@/lib/utils/supabase-helpers';

/**
 * GET /api/curations
 * - Public endpoint returning published curations
 */
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient(request);

    const { data, error } = await supabase
      .from('curations')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const transformedData = data?.map(item => toCamelCase(item)) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Curations GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/curations
 * - Requires authentication
 * - Creates a new curation
 */
export async function POST(request: Request) {
  try {
    await requireAuth(request);

    const body = await request.json();

    const result = CreateCurationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient(request);
    const snakeBody = toSnakeCase(result.data);

    const { data, error } = await supabase
      .from('curations')
      .insert(snakeBody)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(toCamelCase(data), { status: 201 });
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Curations POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
