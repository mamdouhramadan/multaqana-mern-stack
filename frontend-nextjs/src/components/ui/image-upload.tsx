import { useState, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { UploadSimple, X } from '@phosphor-icons/react';
import { cn } from '@/utils/utils';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 800 * 1024; // 800KB due to JSON storage limits
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ImageUpload({
  value,
  onChange,
  disabled,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Resize to reasonable max width
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.6 quality - significantly smaller size
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (JPEG, PNG, WebP, GIF).');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Please upload an image smaller than 800KB.');
      return;
    }

    setLoading(true);
    try {
      const compressedBase64 = await compressImage(file);
      onChange(compressedBase64);
      toast.success('Image processed and ready');
    } catch (error) {
      console.error(error);
      toast.error('Error processing image');
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(false);
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [disabled, processFile]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input value to allow selecting the same file again if needed
    e.target.value = '';
  }, [processFile]);

  if (value) {
    return (
      <div className={cn("relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group", className)}>
        <img
          src={value}
          alt="Uploaded image"
          className="w-full h-48 object-cover bg-gray-50 dark:bg-gray-800"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none"
            title="Remove image"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed transition-all cursor-pointer",
        isDragging
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
          : "border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 bg-gray-50 dark:bg-gray-800/50",
        disabled && "opacity-50 cursor-not-allowed hover:border-gray-300",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById('image-upload-input')?.click()}
    >
      <input
        id="image-upload-input"
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {loading ? (
        <Spinner size="md" />
      ) : (
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <UploadSimple size={32} className="mb-3 text-gray-400" />
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            SVG, PNG, JPG or GIF (max. 800KB)
          </p>
        </div>
      )}
    </div>
  );
}
