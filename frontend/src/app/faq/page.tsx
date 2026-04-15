import { Metadata } from 'next';
import Script from 'next/script';
import styles from '../info-page.module.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

// FAQ data for both rendering and schema
const customerFAQs = [
  {
    question: 'How do I make a booking?',
    answer: "Find the salon and service you want, click \"Book on WhatsApp,\" choose your date and time, then submit your contact details. Stylr SA collects the booking details and continues the conversation with the salon on WhatsApp."
  },
  {
    question: 'How do I pay for my service?',
    answer: 'Payment is handled directly with the salon at the time of your appointment. Your booking on Stylr SA reserves your time slot.'
  },
  {
    question: 'How can I cancel or reschedule a booking?',
    answer: 'Please contact the salon directly on WhatsApp or by phone using the details on their profile so they can help you reschedule or cancel.'
  },
  {
    question: 'How do I leave a review?',
    answer: 'After your booking is marked as "Completed" by the salon, you will be prompted to leave a review. You can find this in your "My Bookings" dashboard.'
  },
  {
    question: "Why isn't my review showing up immediately?",
    answer: 'To maintain trust and authenticity, all reviews are verified by our admin team before they are published. This ensures all reviews are from real customers and are constructive.'
  },
  {
    question: 'How does the Chat feature work?',
    answer: 'Stylr SA uses a quick WhatsApp booking flow, so you can continue directly with the salon after you send your booking details.'
  }
];

const salonOwnerFAQs = [
  {
    question: 'How do I get my salon listed on Stylr SA?',
    answer: 'Use the salon owner signup flow, complete your salon setup, and submit your listing for review. Our team will review and approve your profile before it goes live.'
  },
  {
    question: 'Why are my gallery photos "Pending"?',
    answer: "To protect our customers and ensure a high-quality experience, our admin team quickly reviews all media uploads (Gallery, Videos, Before & After). Your media will go live as soon as it's approved, usually within a few business hours."
  },
  {
    question: 'How do I manage my bookings?',
    answer: 'All your appointments are in your "Dashboard." You will receive a notification for new booking requests, which you can then "Confirm" or "Reschedule." You can also view your full calendar here.'
  },
  {
    question: 'How do I respond to a customer review?',
    answer: "From your \"Reviews\" tab in your dashboard, you can see all your reviews. You'll have an option to write a public \"Salon Response\" to any approved review. We highly recommend responding to both positive and negative feedback!"
  }
];

// Combine all FAQs for schema
const allFAQs = [...customerFAQs, ...salonOwnerFAQs];

// FAQPage Schema for rich snippets
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allFAQs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
};

// Breadcrumb Schema
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'FAQ',
      item: `${siteUrl}/faq`
    }
  ]
};

export const metadata: Metadata = {
  title: '❓ FAQ - Frequently Asked Questions | Stylr SA Help Center',
  description: '✓ Find answers to common questions about booking, payments, salon management, and using Stylr SA. Get instant help for customers and salon partners.',
  keywords: 'FAQ, help center, frequently asked questions, Stylr SA support, booking help, salon management, how to book salon',
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
  openGraph: {
    title: 'FAQ - Stylr SA Help Center',
    description: 'Get answers to frequently asked questions about using Stylr SA for booking beauty services or managing your salon.',
    type: 'website',
    url: `${siteUrl}/faq`,
  },
};

export default function FaqPage() {
  return (
    <div className={styles.container}>
      {/* FAQPage Schema for rich snippets */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        strategy="beforeInteractive"
      />
      <Script
        id="faq-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="beforeInteractive"
      />

      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Frequently Asked Questions</h1>
        <p className={styles.paragraph}>Here are answers to our most common questions.</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>For Clients</h2>

          {customerFAQs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <p className={styles.faqQuestion}>{faq.question}</p>
              <p className={styles.faqAnswer}>{faq.answer}</p>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>For Salon Owners</h2>

          {salonOwnerFAQs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <p className={styles.faqQuestion}>{faq.question}</p>
              <p className={styles.faqAnswer}>{faq.answer}</p>
            </div>
          ))}
        </section>
      </section>
    </div>
  );
}
