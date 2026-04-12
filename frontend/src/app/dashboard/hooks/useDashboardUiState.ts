'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Service } from '@/types';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { getDashboardPath, type TabId } from '../dashboard-config';

export type DashboardDeleteTarget = 'service' | 'promotion' | 'gallery';

interface UseDashboardUiStateOptions {
  initialTab: TabId;
  router: AppRouterInstance;
  searchParams: ReadonlyURLSearchParams;
  ownerId?: string | null;
  userRole?: string | null;
  setSelectedPlanForUpgrade: (plan: 'PREMIUM' | null) => void;
}

export function useDashboardUiState({
  initialTab,
  router,
  searchParams,
  ownerId,
  userRole,
  setSelectedPlanForUpgrade,
}: UseDashboardUiStateOptions) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSectionNavigating, setIsSectionNavigating] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSimpleServiceModalOpen, setIsSimpleServiceModalOpen] = useState(false);
  const [isEditSalonModalOpen, setIsEditSalonModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: DashboardDeleteTarget } | null>(null);
  const [activeBookingTab, setActiveBookingTab] = useState<'pending' | 'confirmed' | 'past'>('pending');
  const [activeMainTab, setActiveMainTab] = useState<TabId>(initialTab);
  const [selectedServiceForPromo, setSelectedServiceForPromo] = useState<Service | null>(null);
  const [isCreatePromoModalOpen, setIsCreatePromoModalOpen] = useState(false);
  const [discountService, setDiscountService] = useState<Service | null>(null);
  const [isServiceDiscountModalOpen, setIsServiceDiscountModalOpen] = useState(false);
  const [bookingToComplete, setBookingToComplete] = useState<string | null>(null);

  useEffect(() => {
    setActiveMainTab(initialTab);
    setIsSectionNavigating(false);
  }, [initialTab, router, searchParams, setSelectedPlanForUpgrade]);

  const navigateToTab = useCallback((tab: TabId) => {
    if (tab === activeMainTab) return;

    setIsSectionNavigating(true);
    setActiveMainTab(tab);

    const params = new URLSearchParams();
    if (userRole === 'ADMIN' && ownerId) {
      params.set('ownerId', ownerId);
    }

    const queryString = params.toString();
    const path = getDashboardPath(tab);
    router.push(queryString ? `${path}?${queryString}` : path);
  }, [activeMainTab, ownerId, router, userRole]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };

    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileNavOpen]);

  const openServiceModalToAdd = useCallback(() => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  }, []);

  const openServiceModalToEdit = useCallback((service: Service) => {
    setEditingService(service);
    if (!service.images || service.images.length === 0) {
      setIsSimpleServiceModalOpen(true);
    } else {
      setIsServiceModalOpen(true);
    }
  }, []);

  const openDiscountModal = useCallback((service: Service) => {
    setDiscountService(service);
    setIsServiceDiscountModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id: string, type: DashboardDeleteTarget) => {
    setItemToDelete({ id, type });
  }, []);

  const handleCloseServiceModal = useCallback(() => {
    setIsServiceModalOpen(false);
    setEditingService(null);
  }, []);

  const handleCloseSimpleServiceModal = useCallback(() => {
    setIsSimpleServiceModalOpen(false);
    setEditingService(null);
  }, []);

  const handleCreatePromotionModalClose = useCallback(() => {
    setIsCreatePromoModalOpen(false);
    setSelectedServiceForPromo(null);
  }, []);

  const handleCloseServiceDiscountModal = useCallback(() => {
    setIsServiceDiscountModalOpen(false);
    setDiscountService(null);
  }, []);

  return {
    mobileNavOpen,
    isSectionNavigating,
    isServiceModalOpen,
    isSimpleServiceModalOpen,
    isEditSalonModalOpen,
    isGalleryModalOpen,
    isPromotionModalOpen,
    editingService,
    itemToDelete,
    activeBookingTab,
    activeMainTab,
    selectedServiceForPromo,
    isCreatePromoModalOpen,
    discountService,
    isServiceDiscountModalOpen,
    bookingToComplete,
    setMobileNavOpen,
    setIsEditSalonModalOpen,
    setIsGalleryModalOpen,
    setIsPromotionModalOpen,
    setItemToDelete,
    setActiveBookingTab,
    setSelectedServiceForPromo,
    setIsCreatePromoModalOpen,
    setDiscountService,
    setIsServiceDiscountModalOpen,
    setBookingToComplete,
    navigateToTab,
    openServiceModalToAdd,
    openServiceModalToEdit,
    openDiscountModal,
    handleDeleteClick,
    handleCloseServiceModal,
    handleCloseSimpleServiceModal,
    handleCreatePromotionModalClose,
    handleCloseServiceDiscountModal,
  };
}
