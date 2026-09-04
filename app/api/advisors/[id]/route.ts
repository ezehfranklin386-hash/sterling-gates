import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utilities';
import { UpdateAdvisorSchema } from '@/lib/validation/schemas';
import { toCamelCase, toSnakeCase } from '@/lib/utils/supabase-helpers';

/**
 * GET /api/advisors/[id]
 * - Returns a single advisor by ID (public)
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient(request);

    const { data, error } = await supabase
      .from('advisors')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json(toCamelCase(data));
  } catch (error) {
    console.error('Advisors GET by ID error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/advisors/[id]
 * - Requires authentication
 * - Updates an advisor by ID
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth(request);

    const body = await request.json();

    const result = UpdateAdvisorSchema.safeParse(body);
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
      .update(snakeBody)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json(toCamelCase(data));
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Advisors PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/advisors/[id]
 * - Requires authentication
 * - Deletes an advisor by ID
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth(request);

    const supabase = createServerSupabaseClient(request);

    const { error } = await supabase
      .from('advisors')
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
    console.error('Advisors DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
