'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './dialog';
import { Button } from './button';
import { LoadingButton } from './loading-button';
import { FaExclamationTriangle } from 'react-icons/fa';

export interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
}

function AlertDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel,
}: AlertDialogProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch (error) {
            console.error('AlertDialog confirm error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {variant === 'destructive' && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                <FaExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        )}
                        <div>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription className="mt-1">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <LoadingButton
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        loading={isLoading}
                    >
                        {confirmText}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { AlertDialog };
