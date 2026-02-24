// src/components/common/ProtectedImage.tsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { LoaderCircle } from 'lucide-react';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
}

export const ProtectedImage: React.FC<ProtectedImageProps> = ({ src, alt, className, ...props }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;
        const fetchImage = async () => {
            // Only fetch if src is present
            if (!src) return;

            try {
                setLoading(true);
                const response = await api.get(src, { responseType: 'blob' });
                if (active) {
                    const url = URL.createObjectURL(response.data);
                    setImageUrl(url);
                }
            } catch (err) {
                console.error("Failed to load protected image:", err);
                if (active) setError(true);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchImage();

        return () => {
            active = false;
        };
    }, [src]);

    // Separate cleanup for object URL when it changes or unmounts
    useEffect(() => {
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    if (loading) {
        return <div className={`flex items-center justify-center bg-surface-variant/20 rounded-m3-l ${className}`} style={{ minHeight: '150px' }}><LoaderCircle className="animate-spin text-primary" /></div>;
    }

    if (error || !imageUrl) {
        return <div className={`flex items-center justify-center bg-surface-variant/20 rounded-m3-l ${className}`} style={{ minHeight: '150px' }}><span className="text-error text-sm">Immagine non disponibile</span></div>;
    }

    return <img src={imageUrl} alt={alt} className={className} {...props} />;
};
