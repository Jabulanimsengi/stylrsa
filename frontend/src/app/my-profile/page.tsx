'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './MyProfilePage.module.css';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import AddressBook from '@/components/AddressBook/AddressBook';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { authStatus } = useAuth();
  const router = useRouter();


  useEffect(() => {
    // Don't redirect if still loading auth status
    if (authStatus === 'loading') {
      return;
    }

    if (authStatus === 'unauthenticated') {
      // Redirect to home with auth modal instead of /login page
      router.push('/?auth=login&redirect=/my-profile');
      return;
    }

    if (authStatus === 'authenticated') {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/users/me`, { credentials: 'include' });
          if (!res.ok) {
            const errorText = await res.text();
            console.error('[MyProfile] Failed to fetch profile:', res.status, errorText);
            throw new Error('Failed to fetch profile');
          }
          const data = await res.json();
          console.log('[MyProfile] Loaded profile data:', data);
          setProfile(data);
          // Handle null/undefined values from backend
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setPhoneNumber(data.phoneNumber || '');
        } catch (error) {
          console.error('[MyProfile] Error loading profile:', error);
          toast.error('Could not load your profile.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [authStatus, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName, lastName, phoneNumber }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[MyProfile] Failed to update profile:', res.status, errorText);
        throw new Error(`Failed to update profile: ${res.status}`);
      }

      const updatedData = await res.json();
      console.log('[MyProfile] Profile updated:', updatedData);
      setProfile(updatedData);
      // Also update the state values
      setFirstName(updatedData.firstName || '');
      setLastName(updatedData.lastName || '');
      setPhoneNumber(updatedData.phoneNumber || '');

      // Enhanced success notification
      toast.success(
        `✅ Profile updated successfully!\n👤 Your changes have been saved.`,
        { autoClose: 4000 }
      );
    } catch (error) {
      console.error('[MyProfile] Error updating profile:', error);
      toast.error('❌ Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || authStatus === 'loading') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Profile</h1>

        <div className={styles.card} aria-hidden>
          <div className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <Skeleton variant="rounded" style={{ width: '100%', height: 44, borderRadius: '0.5rem' }} />
            </div>
            <div className={styles.inputGroup}>
              <label>First Name</label>
              <Skeleton variant="rounded" style={{ width: '100%', height: 44, borderRadius: '0.5rem' }} />
            </div>
            <div className={styles.inputGroup}>
              <label>Last Name</label>
              <Skeleton variant="rounded" style={{ width: '100%', height: 44, borderRadius: '0.5rem' }} />
            </div>
            <div className={styles.buttonContainer}>
              <Skeleton variant="button" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Profile</h1>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={profile?.email || ''} disabled className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={styles.input}
            />
          </div>
            <div className={styles.inputGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
                className={styles.input}
              />
            </div>
          <div className={styles.inputGroup}>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Address Book Section */}
      <section className={styles.section}>
        <AddressBook />
      </section>
    </div>
  );
}
