"use client"
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Upload, ImagePlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ImageUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('userId', user.id);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      };
      xhr.onload = function() {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log('Image uploaded successfully', response);
          setFile(null);
          setTitle('');
          setDescription('');
          setPreviewUrl(null);
          setUploadProgress(0);
        } else {
          throw new Error('Failed to upload image');
        }
        setIsUploading(false);
      };
      xhr.onerror = function() {
        console.error('Upload failed');
        setIsUploading(false);
      };
      xhr.send(formData);
    // Redirect to the home page
    window.location.href = "/";
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-orange-600">Welcome to Image Uploader</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                Please log in to start uploading your images.
              </AlertDescription>
            </Alert>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={() => {/* Implement login redirect */}}>
                Log In
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-600">Upload Your Image</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <ImagePlus className="text-gray-400" size={48} />
                </div>
              )}
              <Input
                type="file"
                id="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter image title"
              required
            />
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter image description"
              className="min-h-[100px]"
            />
            {isUploading && (
              <div className="w-full mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-center mt-1 text-sm text-gray-900">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" /> 
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ImageUploader;