'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaEye, FaPlus, FaTimes, FaCheck, FaTimes as FaClose } from 'react-icons/fa';
import styles from './AdminBlogManager.module.css';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Checkbox,
} from '@/components/ui';

interface BlogContentSection {
  heading: string;
  content: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: BlogContentSection[];
  category: string;
  featured: boolean;
  published: boolean;
  readTime?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface BlogFormData {
  title: string;
  slug: string;
  description: string;
  content: BlogContentSection[];
  category: string;
  featured: boolean;
  published: boolean;
  readTime: string;
}

const INITIAL_FORM_DATA: BlogFormData = {
  title: '',
  slug: '',
  description: '',
  content: [{ heading: '', content: '' }],
  category: 'Hair & Braids',
  featured: false,
  published: false,
  readTime: '5 min read',
};

const CATEGORIES = [
  'Hair & Braids',
  'Nail Care & Trends',
  'Men\'s Grooming',
  'Makeup & Special Events',
  'Skincare & Wellness',
  'Massage & Wellness',
  'Platform Feature Guide',
  'E-commerce / Products',
  'Seasonal & Events',
];

export default function AdminBlogManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Filter blogs based on search query
  const filteredBlogs = filterQuery.trim()
    ? blogs.filter(b =>
      b.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
      `${b.author.firstName} ${b.author.lastName}`.toLowerCase().includes(filterQuery.toLowerCase())
    )
    : blogs;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/blogs/admin/all', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      } else {
        toast.error('Failed to fetch blogs');
      }
    } catch (error) {
      toast.error('Error loading blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateNew = () => {
    setEditingBlog(null);
    setFormData(INITIAL_FORM_DATA);
    setShowForm(true);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      content: blog.content.length > 0 ? blog.content : [{ heading: '', content: '' }],
      category: blog.category,
      featured: blog.featured,
      published: blog.published,
      readTime: blog.readTime || '5 min read',
    });
    setShowForm(true);
  };

  const handleView = async (blogId: string) => {
    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setViewingBlog(data);
      } else {
        toast.error('Failed to load blog');
      }
    } catch (error) {
      toast.error('Error loading blog');
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to delete blog');
      }
    } catch (error) {
      toast.error('Error deleting blog');
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    try {
      const endpoint = blog.published ? 'unpublish' : 'publish';
      const res = await fetch(`/api/blogs/${blog.id}/${endpoint}`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(`Blog ${blog.published ? 'unpublished' : 'published'} successfully`);
        fetchBlogs();
      } else {
        const error = await res.json();
        toast.error(error.message || `Failed to ${endpoint} blog`);
      }
    } catch (error) {
      toast.error(`Error ${blog.published ? 'unpublishing' : 'publishing'} blog`);
    }
  };

  const handleAddSection = () => {
    setFormData({
      ...formData,
      content: [...formData.content, { heading: '', content: '' }],
    });
  };

  const handleRemoveSection = (index: number) => {
    if (formData.content.length > 1) {
      setFormData({
        ...formData,
        content: formData.content.filter((_, i) => i !== index),
      });
    }
  };

  const handleSectionChange = (index: number, field: 'heading' | 'content', value: string) => {
    const newContent = [...formData.content];
    newContent[index] = { ...newContent[index], [field]: value };
    setFormData({ ...formData, content: newContent });
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingBlog ? formData.slug : generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.content.some(section => !section.heading || !section.content)) {
      toast.error('Please fill in all section headings and content');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingBlog
        ? `/api/blogs/${editingBlog.id}`
        : '/api/blogs';

      const method = editingBlog ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`Blog ${editingBlog ? 'updated' : 'created'} successfully`);
        setShowForm(false);
        fetchBlogs();
      } else {
        const error = await res.json();
        toast.error(error.message || `Failed to ${editingBlog ? 'update' : 'create'} blog`);
      }
    } catch (error) {
      toast.error(`Error ${editingBlog ? 'updating' : 'creating'} blog`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading blogs...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Blog Management</h2>
        <button className={styles.createButton} onClick={handleCreateNew}>
          <FaPlus /> Create New Blog
        </button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter by title, category, author..."
          className={styles.filterInput}
        />
        <span className={styles.filterCount}>
          Showing {filteredBlogs.length} of {blogs.length}
        </span>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className={styles.emptyState}>
          {blogs.length === 0
            ? 'No blogs found. Create your first blog to get started.'
            : 'No blogs match your filter.'}
        </div>
      ) : (
        <div className={styles.blogsList}>
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className={styles.blogCard}>
              <div className={styles.blogInfo}>
                <div className={styles.blogHeader}>
                  <h3>{blog.title}</h3>
                  <div className={styles.badges}>
                    {blog.published ? (
                      <span className={styles.badgePublished}>Published</span>
                    ) : (
                      <span className={styles.badgeDraft}>Draft</span>
                    )}
                    {blog.featured && (
                      <span className={styles.badgeFeatured}>Featured</span>
                    )}
                  </div>
                </div>
                <p className={styles.blogDescription}>{blog.description}</p>
                <div className={styles.blogMeta}>
                  <span className={styles.metaItem}>Category: {blog.category}</span>
                  <span className={styles.metaItem}>Author: {blog.author.firstName} {blog.author.lastName}</span>
                  <span className={styles.metaItem}>
                    Created: {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                  {blog.publishedAt && (
                    <span className={styles.metaItem}>
                      Published: {new Date(blog.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.blogActions}>
                <button
                  className={styles.actionButton}
                  onClick={() => handleView(blog.id)}
                  title="View"
                >
                  <FaEye />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleEdit(blog)}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleTogglePublish(blog)}
                  title={blog.published ? 'Unpublish' : 'Publish'}
                >
                  {blog.published ? <FaClose /> : <FaCheck />}
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(blog.id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</h3>
              <button className={styles.closeButton} onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="Enter blog title"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="blog-slug-url"
                />
                <small>URL-friendly version of the title</small>
              </div>

              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Brief description of the blog"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={styles.formGroup}>
                  <label>Read Time</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="e.g., 8 min read"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked === true })}
                  label="Featured"
                />
                <Checkbox
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked === true })}
                  label="Publish"
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.sectionsHeader}>
                  <label>Content Sections *</label>
                  <button type="button" onClick={handleAddSection} className={styles.addSectionButton}>
                    <FaPlus /> Add Section
                  </button>
                </div>

                {formData.content.map((section, index) => (
                  <div key={index} className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <h4>Section {index + 1}</h4>
                      {formData.content.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(index)}
                          className={styles.removeSectionButton}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={section.heading}
                      onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
                      placeholder="Section heading"
                      required
                      className={styles.sectionHeading}
                    />
                    <textarea
                      value={section.content}
                      onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                      placeholder="Section content"
                      required
                      rows={5}
                      className={styles.sectionContent}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingBlog && (
        <div className={styles.modalOverlay} onClick={() => setViewingBlog(null)}>
          <div className={styles.viewModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{viewingBlog.title}</h3>
              <button className={styles.closeButton} onClick={() => setViewingBlog(null)}>
                <FaTimes />
              </button>
            </div>

            <div className={styles.blogView}>
              <div className={styles.blogViewMeta}>
                <span className={styles.metaItem}>Category: {viewingBlog.category}</span>
                <span className={styles.metaItem}>Author: {viewingBlog.author.firstName} {viewingBlog.author.lastName}</span>
                {viewingBlog.readTime && (
                  <span className={styles.metaItem}>Read Time: {viewingBlog.readTime}</span>
                )}
                <span className={styles.metaItem}>
                  Created: {new Date(viewingBlog.createdAt).toLocaleDateString()}
                </span>
                {viewingBlog.publishedAt && (
                  <span className={styles.metaItem}>
                    Published: {new Date(viewingBlog.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <p className={styles.blogViewDescription}>{viewingBlog.description}</p>

              <div className={styles.blogViewContent}>
                {viewingBlog.content.map((section, index) => (
                  <section key={index} className={styles.viewSection}>
                    <h4>{section.heading}</h4>
                    <p>{section.content}</p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






