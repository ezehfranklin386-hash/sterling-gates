import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/utils/supabase-helpers';

/**
 * GET /api/settings/public
 * - Public endpoint returning non-sensitive settings
 */
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient(request);

    const { data, error } = await supabase
      .from('settings')
      .select('site_name, site_description, contact_email, contact_phone')
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(toCamelCase(data));
  } catch (error) {
    console.error('Settings public GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
