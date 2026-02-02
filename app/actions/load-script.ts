'use server';

import { loadScript as loadScriptFromDb } from '@/lib/db/scripts';

export async function loadScriptAction(scriptId: string) {
  try {
    return await loadScriptFromDb(scriptId);
  } catch (error) {
    console.error('Error loading script:', error);
    throw error;
  }
}

