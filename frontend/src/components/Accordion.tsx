'use client';

// frontend/src/components/Accordion.tsx
// Upgraded to Radix UI while maintaining backward compatibility
import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import styles from './Accordion.module.css';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  initialOpen?: boolean;
}

// Single-item accordion wrapper for backward compatibility
const Accordion: React.FC<AccordionProps> = ({ title, children, initialOpen = false }) => {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      defaultValue={initialOpen ? 'item-1' : undefined}
    >
      <AccordionPrimitive.Item value="item-1" className={styles.accordionItem}>
        <AccordionPrimitive.Header className={styles.accordionHeaderWrapper}>
          <AccordionPrimitive.Trigger className={styles.accordionHeader}>
            <span>{title}</span>
            <span className={styles.icon} aria-hidden />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className={styles.accordionContentWrapper}>
          <div className={styles.accordionContent}>
            {children}
          </div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
};

export default Accordion;

// Also export the full Radix primitives for advanced usage
export {
  AccordionPrimitive as AccordionRoot,
};
