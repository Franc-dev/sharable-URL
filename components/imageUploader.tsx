import React, { useState, useRef } from 'react';
import { ImagePlus } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  existingImageUrl?: string;
  setIsImageUploading: (isUploading: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, existingImageUrl, setIsImageUploading }) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null);
  const fileinputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    setIsImageUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload-image', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onImageUpload(response.imageUrl);
          setPreviewUrl(response.imageUrl);
          setIsImageUploading(false);
          setUploadProgress(0);
        } else {
          console.error('Upload failed');
          setUploadProgress(0);
          setIsImageUploading(false);
        }
      };

      xhr.onerror = function() {
        console.error('Upload failed');
        setUploadProgress(0);
        setIsImageUploading(false);
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadProgress(0);
      setIsImageUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPreviewUrl(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <ImagePlus className="text-gray-400" size={48} />
          </div>
        )}
        <input
          type="file"
          ref={fileinputRef}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full mt-2">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-center mt-1 text-sm text-gray-900">
            Uploading: {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;