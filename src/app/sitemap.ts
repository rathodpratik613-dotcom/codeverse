import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://codeverse.onrender.com';
  
  const routes = [
    '',
    '/login',
    '/signup',
    '/dashboard',
    '/languages',
    '/challenges',
    '/games',
    '/daily-challenge',
    '/leaderboard',
    '/achievements',
    '/profile',
    '/settings',
    '/playground',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
