// packages/edu-editor/src/components/MediaLibrary/MediaLibrary.tsx - Updated to use your API

import React, {useEffect, useRef, useState} from 'react';
import MediaGallery from './MediaGallery';
import Button from '../../components/TiptapEditor/components/ui/Button';

import './style.scss';

interface MediaLibraryProps {
  onInsert?: (image: ImageData) => void;
  onClose?: () => void;
}

interface ImageData {
  id?: string;
  url: string;
  created_at?: string;
  bytes?: number;
  format: string | undefined;
  display_name: string | undefined;
  width: number;
  height: number;
}

// Get API base URL (same as in your useApi hook)
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production domains
    if (hostname === 'ieduguide.com' ||
        hostname === 'www.ieduguide.com' ||
        hostname === 'ieduguide.com' ||
        hostname === 'www.ieduguide.com') {
      return 'https://api.ieduguide.com/api';
    }

    // Vercel preview deployments
    if (hostname.includes('vercel.app')) {
      return 'https://eduapi-phi.vercel.app/api';
    }

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'https://api.ieduguide.com/api';
    }
  }

  return 'https://api.ieduguide.com/api';
};

const MediaLibrary: React.FC<MediaLibraryProps> = ({onInsert, onClose}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [previews, setPreviews] = useState<ImageData[]>([]);
  const [selected, setSelected] = useState<ImageData | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const apiBaseUrl = getApiBaseUrl();

  const handleUploadClick = () => {
    const confirmUpload = window.confirm(
        "Please avoid uploading too many images unnecessarily to save storage space. Also, ensure your images comply with copyright rules. Do you wish to continue?"
    );

    if (confirmUpload) {
      fileInput.current?.click();
    }
  };

  const loadImage = (file: File): Promise<ImageData> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        resolve({
          url,
          width: image.width,
          height: image.height,
          format: file.type.split('/')[1],
          display_name: file.name.split(/\.\w+$/)[0]
        });
      };
      image.src = url;
    });
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiBaseUrl}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      return result.data; // Your API returns data in { success: true, data: imageData }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // Show previews immediately
      const previewPromises = Array.from(files).map(loadImage);
      const loadedPreviews = await Promise.all(previewPromises);
      setPreviews(loadedPreviews);

      // Upload files
      const uploadPromises = Array.from(files).map(uploadImage);
      const uploadedImages = await Promise.all(uploadPromises);

      // Clean up preview URLs
      loadedPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
      setPreviews([]);

      // Add uploaded images to the list
      setImages(prev => [...uploadedImages, ...prev]);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      // Clean up previews on error
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
      setPreviews([]);
    } finally {
      setUploading(false);
    }
  };

  const handleFinish = () => {
    if (selected && onInsert) {
      onInsert(selected);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/images`);

        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setImages(result.data);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [apiBaseUrl]);

  return (
      <div className="media-library">
        <header className="media-library__header">
          <h2>Assets</h2>
          <Button disabled={loading || uploading} onClick={handleUploadClick}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </header>

        <div className="media-library__content">
          {loading ? (
              <div className="media-library__spinner" aria-label="Loading images"/>
          ) : (
              <MediaGallery data={[...previews, ...images]} onSelect={setSelected} selected={selected}/>
          )}
        </div>

        <footer className="media-library__footer">
          <Button variant="outline" className="media-library__btn media-library__btn--cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="media-library__btn media-library__btn--finish" disabled={!selected || loading || uploading}
                  onClick={handleFinish}>
            Insert
          </Button>
        </footer>

        <input
            style={{display: 'none'}}
            type="file"
            multiple
            accept="image/*"
            ref={fileInput}
            onChange={handleFileChange}
        />
      </div>
  );
};

export default MediaLibrary;