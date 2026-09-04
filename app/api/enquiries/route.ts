import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utilities';
import { CreateEnquirySchema, UpdateEnquirySchema } from '@/lib/validation/schemas';
import { toCamelCase, toSnakeCase } from '@/lib/utils/supabase-helpers';

/**
 * POST /api/enquiries
 * - Public endpoint for creating enquiries
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = CreateEnquirySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient(request);
    const snakeBody = toSnakeCase(result.data);

    const { data, error } = await supabase
      .from('enquiries')
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
  } catch (error) {
    console.error('Enquiries POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/enquiries
 * - Requires authentication
 * - Returns list of enquiries
 */
export async function GET(request: Request) {
  try {
    await requireAuth(request);

    const supabase = createServerSupabaseClient(request);

    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const transformedData = data?.map(item => toCamelCase(item)) || [];

    return NextResponse.json(transformedData);
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Enquiries GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
