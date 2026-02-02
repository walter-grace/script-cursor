'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: (scriptId: string) => void;
  size?: 'default' | 'sm';
}

export function FileUpload({ onUploadComplete, size = 'default' }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.fountain', '.txt'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Invalid file type. Please upload a .fountain or .txt file.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);

    try {
      const text = await file.text();
      const fileName = file.name.replace(/\.(fountain|txt)$/i, '');

      // Upload the file
      const response = await fetch('/api/upload-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: fileName,
          content: text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload script');
      }

      const { scriptId } = await response.json();
      toast.success('Script uploaded successfully!');

      if (onUploadComplete) {
        onUploadComplete(scriptId);
      } else {
        router.push(`/editor/${scriptId}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload script');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Input
        ref={fileInputRef}
        type="file"
        accept=".fountain,.txt"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        onClick={handleClick}
        disabled={isUploading}
        variant="outline"
        size={size}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? 'Uploading...' : size === 'sm' ? 'Upload' : 'Upload Script'}
      </Button>
    </>
  );
}

