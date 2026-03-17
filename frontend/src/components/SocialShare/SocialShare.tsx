'use client';

import { useState } from 'react';
import { FaShareAlt, FaFacebook, FaTwitter, FaWhatsapp, FaLink, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from './SocialShare.module.css';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: 'button' | 'dropdown' | 'inline';
}

export default function SocialShare({
  url,
  title,
  description = '',
  variant = 'button'
}: SocialShareProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleShare = async (platform: 'native' | 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    try {
      switch (platform) {
        case 'native':
          if (navigator.share) {
            await navigator.share({
              title,
              text: description || title,
              url
            });
          } else {
            // Fallback to copy
            await handleShare('copy');
          }
          break;

        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            '_blank',
            'width=600,height=400'
          );
          break;

        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            '_blank',
            'width=600,height=400'
          );
          break;

        case 'whatsapp':
          window.open(
            `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            '_blank'
          );
          break;

        case 'copy':
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
          break;
      }
      setShowDropdown(false);
    } catch (error) {
      if (platform !== 'native' || (error as Error).name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error('Failed to share. Please try again.');
      }
    }
  };

  if (variant === 'inline') {
    return (
      <div className={styles.inlineContainer}>
        <button
          onClick={() => handleShare('facebook')}
          className={styles.shareButton}
          aria-label="Share on Facebook"
        >
          <FaFacebook />
        </button>
        <button
          onClick={() => handleShare('twitter')}
          className={styles.shareButton}
          aria-label="Share on Twitter"
        >
          <FaTwitter />
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className={styles.shareButton}
          aria-label="Share on WhatsApp"
        >
          <FaWhatsapp />
        </button>
        <button
          onClick={() => handleShare('copy')}
          className={styles.shareButton}
          aria-label="Copy link"
        >
          <FaCopy />
        </button>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={styles.dropdownContainer}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={styles.shareButton}
          aria-label="Share"
        >
          <FaShareAlt />
          <span>Share</span>
        </button>
        {showDropdown && (
          <>
            <div className={styles.dropdownBackdrop} onClick={() => setShowDropdown(false)} />
            <div className={styles.dropdown}>
              <button
                onClick={() => handleShare('native')}
                className={styles.dropdownItem}
              >
                <FaShareAlt /> Share via...
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className={styles.dropdownItem}
              >
                <FaFacebook /> Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className={styles.dropdownItem}
              >
                <FaTwitter /> Twitter
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className={styles.dropdownItem}
              >
                <FaWhatsapp /> WhatsApp
              </button>
              <button
                onClick={() => handleShare('copy')}
                className={styles.dropdownItem}
              >
                <FaLink /> Copy Link
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={() => handleShare('native')}
      className={styles.shareButton}
      aria-label="Share"
    >
      <FaShareAlt />
      <span>Share</span>
    </button>
  );
}

