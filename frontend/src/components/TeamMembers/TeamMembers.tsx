'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaPlus, FaTrash, FaEdit, FaUser, FaUsers, FaCamera, FaTimes, FaImages } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiJson, apiFetch } from '@/lib/api';
import type { Service, TeamMember } from '@/types';
import styles from './TeamMembers.module.css';

interface TeamMembersProps {
  salonId: string;
  isEditable?: boolean;
}

interface FormData {
  name: string;
  role: string;
  bio: string;
  image: string;
  galleryImages: string[];
  specialties: string;
  experience: string;
  serviceIds: string[];
}

const INITIAL_FORM: FormData = {
  name: '',
  role: '',
  bio: '',
  image: '',
  galleryImages: [],
  specialties: '',
  experience: '',
  serviceIds: [],
};

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Modal component rendered via portal
function TeamMemberModal({
  isOpen,
  onClose,
  editingMember,
  salonId,
  availableServices,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingMember: TeamMember | null;
  salonId: string;
  availableServices: Service[];
  onSave: (member: TeamMember, isNew: boolean) => void;
}) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset form when modal opens/closes or editing member changes
  useEffect(() => {
    if (isOpen) {
      if (editingMember) {
        setFormData({
          name: editingMember.name,
          role: editingMember.role,
          bio: editingMember.bio || '',
          image: editingMember.image || '',
          galleryImages: editingMember.galleryImages || [],
          specialties: editingMember.specialties?.join(', ') || '',
          experience: editingMember.experience?.toString() || '',
          serviceIds:
            editingMember.serviceIds ||
            editingMember.services?.map((service) => service.id) ||
            [],
        });
        setImagePreview(editingMember.image || null);
      } else {
        setFormData(INITIAL_FORM);
        setImagePreview(null);
      }
    }
  }, [isOpen, editingMember]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const uploadImageToCloudinary = useCallback(async (file: File) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', 'team_members');
    uploadData.append('folder', `salons/${salonId}/team`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: uploadData }
    );

    if (!res.ok) {
      throw new Error('Upload failed');
    }

    const data = await res.json();
    return data.secure_url as string;
  }, [salonId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingProfile(true);
    try {
      const secureUrl = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, image: secureUrl }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
      setImagePreview(null);
    } finally {
      setIsUploadingProfile(false);
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" is larger than 5MB`);
        return;
      }
    }

    setIsUploadingGallery(true);
    try {
      const uploadedUrls = await Promise.all(files.map((file) => uploadImageToCloudinary(file)));
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...uploadedUrls],
      }));
      toast.success(`${uploadedUrls.length} gallery image${uploadedUrls.length === 1 ? '' : 's'} uploaded`);
    } catch {
      toast.error('Failed to upload gallery images');
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  const removeGalleryImage = useCallback((imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((url) => url !== imageUrl),
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      toast.error('Name and role are required');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      bio: formData.bio.trim() || null,
      image: formData.image || null,
      galleryImages: formData.galleryImages,
      specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      experience: formData.experience ? parseInt(formData.experience) : null,
      serviceIds: formData.serviceIds,
    };

    try {
      if (editingMember) {
        const updated = await apiJson<TeamMember>(`/api/team-members/${editingMember.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        onSave(updated, false);
        toast.success('Team member updated');
      } else {
        const newMember = await apiJson<TeamMember>(`/api/team-members/salon/${salonId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        onSave(newMember, true);
        toast.success('Team member added');
      }
      onClose();
    } catch {
      toast.error('Failed to save team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <div className={styles.modalScrollArea}>
          <h3 className={styles.modalTitle}>
            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
          </h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.imageUploadSection}>
              <div
                className={styles.imageUploadPreview}
                onClick={() => profileInputRef.current?.click()}
              >
                {(imagePreview || formData.image) ? (
                  <Image
                    src={imagePreview || formData.image}
                    alt="Preview"
                    fill
                    className={styles.previewImage}
                  />
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <FaCamera />
                    <span>Add Photo</span>
                  </div>
                )}
                {isUploadingProfile && (
                  <div className={styles.uploadingOverlay}>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <p className={styles.imageHint}>Click to upload photo (max 5MB)</p>
            </div>

            <div className={styles.formGroup}>
              <label>Gallery Images</label>
              <div className={styles.galleryUploadHeader}>
                <button
                  type="button"
                  className={styles.galleryUploadButton}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <FaImages /> {isUploadingGallery ? 'Uploading...' : 'Add Gallery Images'}
                </button>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  style={{ display: 'none' }}
                />
              </div>
              <p className={styles.servicesHint}>Upload extra portfolio images for this team member.</p>
              {formData.galleryImages.length > 0 && (
                <div className={styles.galleryPreviewGrid}>
                  {formData.galleryImages.map((imageUrl) => (
                    <div key={imageUrl} className={styles.galleryPreviewItem}>
                      <Image
                        src={imageUrl}
                        alt="Gallery preview"
                        fill
                        className={styles.galleryPreviewImage}
                      />
                      <button
                        type="button"
                        className={styles.removeGalleryImageButton}
                        onClick={() => removeGalleryImage(imageUrl)}
                        aria-label="Remove gallery image"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., Sarah Johnson"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Role *</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                required
                placeholder="e.g., Senior Stylist"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Years of Experience</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="e.g., 5"
                min="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief description about this team member..."
                rows={2}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Specialties (comma-separated)</label>
              <input
                type="text"
                value={formData.specialties}
                onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                placeholder="e.g., Braids, Color, Extensions"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Services This Team Member Can Book</label>
              {availableServices.length === 0 ? (
                <p className={styles.servicesHint}>
                  Add salon services first, then assign them to this team member.
                </p>
              ) : (
                <div className={styles.serviceAssignmentGrid}>
                  {availableServices.map((service) => {
                    const serviceName = service.title || service.name || 'Service';
                    const isSelected = formData.serviceIds.includes(service.id);

                    return (
                      <button
                        key={service.id}
                        type="button"
                        className={`${styles.serviceAssignmentChip} ${isSelected ? styles.serviceAssignmentChipSelected : ''}`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            serviceIds: isSelected
                              ? prev.serviceIds.filter((serviceId) => serviceId !== service.id)
                              : [...prev.serviceIds, service.id],
                          }))
                        }
                      >
                        <span>{serviceName}</span>
                        <strong>R{service.price}</strong>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className={styles.formActions}>
              <button type="button" onClick={onClose} className={styles.cancelBtn}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingProfile || isUploadingGallery}
                className={styles.submitBtn}
              >
                {isSubmitting ? 'Saving...' : editingMember ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default function TeamMembers({ salonId, isEditable = false }: TeamMembersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const action = searchParams.get('action');

  useEffect(() => {
    let skeletonTimer: NodeJS.Timeout | null = null;
    if (isLoading) {
      skeletonTimer = setTimeout(() => setShowSkeleton(true), 120); // avoid flicker on very fast loads
    } else {
      setShowSkeleton(false);
    }
    return () => {
      if (skeletonTimer) clearTimeout(skeletonTimer);
    };
  }, [isLoading]);

  useEffect(() => {
    let isMounted = true;
    const fetchMembers = async () => {
      try {
        const data = await apiJson<TeamMember[]>(`/api/team-members/salon/${salonId}${isEditable ? '?includeInactive=true' : ''}`);
        if (isMounted) {
          setMembers(
            data.map((member) => ({
              ...member,
              serviceIds:
                member.serviceIds ||
                member.services?.map((service) => service.id) ||
                [],
            })),
          );
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMembers();
    return () => { isMounted = false; };
  }, [salonId, isEditable]);

  useEffect(() => {
    if (!isEditable) {
      return;
    }

    let isMounted = true;

    const fetchServices = async () => {
      try {
        const data = await apiJson<Service[]>(`/api/salons/mine/services`);
        if (isMounted) {
          setAvailableServices(data);
        }
      } catch (error) {
        console.error('Failed to fetch services for team member assignments:', error);
      }
    };

    void fetchServices();

    return () => {
      isMounted = false;
    };
  }, [isEditable, salonId]);

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await apiFetch(`/api/team-members/${memberId}`, { method: 'DELETE' });
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Team member removed');
    } catch {
      toast.error('Failed to remove team member');
    }
  };

  const openAddModal = useCallback(() => {
    setEditingMember(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((member: TeamMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // Delay clearing editing member to prevent flicker
    setTimeout(() => setEditingMember(null), 200);
    if (action === 'add-team-member') {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete('action');
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }, [action, pathname, router, searchParams]);

  useEffect(() => {
    if (!isEditable) return;
    if (action !== 'add-team-member') return;
    if (isModalOpen) return;

    setEditingMember(null);
    setIsModalOpen(true);
  }, [action, isEditable, isModalOpen]);

  const handleSave = useCallback((member: TeamMember, isNew: boolean) => {
    if (isNew) {
      setMembers(prev => [...prev, member]);
    } else {
      setMembers(prev => prev.map(m => m.id === member.id ? member : m));
    }
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}><FaUsers /> Team Members</h3>
          {isEditable && (
            <button onClick={openAddModal} className={styles.addButton} type="button">
              <FaPlus /> Add Member
            </button>
          )}
        </div>
        {showSkeleton ? (
          <div className={styles.loadingGrid}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.loadingCard} />
            ))}
          </div>
        ) : (
          <div style={{ minHeight: '180px' }} />
        )}
      </div>
    );
  }

  if (members.length === 0 && !isEditable) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <FaUsers /> {isEditable ? 'Team Members' : 'Our Team'}
        </h3>
        {isEditable && (
          <button onClick={openAddModal} className={styles.addButton} type="button">
            <FaPlus /> Add Member
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <p className={styles.emptyText}>
          {isEditable 
            ? 'No team members added yet. Add your staff to showcase your team!'
            : 'No team members to display.'}
        </p>
      ) : (
        <div className={styles.grid}>
          {members.map((member) => (
            <div key={member.id} className={styles.card}>
              <div className={styles.avatar}>
                {member.image ? (
                  <Image src={member.image} alt={member.name} fill className={styles.avatarImage} />
                ) : (
                  <FaUser className={styles.avatarPlaceholder} />
                )}
              </div>
              <div className={styles.info}>
                <h4 className={styles.name}>{member.name}</h4>
                <p className={styles.role}>{member.role}</p>
                {member.experience && (
                  <p className={styles.experience}>{member.experience} years experience</p>
                )}
                {member.bio && <p className={styles.bio}>{member.bio}</p>}
                {member.specialties && member.specialties.length > 0 && (
                  <div className={styles.specialties}>
                    {member.specialties.map((s, i) => (
                      <span key={i} className={styles.specialty}>{s}</span>
                    ))}
                  </div>
                )}
                {member.services && member.services.length > 0 && (
                  <div className={styles.assignedServices}>
                    {member.services.slice(0, 3).map((service) => (
                      <span key={service.id} className={styles.assignedService}>
                        {service.title || service.name}
                      </span>
                    ))}
                  </div>
                )}
                {member.galleryImages && member.galleryImages.length > 0 && (
                  <div className={styles.memberGallery}>
                    {member.galleryImages.slice(0, 4).map((imageUrl) => (
                      <div key={imageUrl} className={styles.memberGalleryThumb}>
                        <Image
                          src={imageUrl}
                          alt={`${member.name} gallery image`}
                          fill
                          className={styles.memberGalleryImage}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {isEditable && (
                <div className={styles.actions}>
                  <button onClick={() => openEditModal(member)} className={styles.editBtn} type="button">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className={styles.deleteBtn} type="button">
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingMember={editingMember}
        salonId={salonId}
        availableServices={availableServices}
        onSave={handleSave}
      />
    </div>
  );
}
