'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/cartSlice';
import { formatPrice } from '@/lib/utils';

interface PaystackConfig {
  email: string;
  amount: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  reference?: string;
  onSuccess: (reference: PaystackReference) => void;
  onClose: () => void;
}

export interface PaystackReference {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  gateway_response: string;
  channel: string;
  created_at: string;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: any) => { openIframe: () => void };
    };
  }
}

export function usePaystack() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    script.onerror = () => {
      setError('Failed to load Paystack payment gateway');
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializePayment = useCallback((config: Omit<PaystackConfig, 'reference'>) => {
    if (!window.PaystackPop) {
      setError('Paystack is not loaded. Please check your connection.');
      return;
    }

    const reference = `KENTAZ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setIsLoading(true);
    
    try {
      const paystack = window.PaystackPop.setup({
        ...config,
        reference,
        amount: config.amount * 100,
        currency: 'NGN',
        channels: ['card', 'bank', 'ussd', 'mobile_money'],
        metadata: {
          items: items.map(item => ({
            id: item.product.id,
            title: item.product.title,
            quantity: item.quantity,
            price: item.variant?.price || item.product.price,
          })),
          custom_fields: [
            {
              display_name: "Order Type",
              variable_name: "order_type",
              value: "ecommerce"
            }
          ]
        },
        onSuccess: (response: any) => {
          setIsLoading(false);
          config.onSuccess({
            reference: response.reference,
            status: response.status,
            amount: config.amount,
            currency: 'NGN',
            gateway_response: response.message,
            channel: response.channel,
            created_at: new Date().toISOString(),
          });
        },
        onClose: () => {
          setIsLoading(false);
          config.onClose();
        },
      });

      paystack.openIframe();
    } catch (err) {
      setIsLoading(false);
      setError('Failed to initialize payment. Please try again.');
    }
  }, [items]);

  const verifyPayment = async (reference: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });
      
      const data = await response.json();
      return data.success;
    } catch {
      return false;
    }
  };

  return {
    initializePayment,
    verifyPayment,
    isLoading,
    error,
    isReady: scriptLoaded.current,
  };
}

export function useShippingInfo() {
  const [shippingInfo, setShippingInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    deliveryMethod: 'standard' as 'standard' | 'express',
  });

  const updateShippingInfo = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const isValid = Object.values(shippingInfo).every(val => val !== '');

  return { shippingInfo, updateShippingInfo, isValid };
}

export function getDeliveryCost(deliveryMethod: 'standard' | 'express', subtotal: number): number {
  if (deliveryMethod === 'express') return 5000;
  return subtotal >= 50000 ? 0 : 2500;
}

export function calculateTotals(subtotal: number, deliveryCost: number) {
  const tax = subtotal * 0.075;
  const total = subtotal + deliveryCost + tax;
  return { tax, total };
}
