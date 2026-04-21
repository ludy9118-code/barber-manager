import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Color Studio Gustavo',
    short_name: 'CS Pro',
    description: 'App profesional — caja registradora y gestión de citas',
    start_url: '/pro',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FBF6F0',
    theme_color: '#5C3D35',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/api/icons/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/icons/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/api/icons/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/icons/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
