import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import { createImagePreview, validateImageFile, UploadedImage } from '../utils/imageUpload';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  label?: string;
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 5,
  className = '',
  label = 'Images',
  required = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
      const file = files[i];
      const validation = validateImageFile(file);

      if (!validation.valid) {
        alert(validation.error);
        continue;
      }

      try {
        const preview = await createImagePreview(file);
        newImages.push(preview);
      } catch (error) {
        console.error('Error creating image preview:', error);
        alert('Erreur lors du traitement de l\'image');
      }
    }

    onChange([...images, ...newImages]);
    setUploading(false);
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

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-gold-500 bg-gold-50'
              : 'border-gray-300 hover:border-gold-500 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mb-4"></div>
              <p className="text-gray-600">Traitement des images...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                {images.length === 0 ? (
                  <Camera className="h-8 w-8 text-gray-400" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <p className="text-gray-600 mb-2">
                {images.length === 0
                  ? 'Cliquez ou glissez-déposez vos images ici'
                  : 'Ajouter plus d\'images'
                }
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG ou WebP • Max 5MB • {maxImages - images.length} restant(s)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-3 text-sm text-gray-500">
        <p>• La première image sera utilisée comme image principale</p>
        <p>• Formats supportés: JPG, PNG, WebP</p>
        <p>• Taille maximale: 5MB par image</p>
        <p>• Maximum {maxImages} images</p>
      </div>
    </div>
  );
};

export default ImageUpload;