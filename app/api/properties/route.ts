import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/utilities';
import { CreatePropertySchema } from '@/lib/validation/schemas';
import { toCamelCase, toSnakeCase } from '@/lib/utils/supabase-helpers';

/**
 * GET /api/properties
 * - Public endpoint returning published properties with search/filter
 */
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient(request);
    const url = new URL(request.url);

    // Parse query parameters
    const min_price = url.searchParams.get('min_price');
    const max_price = url.searchParams.get('max_price');
    const area = url.searchParams.get('area');
    const asset_class = url.searchParams.get('asset_class');
    const bedrooms = url.searchParams.get('bedrooms');
    const bathrooms = url.searchParams.get('bathrooms');
    const status = url.searchParams.get('status') || 'available';
    const sort_by = url.searchParams.get('sort_by') || 'created_at';
    const order = url.searchParams.get('order') || 'desc';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', status);

    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));
    if (area) query = query.eq('area', area);
    if (asset_class) query = query.eq('asset_class', asset_class);
    if (bedrooms) query = query.gte('bedrooms', parseInt(bedrooms));
    if (bathrooms) query = query.gte('bathrooms', parseInt(bathrooms));

    query = query
      .order(sort_by, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const transformedData = data?.map(item => toCamelCase(item)) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Properties GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties
 * - Requires authentication
 * - Creates a new property
 */
export async function POST(request: Request) {
  try {
    await requireAuth(request);

    const body = await request.json();

    const result = CreatePropertySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient(request);
    const snakeBody = toSnakeCase(result.data);

    const { data, error } = await supabase
      .from('properties')
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
    console.error('Properties POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
