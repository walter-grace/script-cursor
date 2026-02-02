'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useScriptStore } from '@/lib/store/script-store';

interface ExportScriptProps {
  size?: 'default' | 'sm';
}

export function ExportScript({ size = 'default' }: ExportScriptProps) {
  const { script } = useScriptStore();

  const handleExport = () => {
    if (!script.content) {
      return;
    }

    // Create a blob with the Fountain content
    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title || 'script'}.fountain`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size={size}
      className="gap-2"
      disabled={!script.content}
    >
      <Download className="h-4 w-4" />
      {size === 'sm' ? 'Export' : 'Export Script'}
    </Button>
  );
}

