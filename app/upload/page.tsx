"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ImagePlus, Camera, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

const ImageUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStep, setActiveStep] = useState<'upload' | 'details'>('upload');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setActiveStep('details');
        setIsLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsUploading(true);
    setIsLoading(true);
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
          setActiveStep('upload');
        } else {
          throw new Error('Failed to upload image');
        }
        setIsUploading(false);
        setIsLoading(false);
      };
      xhr.onerror = function() {
        console.error('Upload failed');
        setIsUploading(false);
        setIsLoading(false);
      };
      xhr.send(formData);
      setTimeout(() => {
        router.push('/')
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  const renderUploadStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-orange-600 cursor-pointer">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <ImagePlus className="text-orange-600 mb-2" size={36} />
            <p className="text-orange-600 font-semibold text-sm">Click or drag to upload</p>
          </div>
        )}
        <input
          type="file"
          id="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </motion.div>
  );

  const renderDetailsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Enter image title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter image description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 min-h-[80px] text-sm"
          />
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <Layout>
        <Card className="w-full max-w-md mx-auto mt-8 overflow-hidden">
          <CardHeader className="bg-orange-600 py-4">
            <Skeleton className="h-6 w-3/4 bg-orange-300" />
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Card className="w-full max-w-md mx-auto mt-8 overflow-hidden">
          <CardHeader className="bg-orange-600 text-white py-4">
            <CardTitle className="text-xl font-bold">Welcome to Image Uploader</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Alert className="mb-4 bg-orange-100 border-orange-600">
              <AlertDescription>
                Please log in to start uploading your images.
              </AlertDescription>
            </Alert>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={() => {/* Implement login redirect */}}>
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
      <Card className="w-full max-w-md mx-auto mt-8 overflow-hidden">
        <CardHeader className="bg-orange-600 text-white py-4">
          <CardTitle className="text-xl font-bold">Upload Your Image</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4 flex justify-center space-x-2">
            <Button
              variant={activeStep === 'upload' ? 'default' : 'outline'}
              onClick={() => setActiveStep('upload')}
              className={`${activeStep === 'upload' ? 'bg-orange-600 hover:bg-orange-700' : 'text-orange-600 border-orange-600'} text-sm px-3 py-1`}
            >
              <Camera className="mr-1 h-4 w-4" />
              Choose Image
            </Button>
            <Button
              variant={activeStep === 'details' ? 'default' : 'outline'}
              onClick={() => setActiveStep('details')}
              className={`${activeStep === 'details' ? 'bg-orange-600 hover:bg-orange-700' : 'text-orange-600 border-orange-600'} text-sm px-3 py-1`}
              disabled={!file}
            >
              <FileText className="mr-1 h-4 w-4" />
              Add Details
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {activeStep === 'upload' ? renderUploadStep() : renderDetailsStep()}
            </AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-2"
              >
                <div className="bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-orange-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
                <p className="text-center mt-1 text-xs text-gray-900">
                  Uploading: {uploadProgress}%
                </p>
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm"
                disabled={isUploading || !file || !title}
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