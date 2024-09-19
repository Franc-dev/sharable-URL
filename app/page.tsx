"use client"
import React, { useState, useEffect } from 'react';
import Layout from "@/components/Layout";
import Image from "next/image";
import { useAuth } from '@/context/AuthContext';
import { Share2, Trash2, Archive, Grid, List, ArchiveRestore, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageData {
  id: string;
  title: string;
  description: string;
  url: string;
  userId: string;
  isArchived: boolean;
}

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
}


export default function Home() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, Record<string, boolean>>>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const toggleZoom = () => setIsZoomed(!isZoomed);
  const { user } = useAuth();
  const { toast } = useToast();
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/images');
      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to fetch images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (imageId: string, action: string, callback: () => Promise<void>) => {
    setLoadingStates(prev => ({
      ...prev,
      [imageId]: { ...prev[imageId], [action]: true }
    }));
    try {
      await callback();
    } catch (error) {
      console.error(`Error ${action}ing image:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} image`,
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [imageId]: { ...prev[imageId], [action]: false }
      }));
    }
  };

  const handleShare = async (imageId: string) => {
    handleAction(imageId, 'share', async () => {
      const response = await fetch('/api/images/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId }),
      });
      const data = await response.json();
      toast({
        title: "Image shared",
        description: `Share URL: ${data.shareUrl}`,
      });
      navigator.clipboard.writeText(data.shareUrl);
    });
  };

  const handleDelete = async (imageId: string) => {
    handleAction(imageId, 'delete', async () => {
      await fetch('/api/images/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId }),
      });
      setImages(images.filter(img => img.id !== imageId));
      toast({
        title: "Image deleted",
        description: "The image has been successfully deleted",
      });
    });
  };

  const handleArchive = async (imageId: string, isArchived: boolean) => {
    handleAction(imageId, 'archive', async () => {
      await fetch('/api/images/archive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: imageId, isArchived }),
      });
      setImages(images.map(img => img.id === imageId ? { ...img, isArchived } : img));
      toast({
        title: isArchived ? "Image archived" : "Image unarchived",
        description: `The image has been ${isArchived ? 'archived' : 'unarchived'}`,
      });
    });
  };

  const filteredImages = images.filter(img => 
    activeTab === 'all' ? !img.isArchived : img.isArchived
  );
  const ImageCard: React.FC<{
    image: ImageData;
    viewMode: string;
    handleShare: (imageId: string) => void;
    handleDelete: (imageId: string) => void;
    handleArchive: (imageId: string, isArchived: boolean) => void;
    loadingStates: { [key: string]: boolean };
    user: UserType | null;
  }> = React.memo(({ image, viewMode, handleShare, handleDelete, handleArchive, loadingStates, user }) => (
    <>
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}>
        <div  onClick={toggleZoom} className={`relative cursor-pointer ${viewMode === 'list' ? 'w-1/3' : 'aspect-square'}`}>
          <Image
            src={image.url}
            alt={image.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>
        <CardContent className={`flex flex-col p-4 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
          <h2 className="text-xl font-semibold mb-2">{image.title}</h2>
          <p className="text-sm text-gray-600 mb-4">{image.description}</p>
          <div className="flex justify-between items-center mt-auto space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleShare(image.id)}
              disabled={loadingStates?.share}
            >
              {loadingStates?.share ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4 mr-2" />
              )}
              Share
            </Button>
            {user && user.id === image.userId && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(image.id)}
                  disabled={loadingStates?.delete}
                >
                  {loadingStates?.delete ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchive(image.id, !image.isArchived)}
                  disabled={loadingStates?.archive}
                >
                  {loadingStates?.archive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : image.isArchived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>

    <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0  z-50 flex items-center justify-center p-4
            bg-black bg-opacity-50
            backdrop-blur-sm
            rounded-lg

            "
            onClick={toggleZoom}
          >
            {/* add zoom X */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2"
              onClick={toggleZoom}
            >
              <X className="h-4 w-4" />
            </Button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl w-full aspect-square bg-transparent rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={image.url}
                alt={image.title}
                layout="fill"
                objectFit="contain"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2"
                onClick={toggleZoom}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
    
  ));

  ImageCard.displayName = 'ImageCard';

  const SkeletonCard = () => (
    <Card className={`overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}>
      <div className={`relative ${viewMode === 'list' ? 'w-1/3' : 'aspect-square'}`}>
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className={`flex flex-col p-4 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex justify-between items-center mt-auto space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Images</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'archived')} className="mb-6">
          <TabsList className='px-1'>
            <TabsTrigger value="all">All Images</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
          <AnimatePresence>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            ) : (
              filteredImages.map((image) => (
                <ImageCard 
                key={image.id} 
                image={image} 
                viewMode={viewMode}
                handleShare={handleShare}
                handleDelete={handleDelete}
                handleArchive={handleArchive}
                loadingStates={loadingStates[image.id] || {}}
                user={user as UserType | null}
              />
              ))
            )}
            {filteredImages.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center py-8"
              >
                <p className="text-lg text-gray-500">
                  {activeTab === 'all' ? "You haven't uploaded any images yet." : "You don't have any archived images."}
                </p>
                {activeTab === 'all' && (
                  <Button className="mt-4" onClick={() => window.location.href = "/upload"}>
                    Upload an Image
                  </Button>
                )}
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}