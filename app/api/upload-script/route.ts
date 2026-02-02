import { NextRequest } from 'next/server';
import { saveScript, createOrGetUser } from '@/lib/db/scripts';

// Temporary: For demo purposes
const DEFAULT_USER_EMAIL = 'demo@scriptcursor.com';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get or create user
    const user = await createOrGetUser(DEFAULT_USER_EMAIL, 'Demo User');

    // Save the script
    const script = await saveScript(user.id, null, title, content);

    return new Response(
      JSON.stringify({
        scriptId: script.id,
        title: script.title,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error uploading script:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to upload script',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

