import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utilities';
import { CreateAdvisorSchema, UpdateAdvisorSchema } from '@/lib/validation/schemas';
import { toCamelCase, toSnakeCase } from '@/lib/utils/supabase-helpers';

/**
 * GET /api/advisors
 * - Public: Returns all advisors (for public view)
 * - Admin: Returns all advisors (same endpoint, used by admin panel)
 */
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient(request);

    const { data, error } = await supabase
      .from('advisors')
      .select('*');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const transformedData = data?.map(item => toCamelCase(item)) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Advisors GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/advisors
 * - Requires authentication
 * - Creates a new advisor
 */
export async function POST(request: Request) {
  try {
    await requireAuth(request);

    const body = await request.json();

    const result = CreateAdvisorSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient(request);
    const snakeBody = toSnakeCase(result.data);

    const { data, error } = await supabase
      .from('advisors')
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
    console.error('Advisors POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
