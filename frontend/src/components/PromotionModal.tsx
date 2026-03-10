'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { Promotion } from '@/types';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@/components/ui';

interface PromotionModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onPromotionAdded: (promotion: Promotion) => void;
  salonId: string;
  serviceId?: string;
  productId?: string;
}

export default function PromotionModal({
  isOpen = true,
  onClose,
  onPromotionAdded,
  salonId,
  serviceId,
  productId
}: PromotionModalProps) {
  const [description, setDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await apiJson<Promotion>('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          discountPercentage: Number(discountPercentage),
          startDate,
          endDate,
          salonId,
          serviceId,
          productId,
        }),
      });
      toast.success('Promotion created!');
      onPromotionAdded(data);
      onClose();
    } catch (error: any) {
      toast.error(toFriendlyMessage(error, 'Could not create promotion.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Promotion</DialogTitle>
          <DialogDescription>
            Set up a discount for your services or products
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Summer Sale - 20% off all services"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountPercentage">Discount (%)</Label>
            <Input
              id="discountPercentage"
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              placeholder="10"
              required
              min={1}
              max={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Create Promotion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
