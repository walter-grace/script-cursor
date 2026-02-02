'use server';

import { createOrGetUser as createOrGetUserFromDb } from '@/lib/db/scripts';

export async function createOrGetUserAction(email: string, name?: string) {
  try {
    return await createOrGetUserFromDb(email, name);
  } catch (error) {
    console.error('Error creating/getting user:', error);
    throw error;
  }
}

