import { NextRequest, NextResponse } from 'next/server';
import { vdoNinja } from '@/lib/streaming/vdo-ninja';
import { z } from 'zod';

const parseUrlSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = parseUrlSchema.parse(body);

    // Parse VDO.ninja URL
    const parsed = vdoNinja.parseUrl(url);

    return NextResponse.json({
      success: true,
      parsed,
    });

  } catch (error: any) {
    console.error('Parse URL error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse URL' },
      { status: 400 }
    );
  }
}
