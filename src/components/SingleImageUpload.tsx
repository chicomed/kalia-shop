import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { createImagePreview, validateImageFile } from '../utils/imageUpload';

interface SingleImageUploadProps {
  image: string;
  onChange: (image: string) => void;
  className?: string;
  label?: string;
  required?: boolean;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
}

const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  image,
  onChange,
  className = '',
  label = 'Image',
  required = false,
  aspectRatio = 'auto'
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'landscape': return 'aspect-video';
      case 'portrait': return 'aspect-[3/4]';
      default: return 'h-48';
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateImageFile(file);

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);

    try {
      const preview = await createImagePreview(file);
      onChange(preview);
    } catch (error) {
      console.error('Error creating image preview:', error);
      alert('Erreur lors du traitement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    onChange('');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {image ? (
          <div className="relative group">
            <img
              src={image}
              alt="Upload preview"
              className={`w-full ${getAspectRatioClass()} object-cover rounded-lg border border-gray-300`}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Changer l'image"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  title="Supprimer l'image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
            className={`${getAspectRatioClass()} border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragOver
                ? 'border-gold-500 bg-gold-50'
                : 'border-gray-300 hover:border-gold-500 hover:bg-gray-50'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mb-2"></div>
                <p className="text-gray-600 text-sm">Traitement...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 p-3 rounded-full mb-3">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm mb-1">Cliquez ou glissez une image</p>
                <p className="text-xs text-gray-500">JPG, PNG ou WebP • Max 5MB</p>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default SingleImageUpload;