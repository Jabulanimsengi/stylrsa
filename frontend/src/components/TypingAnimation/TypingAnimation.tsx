'use client';

import { useState, useEffect } from 'react';
import styles from './TypingAnimation.module.css';

interface TypingAnimationProps {
    words: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    delayBetweenWords?: number;
}

export default function TypingAnimation({
    words = [],
    typingSpeed = 100,
    deletingSpeed = 50,
    delayBetweenWords = 2000,
}: TypingAnimationProps) {
    const [currentText, setCurrentText] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isInitialDelay, setIsInitialDelay] = useState(false);

    useEffect(() => {
        if (!words || words.length === 0) return;

        let timeoutId: NodeJS.Timeout;

        const handleTyping = () => {
            const fullWord = words[wordIndex % words.length];

            if (isInitialDelay) {
                // Done waiting, now let's start deleting
                setIsInitialDelay(false);
                timeoutId = setTimeout(handleTyping, deletingSpeed);
                return;
            }

            if (isDeleting) {
                // Delete one character
                setCurrentText(prev => prev.slice(0, -1));

                if (currentText === '') {
                    // Done deleting, move to next word and start typing
                    setIsDeleting(false);
                    setWordIndex(prev => prev + 1);
                    timeoutId = setTimeout(handleTyping, typingSpeed);
                } else {
                    // Continue deleting
                    timeoutId = setTimeout(handleTyping, deletingSpeed);
                }
            } else {
                // Type one character
                setCurrentText(fullWord.slice(0, currentText.length + 1));

                if (currentText === fullWord) {
                    // Done typing, wait then start deleting
                    setIsDeleting(true);
                    timeoutId = setTimeout(handleTyping, delayBetweenWords);
                } else {
                    // Continue typing
                    timeoutId = setTimeout(handleTyping, typingSpeed);
                }
            }
        };

        const startDelay = isInitialDelay ? delayBetweenWords : (isDeleting ? deletingSpeed : typingSpeed);
        // Initialize the typing cycle
        timeoutId = setTimeout(handleTyping, startDelay);

        return () => clearTimeout(timeoutId);
    }, [currentText, isDeleting, isInitialDelay, wordIndex, words, typingSpeed, deletingSpeed, delayBetweenWords]);

    if (!words || words.length === 0) return null;

    const longestWord = words.reduce((longest, word) => (
        word.length > longest.length ? word : longest
    ), '');

    return (
        <span className={styles.wrapper}>
            <span className={styles.sizer} aria-hidden="true">
                {longestWord}
                <span className={styles.cursorSpacer} />
            </span>
            <span className={styles.liveText} aria-live="polite" aria-atomic="true">
                <span className={styles.text}>{currentText}</span>
                <span className={styles.cursor} />
            </span>
        </span>
    );
}
