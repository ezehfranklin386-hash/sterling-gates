import { NextResponse } from 'next/server';

/**
 * Health check endpoint - public endpoint for liveness probe
 * 
 * @returns 200 OK with health status
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
