import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Cloudflare adds CF-IPCountry header automatically
  const cfCountry = req.headers.get('CF-IPCountry');
  if (cfCountry && cfCountry !== 'XX') {
    return NextResponse.json({ country: cfCountry });
  }

  // Fallback: use ip-api.com
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '1.1.1.1';

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return NextResponse.json({ country: data.countryCode || 'US' });
  } catch {
    return NextResponse.json({ country: 'US' });
  }
}
