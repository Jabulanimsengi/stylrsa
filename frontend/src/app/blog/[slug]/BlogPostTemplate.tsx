'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import styles from './BlogPost.module.css';

interface Author {
  name: string;
  bio?: string;
  image?: string;
  url?: string;
}

interface BlogPostProps {
  title: string;
  description: string;
  content: string; // HTML content
  author: Author;
  publishedDate: string;
  modifiedDate?: string;
  category: string;
  tags: string[];
  featuredImage: string;
  readingTime?: number;
  relatedPosts?: Array<{
    slug: string;
    title: string;
    excerpt: string;
    image: string;
  }>;
}

type BlogTrackingWindow = Window & {
  gtag?: (command: 'event', action: string, params?: Record<string, unknown>) => void;
};

/**
 * SEO-optimized blog post template with:
 * - Article schema markup
 * - Breadcrumb schema
 * - Author schema
 * - Reading time
 * - Social sharing
 * - Related posts for internal linking
 */
export default function BlogPostTemplate({
  title,
  description,
  content,
  author,
  publishedDate,
  modifiedDate,
  category,
  tags,
  featuredImage,
  readingTime = 5,
  relatedPosts = [],
}: BlogPostProps) {
  
  // Track reading progress for engagement metrics
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 75) {
        // Track 75% read completion
        const gtag = (window as BlogTrackingWindow).gtag;
        if (gtag) {
          gtag('event', 'blog_read_75', {
            article_title: title,
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [title]);

  // Generate Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: featuredImage,
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author: {
      '@type': 'Person',
      name: author.name,
      url: author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Stylr SA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.stylrsa.co.za/logo-transparent.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.stylrsa.co.za/blog/${title.toLowerCase().replace(/\s+/g, '-')}`,
    },
    keywords: tags.join(', '),
    articleSection: category,
    wordCount: content.split(/\s+/).length,
  };

  // Generate Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.stylrsa.co.za',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://www.stylrsa.co.za/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category,
        item: `https://www.stylrsa.co.za/blog?category=${category.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: title,
        item: `https://www.stylrsa.co.za/blog/${title.toLowerCase().replace(/\s+/g, '-')}`,
      },
    ],
  };

  return (
    <article className={styles.article}>
      {/* Schema markup */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb navigation */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={styles.separator}>/</span>
        <Link href="/blog">Blog</Link>
        <span className={styles.separator}>/</span>
        <Link href={`/blog?category=${category.toLowerCase()}`}>{category}</Link>
        <span className={styles.separator}>/</span>
        <span aria-current="page">{title}</span>
      </nav>

      {/* Article header */}
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.category}>{category}</span>
          <span className={styles.readingTime}>{readingTime} min read</span>
        </div>
        
        <h1 className={styles.title}>{title}</h1>
        
        <p className={styles.description}>{description}</p>

        <div className={styles.authorInfo}>
          {author.image && (
            <Image
              src={author.image}
              alt={`${author.name} - Author`}
              width={48}
              height={48}
              className={styles.authorImage}
            />
          )}
          <div>
            <p className={styles.authorName}>
              {author.url ? (
                <Link href={author.url}>{author.name}</Link>
              ) : (
                author.name
              )}
            </p>
            <time dateTime={publishedDate} className={styles.date}>
              {new Date(publishedDate).toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {modifiedDate && modifiedDate !== publishedDate && (
              <span className={styles.updated}>
                {' '}• Updated {new Date(modifiedDate).toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Featured image */}
      <div className={styles.featuredImage}>
        <Image
          src={featuredImage}
          alt={title}
          width={1200}
          height={630}
          priority
          className={styles.image}
        />
      </div>

      {/* Article content */}
      <div 
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div className={styles.tags}>
          <h3>Tags:</h3>
          <div className={styles.tagList}>
            {tags.map(tag => (
              <Link 
                key={tag}
                href={`/blog?tag=${tag.toLowerCase()}`}
                className={styles.tag}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Author bio */}
      {author.bio && (
        <div className={styles.authorBio}>
          <h3>About the Author</h3>
          {author.image && (
            <Image
              src={author.image}
              alt={author.name}
              width={80}
              height={80}
              className={styles.authorBioImage}
            />
          )}
          <div>
            <h4>{author.name}</h4>
            <p>{author.bio}</p>
          </div>
        </div>
      )}

      {/* Related posts for internal linking */}
      {relatedPosts.length > 0 && (
        <section className={styles.relatedPosts}>
          <h2>Related Articles</h2>
          <div className={styles.relatedGrid}>
            {relatedPosts.map(post => (
              <Link 
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={styles.relatedCard}
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={250}
                  className={styles.relatedImage}
                />
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Call to action */}
      <div className={styles.cta}>
        <h3>Ready to Book Your Beauty Appointment?</h3>
        <p>Find top-rated salons and beauty professionals near you on Stylr SA.</p>
        <Link href="/salons" className={styles.ctaButton}>
          Browse Salons
        </Link>
      </div>
    </article>
  );
}
