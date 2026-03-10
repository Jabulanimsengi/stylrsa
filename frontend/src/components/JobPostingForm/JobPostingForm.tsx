'use client';

import { useState, useEffect } from 'react';
import { FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiJson, apiFetch } from '@/lib/api';
import styles from './JobPostingForm.module.css';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Checkbox,
} from '@/components/ui';

export interface JobPosting {
  id?: string;
  title: string;
  description: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP';
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';
  requirements?: string[];
  benefits?: string[];
  experienceLevel?: string;
  isRemote?: boolean;
  isActive: boolean;
  expiresAt?: string;
  createdAt?: string;
  _count?: { applications: number };
}

interface JobPostingFormProps {
  salonId: string;
  salonName: string;
  salonLocation: string;
}

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const SALARY_PERIODS = [
  { value: 'HOURLY', label: 'Per Hour' },
  { value: 'DAILY', label: 'Per Day' },
  { value: 'WEEKLY', label: 'Per Week' },
  { value: 'MONTHLY', label: 'Per Month' },
  { value: 'ANNUALLY', label: 'Per Year' },
];

export default function JobPostingForm({
  salonId,
  salonName,
  salonLocation,
}: JobPostingFormProps) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<JobPosting>>({
    title: '',
    description: '',
    jobType: 'FULL_TIME',
    salaryPeriod: 'MONTHLY',
    requirements: [],
    benefits: [],
    isActive: true,
  });
  const [requirementsText, setRequirementsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');

  // Fetch existing jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await apiJson<JobPosting[]>(`/api/jobs/salon/${salonId}?includeInactive=true`);
        setJobs(data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [salonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        jobType: formData.jobType,
        salaryMin: formData.salaryMin || null,
        salaryMax: formData.salaryMax || null,
        salaryPeriod: formData.salaryPeriod || null,
        requirements: requirementsText.split('\n').filter(r => r.trim()),
        benefits: benefitsText.split('\n').filter(b => b.trim()),
        experienceLevel: formData.experienceLevel || null,
        isRemote: formData.isRemote || false,
      };

      const newJob = await apiJson<JobPosting>(`/api/jobs/salon/${salonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      toast.success('Job posted successfully!');
      setJobs([newJob, ...jobs]);
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      await apiFetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success('Job posting deleted');
    } catch (error) {
      toast.error('Failed to delete job posting');
    }
  };

  const toggleJobStatus = async (job: JobPosting) => {
    try {
      const updated = await apiJson<JobPosting>(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !job.isActive }),
      });
      setJobs(jobs.map(j => j.id === job.id ? updated : j));
      toast.success(updated.isActive ? 'Job activated' : 'Job deactivated');
    } catch (error) {
      toast.error('Failed to update job status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      jobType: 'FULL_TIME',
      salaryPeriod: 'MONTHLY',
      requirements: [],
      benefits: [],
      isActive: true,
    });
    setRequirementsText('');
    setBenefitsText('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <FaBriefcase /> Job Postings
        </h3>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={styles.addButton}
        >
          {isFormOpen ? 'Cancel' : '+ Post a Job'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Job Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior Hairstylist"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Job Type *</label>
              <Select
                value={formData.jobType}
                onValueChange={(value) => setFormData({ ...formData, jobType: value as JobPosting['jobType'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role, responsibilities, and ideal candidate..."
              rows={4}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Salary Range (R)</label>
              <div className={styles.salaryInputs}>
                <input
                  type="number"
                  value={formData.salaryMin || ''}
                  onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) || undefined })}
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  value={formData.salaryMax || ''}
                  onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) || undefined })}
                  placeholder="Max"
                />
                <Select
                  value={formData.salaryPeriod}
                  onValueChange={(value) => setFormData({ ...formData, salaryPeriod: value as JobPosting['salaryPeriod'] })}
                >
                  <SelectTrigger style={{ minWidth: '120px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_PERIODS.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Experience Level</label>
              <Select
                value={formData.experienceLevel || '__none__'}
                onValueChange={(value) => setFormData({ ...formData, experienceLevel: value === '__none__' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select level</SelectItem>
                  <SelectItem value="Entry Level">Entry Level</SelectItem>
                  <SelectItem value="1-2 Years">1-2 Years</SelectItem>
                  <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                  <SelectItem value="5+ Years">5+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={styles.formGroup}>
              <Checkbox
                id="isRemote"
                checked={formData.isRemote || false}
                onCheckedChange={(checked) => setFormData({ ...formData, isRemote: checked === true })}
                label="Remote work available"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Requirements (one per line)</label>
            <textarea
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder="Valid cosmetology license&#10;2+ years experience&#10;Strong communication skills"
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Benefits (one per line)</label>
            <textarea
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              placeholder="Competitive commission&#10;Flexible schedule&#10;Ongoing training"
              rows={3}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => setIsFormOpen(false)} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      )}


      {/* Loading State */}
      {isLoading && (
        <p className={styles.emptyText}>Loading job postings...</p>
      )}

      {/* Existing Jobs List */}
      {!isLoading && jobs.length > 0 && (
        <div className={styles.jobsList}>
          <h4 className={styles.listTitle}>Your Job Postings</h4>
          {jobs.map((job) => (
            <div key={job.id} className={`${styles.jobCard} ${!job.isActive ? styles.inactive : ''}`}>
              <div className={styles.jobHeader}>
                <h5 className={styles.jobTitle}>{job.title}</h5>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`${styles.jobType} ${styles[job.jobType.toLowerCase()]}`}>
                    {JOB_TYPES.find(t => t.value === job.jobType)?.label}
                  </span>
                  {!job.isActive && <span className={styles.inactiveBadge}>Inactive</span>}
                </div>
              </div>
              <div className={styles.jobMeta}>
                <span><FaMapMarkerAlt /> {salonLocation}</span>
                {job.salaryMin && (
                  <span>
                    <FaMoneyBillWave /> R{job.salaryMin}
                    {job.salaryMax && ` - R${job.salaryMax}`}
                    {job.salaryPeriod && ` ${SALARY_PERIODS.find(t => t.value === job.salaryPeriod)?.label}`}
                  </span>
                )}
                {job._count?.applications !== undefined && (
                  <span><FaUsers /> {job._count.applications} application{job._count.applications !== 1 ? 's' : ''}</span>
                )}
              </div>
              <p className={styles.jobDescription}>
                {job.description.length > 150 ? `${job.description.slice(0, 150)}...` : job.description}
              </p>
              <div className={styles.jobActions}>
                <button
                  onClick={() => toggleJobStatus(job)}
                  className={styles.toggleBtn}
                >
                  {job.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(job.id!)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && jobs.length === 0 && !isFormOpen && (
        <p className={styles.emptyText}>
          No job postings yet. Click "Post a Job" to attract talented professionals to your salon.
        </p>
      )}
    </div>
  );
}
