'use server';

// This server action is kept for compatibility but the client should call the API route directly
// The API route handles streaming properly
export async function generateEdit() {
  // This function is deprecated - use the API route directly from the client
  throw new Error('Use the API route /api/generate-edit directly from the client');
}

