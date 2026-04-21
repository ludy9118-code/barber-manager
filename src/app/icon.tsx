import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#5C3D35',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
        }}
      >
        <div style={{ color: '#C4A882', fontSize: 16, fontStyle: 'italic', fontFamily: 'serif' }}>
          G
        </div>
      </div>
    )
  );
}
