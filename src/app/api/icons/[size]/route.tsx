import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const dim = size === '512' ? 512 : 192;

  return new ImageResponse(
    (
      <div
        style={{
          width: dim,
          height: dim,
          background: 'linear-gradient(135deg, #3B2820 0%, #5C3D35 60%, #7A5C52 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: dim * 0.2,
        }}
      >
        {/* Letras CS */}
        <div
          style={{
            color: '#C4A882',
            fontSize: dim * 0.38,
            fontWeight: 300,
            fontFamily: 'serif',
            fontStyle: 'italic',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          CS
        </div>
        {/* Línea decorativa */}
        <div
          style={{
            width: dim * 0.35,
            height: 1,
            background: 'rgba(196,168,130,0.4)',
            marginTop: dim * 0.04,
            marginBottom: dim * 0.03,
          }}
        />
        {/* Texto "Pro" */}
        <div
          style={{
            color: 'rgba(255,247,236,0.55)',
            fontSize: dim * 0.1,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          Pro
        </div>
      </div>
    ),
    { width: dim, height: dim }
  );
}
