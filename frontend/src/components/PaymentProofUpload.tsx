import React, { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';

interface PaymentProofUploadProps {
  onUpload: (base64: string) => void;
  value?: string;
}

export default function PaymentProofUpload({ onUpload, value }: PaymentProofUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    onUpload('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border-2 border-gold/30">
          <img src={preview} alt="Payment proof" className="w-full max-h-64 object-contain bg-charcoal-light" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-destructive/80 hover:bg-destructive text-white rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-gold bg-gold/5'
              : 'border-gold/30 hover:border-gold/60 hover:bg-gold/5'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
              <Image className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Click or drag to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG supported</p>
            </div>
            <div className="flex items-center gap-2 text-gold text-sm">
              <Upload className="w-4 h-4" />
              <span>Upload Screenshot</span>
            </div>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
