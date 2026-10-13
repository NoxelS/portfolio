import type { APIRoute } from 'astro';
import { getIndexMarkdownResponse } from '../index.md';

export const prerender = false;
export const GET: APIRoute = () => getIndexMarkdownResponse('de');
