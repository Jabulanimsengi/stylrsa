'use client';

import { useMemo, useState } from 'react';
import { notify } from '@/lib/notify';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { getServiceDiscountedPrice, getServiceDiscountPercentage } from '@/lib/servicePricing';
import type { Service } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';

interface ServiceDiscountModalProps {
  service: Service;
  onClose: () => void;
  onSaved: (service: Service) => void;
}

export default function ServiceDiscountModal({
  service,
  onClose,
  onSaved,
}: ServiceDiscountModalProps) {
  const existingDiscount = getServiceDiscountPercentage(service);
  const [discountPercentage, setDiscountPercentage] = useState(
    existingDiscount ? String(existingDiscount) : '10',
  );
  const [isSaving, setIsSaving] = useState(false);

  const parsedDiscount = Number(discountPercentage);
  const previewService = useMemo(
    () => ({ ...service, discountPercentage: Number.isFinite(parsedDiscount) ? parsedDiscount : null }),
    [parsedDiscount, service],
  );
  const promotionalPrice = getServiceDiscountedPrice(previewService);
  const savings = Math.max(0, service.price - promotionalPrice);

  const handleSave = async () => {
    if (!Number.isFinite(parsedDiscount) || parsedDiscount < 1 || parsedDiscount > 95) {
      notify.error('Enter a discount percentage between 1 and 95.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedService = await apiJson<Service>(`/api/services/${service.id}/discount`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountPercentage: parsedDiscount }),
      });
      onSaved(updatedService);
      notify.success('Service discount saved.');
      onClose();
    } catch (error: unknown) {
      notify.error(toFriendlyMessage(error, 'Failed to save service discount.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    try {
      const updatedService = await apiJson<Service>(`/api/services/${service.id}/discount`, {
        method: 'DELETE',
      });
      onSaved(updatedService);
      notify.success('Service discount removed.');
      onClose();
    } catch (error: unknown) {
      notify.error(toFriendlyMessage(error, 'Failed to remove service discount.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl border border-neutral-200 bg-white p-0">
        <div className="p-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>Manage Service Discount</DialogTitle>
            <DialogDescription>
              Set a percentage discount for <strong>{service.title || service.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-sm font-semibold text-neutral-900">{service.title || service.name}</div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Original price</div>
                  <div className="mt-1 text-lg font-bold text-neutral-900">R{service.price.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Discounted price</div>
                  <div className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-900">R{promotionalPrice.toFixed(2)}</div>
                  <div className="mt-1 text-sm font-medium text-emerald-600">Save R{savings.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-900">Discount percentage</span>
              <input
                type="number"
                min={1}
                max={95}
                step={1}
                value={discountPercentage}
                onChange={(event) => setDiscountPercentage(event.target.value)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-base font-medium text-neutral-900 outline-none transition focus:border-neutral-900"
                placeholder="10"
              />
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            {existingDiscount ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isSaving}
                className="min-h-12 rounded-2xl border border-neutral-300 px-4 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove discount
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="min-h-12 flex-1 rounded-2xl bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : existingDiscount ? 'Update discount' : 'Add discount'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
