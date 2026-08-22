import { getSessionUser } from './auth';
export async function requireAdmin() { const user = await getSessionUser(); if (!user || user.role !== 'admin') throw new Error('ADMIN_REQUIRED'); return user; }
