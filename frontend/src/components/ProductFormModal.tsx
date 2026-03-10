// frontend/srcs/components/ProductFormModal.tsx

'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import styles from './ProductFormModal.module.css';
import { toast } from 'react-toastify';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';

interface ProductFormModalProps {
  onClose: () => void;
  onProductAdded: (product: Product) => void; // FIX: Renamed prop
  initialData?: Product | null; // FIX: Renamed prop
  salonId?: string;
}

export default function ProductFormModal({ onClose, onProductAdded, initialData, salonId }: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const filePreviewRef = useRef<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Purchase link fields
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [takealotUrl, setTakealotUrl] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [purchaseNote, setPurchaseNote] = useState('');

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPrice(String(initialData.price));
      setStock(String(initialData.stock ?? 0));
      setExistingImages(initialData.images);
      // Load purchase link fields
      setWhatsappNumber(initialData.whatsappNumber || '');
      setWebsiteUrl(initialData.websiteUrl || '');
      setTakealotUrl(initialData.takealotUrl || '');
      setAmazonUrl(initialData.amazonUrl || '');
      setPurchaseNote(initialData.purchaseNote || '');
    }
  }, [isEditMode, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (newFiles.length + existingImages.length + files.length > 5) {
        toast.error('You can upload a maximum of 5 images in total.');
        return;
      }
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setFiles((prev) => [...prev, ...newFiles]);
      setFilePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveExistingImage = (imageUrlToRemove: string) => {
    setExistingImages(existingImages.filter((url) => url !== imageUrlToRemove));
  };

  const handleRemoveNewFile = (fileIndex: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== fileIndex));
    setFilePreviews((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fileIndex, 1);
      if (removed) {
        URL.revokeObjectURL(removed);
      }
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let imageUrls = existingImages;
      if (files.length > 0) {
        const uploaded = await Promise.all(files.map(file => uploadToCloudinary(file)));
        const uploadedUrls = uploaded.map(u => u.secure_url);
        imageUrls = [...existingImages, ...uploadedUrls];
      }

      if (imageUrls.length === 0) {
        throw new Error('Please upload at least one image.');
      }

      const apiEndpoint = isEditMode ? `/api/products/${initialData?.id}` : '/api/products';
      const method = isEditMode ? 'PATCH' : 'POST';
      const body = JSON.stringify({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock || '0', 10),
        images: imageUrls,
        // Purchase link fields
        whatsappNumber: whatsappNumber || null,
        websiteUrl: websiteUrl || null,
        takealotUrl: takealotUrl || null,
        amazonUrl: amazonUrl || null,
        purchaseNote: purchaseNote || null,
        ...(salonId ? { salonId } : {}),
      });

      const savedProduct = await apiJson<Product>(apiEndpoint, { method, headers: { 'Content-Type': 'application/json' }, body });

      // Enhanced toast notification with clear messaging
      if (isEditMode) {
        toast.success(
          `✅ Product updated successfully!\n📋 Your changes will be reviewed by an admin before going live.`,
          { autoClose: 5000 }
        );
      } else {
        toast.success(
          `🎉 Product created successfully!\n⏳ Your product is pending admin approval and will be visible once approved.`,
          { autoClose: 5000 }
        );
      }

      onProductAdded(savedProduct); // FIX: Use correct prop name
      filePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setFilePreviews([]);
      setFiles([]);
      onClose();

    } catch (err: any) {
      const msg = toFriendlyMessage(err, `Failed to ${isEditMode ? 'update' : 'add'} product.`);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filePreviewRef.current = filePreviews;
  }, [filePreviews]);

  useEffect(() => {
    return () => {
      filePreviewRef.current.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditMode ? 'Edit Product' : 'Add a New Product'}</h2>
          <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className={styles.textarea} />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Price (R)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className={styles.input} min="0" step="0.01" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Stock Quantity</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className={styles.input} min="0" step="1" />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Upload Images (up to 5 total)</label>
            <div className={styles.fileInputGroup}>
              <label htmlFor="file-upload" className={styles.fileInputLabel}>
                <FaUpload /> Choose Files
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              {files.length > 0 && <span className={styles.fileName}>{files.length} new file(s) selected</span>}
            </div>
          </div>

          <div className={styles.imagePreviewContainer}>
            {existingImages.map(url => (
              <div key={url} className={styles.imageWrapper}>
                <Image
                  src={url}
                  alt="Existing"
                  className={styles.imagePreview}
                  width={160}
                  height={120}
                />
                <button type="button" onClick={() => handleRemoveExistingImage(url)} className={styles.removeImageButton}>&times;</button>
              </div>
            ))}
            {files.map((file, index) => (
              <div key={index} className={styles.imageWrapper}>
                {filePreviews[index] ? (
                  <Image
                    src={filePreviews[index]}
                    alt={`Preview ${index + 1}`}
                    className={styles.imagePreview}
                    width={160}
                    height={120}
                    unoptimized
                  />
                ) : null}
                <button type="button" onClick={() => handleRemoveNewFile(index)} className={styles.removeImageButton}>&times;</button>
              </div>
            ))}
          </div>

          {/* Purchase Links Section */}
          <div className={styles.sectionDivider}>
            <h3 className={styles.sectionTitle}>Purchase Options</h3>
            <p className={styles.sectionDescription}>
              Add links where customers can purchase this product. At least one contact method is recommended.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>📱</span>
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g., +27 82 123 4567"
              className={styles.input}
            />
            <span className={styles.fieldHint}>Customers can message you directly on WhatsApp</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>🌐</span>
              Your Website/Store Link
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourstore.com/product"
              className={styles.input}
            />
            <span className={styles.fieldHint}>Direct link to your online store or product page</span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>🛒</span>
                Takealot Link
              </label>
              <input
                type="url"
                value={takealotUrl}
                onChange={(e) => setTakealotUrl(e.target.value)}
                placeholder="https://takealot.com/..."
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>📦</span>
                Amazon Link
              </label>
              <input
                type="url"
                value={amazonUrl}
                onChange={(e) => setAmazonUrl(e.target.value)}
                placeholder="https://amazon.com/..."
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>💬</span>
              Purchase Note (Optional)
            </label>
            <textarea
              value={purchaseNote}
              onChange={(e) => setPurchaseNote(e.target.value)}
              placeholder="Any special instructions for buyers, e.g., 'Free delivery in Johannesburg' or 'Contact for bulk pricing'"
              className={styles.textarea}
              rows={2}
            />
            <span className={styles.fieldHint}>This message will show when customers view the product</span>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}
          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
