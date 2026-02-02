'use server';

import { getDb } from './index';
import { scripts, users } from './schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function saveScript(
  userId: string,
  scriptId: string | null,
  title: string,
  content: string
) {
  try {
    const db = getDb();
    if (scriptId) {
      // Update existing script
      const [updated] = await db
        .update(scripts)
        .set({
          title,
          content,
          updatedAt: new Date(),
        })
        .where(eq(scripts.id, scriptId))
        .returning();

      revalidatePath('/');
      revalidatePath(`/editor/${scriptId}`);
      return updated;
    } else {
      // Create new script
      const [newScript] = await db
        .insert(scripts)
        .values({
          userId,
          title,
          content,
        })
        .returning();

      revalidatePath('/');
      return newScript;
    }
  } catch (error) {
    console.error('Error saving script:', error);
    throw new Error('Failed to save script');
  }
}

export async function loadScript(scriptId: string) {
  try {
    const db = getDb();
    const [script] = await db
      .select()
      .from(scripts)
      .where(eq(scripts.id, scriptId))
      .limit(1);

    if (!script) {
      throw new Error('Script not found');
    }

    return script;
  } catch (error) {
    console.error('Error loading script:', error);
    throw new Error('Failed to load script');
  }
}

export async function listScripts(userId: string) {
  try {
    const db = getDb();
    const userScripts = await db
      .select()
      .from(scripts)
      .where(eq(scripts.userId, userId))
      .orderBy(desc(scripts.updatedAt));

    return userScripts;
  } catch (error) {
    console.error('Error listing scripts:', error);
    throw new Error('Failed to list scripts');
  }
}

export async function deleteScript(scriptId: string, userId: string) {
  try {
    const db = getDb();
    // Verify ownership
    const [script] = await db
      .select()
      .from(scripts)
      .where(eq(scripts.id, scriptId))
      .limit(1);

    if (!script || script.userId !== userId) {
      throw new Error('Script not found or unauthorized');
    }

    await db.delete(scripts).where(eq(scripts.id, scriptId));

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting script:', error);
    throw new Error('Failed to delete script');
  }
}

export async function createOrGetUser(email: string, name?: string) {
  try {
    const db = getDb();
    // Try to find existing user
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
      })
      .returning();

    return newUser;
  } catch (error) {
    console.error('Error creating/getting user:', error);
    throw new Error('Failed to create or get user');
  }
}

