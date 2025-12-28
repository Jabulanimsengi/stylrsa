'use client';

import React, { useState, useEffect } from 'react';
import { Trend, TrendCategory, AgeGroup } from '@/types';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaEye, FaHeart, FaMousePointer, FaPlus, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { transformCloudinary, uploadToCloudinary } from '@/utils/cloudinary';
import styles from './AdminTrendsManager.module.css';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Checkbox,
} from '@/components/ui';

interface TrendFormData {
  title: string;
  description: string;
  images: string[];
  category: TrendCategory;
  ageGroups: AgeGroup[];
  styleName: string;
  tags: string[];
  isActive: boolean;
  priority: number;
  relatedServiceCategories: string[];
}

const INITIAL_FORM_DATA: TrendFormData = {
  title: '',
  description: '',
  images: [],
  category: 'HAIRSTYLE',
  ageGroups: ['ALL_AGES'],
  styleName: '',
  tags: [],
  isActive: true,
  priority: 0,
  relatedServiceCategories: [],
};

const CATEGORIES: { value: TrendCategory; label: string }[] = [
  { value: 'HAIRSTYLE', label: 'Hairstyle' },
  { value: 'BRAIDS', label: 'Braids' },
  { value: 'LOCS', label: 'Locs' },
  { value: 'EXTENSIONS', label: 'Extensions' },
  { value: 'NAILS', label: 'Nails' },
  { value: 'SPA', label: 'Spa' },
  { value: 'MAKEUP', label: 'Makeup' },
  { value: 'SKINCARE', label: 'Skincare' },
  { value: 'MASSAGE', label: 'Massage' },
  { value: 'BARBERING', label: 'Barbering' },
];

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: 'KIDS', label: 'Kids (0-12)' },
  { value: 'TEENS', label: 'Teens (13-17)' },
  { value: 'YOUNG_ADULTS', label: 'Young Adults (18-35)' },
  { value: 'ADULTS', label: 'Adults (36-55)' },
  { value: 'MATURE_ADULTS', label: 'Mature Adults (55+)' },
  { value: 'ALL_AGES', label: 'All Ages' },
];

export default function AdminTrendsManager() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrend, setEditingTrend] = useState<Trend | null>(null);
  const [formData, setFormData] = useState<TrendFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [filterQuery, setFilterQuery] = useState('');

  // Filter trends based on search query
  const filteredTrends = filterQuery.trim()
    ? trends.filter(t =>
      t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(filterQuery.toLowerCase())
    )
    : trends;

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/trends/admin/all', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setTrends(data);
      } else {
        toast.error('Failed to fetch trends');
      }
    } catch (error) {
      toast.error('Error loading trends');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTrend(null);
    setFormData(INITIAL_FORM_DATA);
    setShowForm(true);
  };

  const handleEdit = (trend: Trend) => {
    setEditingTrend(trend);
    setFormData({
      title: trend.title,
      description: trend.description,
      images: trend.images,
      category: trend.category,
      ageGroups: trend.ageGroups,
      styleName: trend.styleName || '',
      tags: trend.tags,
      isActive: trend.isActive,
      priority: trend.priority,
      relatedServiceCategories: trend.relatedServiceCategories,
    });
    setShowForm(true);
  };

  const handleDelete = async (trendId: string) => {
    if (!confirm('Are you sure you want to delete this trend?')) return;

    try {
      const res = await fetch(`/api/trends/admin/${trendId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Trend deleted successfully');
        fetchTrends();
      } else {
        toast.error('Failed to delete trend');
      }
    } catch (error) {
      toast.error('Error deleting trend');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || formData.images.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingTrend
        ? `/api/trends/admin/${editingTrend.id}`
        : '/api/trends/admin';

      const method = editingTrend ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingTrend ? 'Trend updated!' : 'Trend created!');
        setShowForm(false);
        setFormData(INITIAL_FORM_DATA);
        setEditingTrend(null);
        fetchTrends();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to save trend');
      }
    } catch (error) {
      toast.error('Error saving trend');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadToCloudinary(file, {
          folder: 'trends',
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        })
      );

      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map((result) => result.secure_url);

      setFormData({
        ...formData,
        images: [...formData.images, ...imageUrls],
      });

      toast.success(`${files.length} image(s) uploaded successfully!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
      // Reset file input
      e.target.value = '';
    }
  };

  const addImage = () => {
    if (!imageInput.trim()) return;

    if (!imageInput.includes('cloudinary.com')) {
      toast.error('Please enter a valid Cloudinary URL');
      return;
    }

    setFormData({
      ...formData,
      images: [...formData.images, imageInput.trim()],
    });
    setImageInput('');
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const toggleAgeGroup = (ageGroup: AgeGroup) => {
    const current = formData.ageGroups;
    const updated = current.includes(ageGroup)
      ? current.filter((ag) => ag !== ageGroup)
      : [...current, ageGroup];

    setFormData({ ...formData, ageGroups: updated });
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading trends...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Trends</h2>
        <button onClick={handleCreateNew} className={styles.createButton}>
          <FaPlus /> Create New Trend
        </button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter by title, category, description..."
          className={styles.filterInput}
        />
        <span className={styles.filterCount}>
          Showing {filteredTrends.length} of {trends.length}
        </span>
      </div>

      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formModal}>
            <div className={styles.formHeader}>
              <h3>{editingTrend ? 'Edit Trend' : 'Create New Trend'}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData(INITIAL_FORM_DATA);
                  setEditingTrend(null);
                }}
                className={styles.closeButton}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>
                  Title <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Box Braids 2025"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Description <span className={styles.required}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this trend..."
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Style Name</label>
                <input
                  type="text"
                  value={formData.styleName}
                  onChange={(e) =>
                    setFormData({ ...formData, styleName: e.target.value })
                  }
                  placeholder="e.g., Knotless Box Braids"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Category <span className={styles.required}>*</span>
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category: value as TrendCategory,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.formGroup}>
                <label>
                  Age Groups <span className={styles.required}>*</span>
                </label>
                <div className={styles.checkboxGrid}>
                  {AGE_GROUPS.map((ag) => (
                    <label key={ag.value} className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.ageGroups.includes(ag.value)}
                        onChange={() => toggleAgeGroup(ag.value)}
                      />
                      {ag.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>
                  Images <span className={styles.required}>*</span>
                </label>

                <div className={styles.uploadOptions}>
                  <div className={styles.fileUploadWrapper}>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploadingImages}
                      className={styles.fileInput}
                    />
                    <label htmlFor="imageUpload" className={styles.fileUploadButton}>
                      {uploadingImages ? `Uploading... ${uploadProgress}%` : '📁 Upload Images'}
                    </label>
                  </div>

                  <div className={styles.orDivider}>OR</div>

                  <div className={styles.imageInput}>
                    <input
                      type="text"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Paste Cloudinary URL"
                      disabled={uploadingImages}
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className={styles.addButton}
                      disabled={uploadingImages}
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                <div className={styles.imageGrid}>
                  {formData.images.map((img, index) => (
                    <div key={index} className={styles.imagePreview}>
                      <Image
                        src={transformCloudinary(img, { width: 200, height: 250 })}
                        alt={`Image ${index + 1}`}
                        width={200}
                        height={250}
                        style={{ objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className={styles.removeImageButton}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Priority (higher = shows first)</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked === true })
                    }
                    label="Active (visible to users)"
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData(INITIAL_FORM_DATA);
                    setEditingTrend(null);
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Saving...' : editingTrend ? 'Update Trend' : 'Create Trend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.trendsGrid}>
        {filteredTrends.length === 0 ? (
          <p className={styles.emptyState}>
            {trends.length === 0
              ? 'No trends created yet. Click "Create New Trend" to get started!'
              : 'No trends match your filter.'}
          </p>
        ) : (
          filteredTrends.map((trend) => (
            <div key={trend.id} className={styles.trendCard}>
              <div className={styles.trendImage}>
                <Image
                  src={transformCloudinary(trend.images[0], { width: 300, height: 375 })}
                  alt={trend.title}
                  width={300}
                  height={375}
                  style={{ objectFit: 'cover' }}
                />
                {!trend.isActive && (
                  <div className={styles.inactiveBadge}>Inactive</div>
                )}
              </div>

              <div className={styles.trendContent}>
                <h3>{trend.title}</h3>
                <p className={styles.category}>{trend.category.replace(/_/g, ' ')}</p>
                <p className={styles.description}>{trend.description.substring(0, 100)}...</p>

                <div className={styles.stats}>
                  <span><FaEye /> {trend.viewCount}</span>
                  <span><FaHeart /> {trend.likeCount}</span>
                  <span><FaMousePointer /> {trend.clickThroughCount}</span>
                </div>

                <div className={styles.trendActions}>
                  <button
                    onClick={() => handleEdit(trend)}
                    className={styles.editButton}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(trend.id)}
                    className={styles.deleteButton}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
