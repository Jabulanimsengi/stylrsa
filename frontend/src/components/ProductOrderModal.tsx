'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { apiJson } from '@/lib/api';
import { toast } from 'react-toastify';
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
  Textarea,
  Label,
} from '@/components/ui';

interface ProductOrderModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProductOrderModal({ product, isOpen, onClose, onSuccess }: ProductOrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = quantity * product.price;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiJson('/api/product-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          deliveryMethod: deliveryMethod || undefined,
          contactPhone: contactPhone || undefined,
          notes: notes || undefined,
        }),
      });
      toast.success('Order placed successfully');
      onSuccess?.();
      onClose();
      setQuantity(1);
      setDeliveryMethod('');
      setContactPhone('');
      setNotes('');
    } catch (error) {
      toast.error(toFriendlyMessage(error, 'Could not create order'));
    } finally {
      setIsSubmitting(false);
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
          <DialogTitle>Order {product.name}</DialogTitle>
          <DialogDescription>
            Complete your order details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={product.stock ?? undefined}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
            {product.stock !== undefined && (
              <p className="text-sm text-muted-foreground">In stock: {product.stock}</p>
            )}
          </div>

          {/* Delivery Method */}
          <div className="space-y-2">
            <Label htmlFor="deliveryMethod">Delivery preference</Label>
            <Input
              id="deliveryMethod"
              type="text"
              placeholder="Courier, pickup, etc."
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact phone</Label>
            <Input
              id="contactPhone"
              type="tel"
              placeholder="Provide a phone number"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes for the seller</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Add any special requests or delivery details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Total Summary */}
          <div className="flex items-center justify-between py-3 border-t border-b">
            <span className="font-medium">Total</span>
            <strong className="text-lg">R{total.toFixed(2)}</strong>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Placing order…' : 'Confirm Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
