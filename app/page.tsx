import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { listScripts } from '@/lib/db/scripts';
import { createOrGetUserAction } from '@/app/actions/user';
import { FileUpload } from '@/components/upload/FileUpload';

// Temporary: For demo purposes, using a default user
// In production, this would come from authentication
const DEFAULT_USER_EMAIL = 'demo@scriptcursor.com';

export default async function Home() {
  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">ScriptCursor</h1>
            <p className="text-muted-foreground">
              Your AI-powered screenwriting IDE
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration Required</CardTitle>
              <CardDescription>
                Please set up your database connection to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a <code className="bg-muted px-2 py-1 rounded">.env.local</code> file in the project root with:
              </p>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {`DATABASE_URL=your_neon_db_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
              </pre>
              <p className="text-sm text-muted-foreground">
                Then run: <code className="bg-muted px-2 py-1 rounded">npm run db:push</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Create or get demo user
  const user = await createOrGetUserAction(DEFAULT_USER_EMAIL, 'Demo User');
  const scripts = await listScripts(user.id);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">ScriptCursor</h1>
            <p className="text-muted-foreground">
              Your AI-powered screenwriting IDE
            </p>
          </div>
          <div className="flex gap-2">
            <FileUpload />
            <Link href="/editor/new">
              <Button>New Script</Button>
            </Link>
          </div>
        </div>

        {scripts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No scripts yet</CardTitle>
              <CardDescription>
                Get started by creating your first screenplay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/editor/new">
                <Button>Create Your First Script</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map((script) => (
              <Link key={script.id} href={`/editor/${script.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{script.title}</CardTitle>
                    <CardDescription>
                      {script.updatedAt
                        ? new Date(script.updatedAt).toLocaleDateString()
                        : 'No date'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {script.content.slice(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
