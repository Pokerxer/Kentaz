'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingCart, Check, Heart, Star, Truck, Shield, RotateCcw, ArrowRight } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/cartSlice';
import { formatPrice } from '@/lib/utils';

interface ProductOption {
  name: string;
  values: string[];
}

interface ProductVariant {
  id: string;
  title: string;
  options?: Record<string, string>;
  inventory_quantity: number;
  prices: { amount: number }[];
}

interface Product {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  handle?: string;
  images?: { url: string }[];
  price?: { amount: number; currency_code?: string };
  original_price?: number;
  variants?: ProductVariant[];
  options?: ProductOption[];
  collection?: { title: string; handle?: string };
  tags?: { id?: string; value: string }[];
  rating?: number;
  review_count?: number;
}

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  blue: '#1E40AF',
  navy: '#1E3A8A',
  red: '#DC2626',
  tan: '#D2B48C',
  cognac: '#9A6324',
  burgundy: '#722F37',
  nude: '#E3BC9A',
  brown: '#8B4513',
  pink: '#EC4899',
  green: '#059669',
  yellow: '#FACC15',
  purple: '#7C3AED',
  gray: '#6B7280',
  grey: '#6B7280',
  silver: '#C0C0C0',
  gold: '#FFD700',
  cream: '#FFFDD0',
  beige: '#F5F5DC',
  orange: '#F97316',
  emerald: '#10B981',
};

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const dispatch = useAppDispatch();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      setAddedToCart(false);
      
      if (product.options) {
        const defaults: Record<string, string> = {};
        product.options.forEach((opt) => {
          if (opt.values.length > 0) {
            defaults[opt.name] = opt.values[0];
          }
        });
        setSelectedOptions(defaults);
      }
      
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product?.variants && Object.keys(selectedOptions).length > 0) {
      const variant = product.variants.find(v => {
        if (!v.options) return false;
        return Object.entries(selectedOptions).every(([key, value]) => v.options![key] === value);
      });
      if (variant) {
        setSelectedVariant(variant);
      }
    }
  }, [selectedOptions, product]);

  if (!product) return null;

  const images: string[] = [];
  if (product.thumbnail) images.push(product.thumbnail);
  if (product.images) {
    product.images.forEach((img) => {
      if (!images.includes(img.url)) images.push(img.url);
    });
  }
  if (images.length === 0) images.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600');
  
  while (images.length < 4) images.push(images[0]);

  const price = selectedVariant?.prices?.[0]?.amount || product.price?.amount || 0;
  const originalPrice = product.original_price || (product.variants?.[0]?.prices?.[0]?.amount ? product.variants[0].prices[0].amount * 1.25 : price * 1.25);
  const hasDiscount = originalPrice > price;
  const discount = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;
  const inventory = selectedVariant?.inventory_quantity || product.variants?.[0]?.inventory_quantity || 0;
  const isOutOfStock = inventory === 0;
  const rating = product.rating || 4.5;
  const reviewCount = product.review_count || 0;
  const isBestseller = product.tags?.some((t) => t.value === 'bestseller');
  const isFeatured = product.tags?.some((t) => t.value === 'featured');

  const getColorHex = (colorName: string): string => {
    const key = colorName.toLowerCase().replace(/\s+/g, '');
    return COLOR_MAP[key] || '#9CA3AF';
  };

  const isLightColor = (colorName: string): boolean => {
    return ['white', 'cream', 'beige', 'nude', 'yellow', 'silver'].some(
      c => colorName.toLowerCase().includes(c)
    );
  };

  const handleAddToCart = () => {
    if (isOutOfStock || !product) return;
    
    dispatch(addToCart({
      product: {
        id: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        handle: product.handle,
        price: product.price?.amount || 0,
      },
      quantity,
      variant: selectedVariant ? {
        id: selectedVariant.id,
        title: selectedVariant.title,
        options: selectedOptions,
        price: selectedVariant.prices?.[0]?.amount,
      } : undefined,
    }));
    
    setAddedToCart(true);
    window.dispatchEvent(new CustomEvent('open-cart'));
    setTimeout(() => {
      setAddedToCart(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Quick View</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-4 md:p-6">
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-2xl bg-gray-100 overflow-hidden">
                    <Image
                      src={images[selectedImage]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {discount > 0 && (
                        <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-lg">
                          -{discount}% OFF
                        </span>
                      )}
                      {isFeatured && (
                        <span className="bg-amber-500 text-white px-3 py-1 text-xs font-bold rounded-lg">
                          Featured
                        </span>
                      )}
                      {isBestseller && (
                        <span className="bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-lg">
                          Best Seller
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.slice(0, 4).map((image, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedImage(index)}
                          className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImage === index 
                              ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${product.title} ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="mb-4">
                    {product.collection && (
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {product.collection.title}
                      </p>
                    )}
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(rating) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : i < rating 
                                ? 'fill-yellow-400/50 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {rating > 0 ? `${rating} (${reviewCount})` : 'No reviews'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">
                      {formatPrice(price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-6 line-clamp-3">
                    {product.description}
                  </p>

                  {product.options && product.options.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {product.options.map((option) => (
                        <div key={option.name}>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-900">
                              {option.name}
                            </label>
                            {selectedOptions[option.name] && (
                              <span className="text-sm text-gray-500">
                                {selectedOptions[option.name]}
                              </span>
                            )}
                          </div>
                          
                          {option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour' ? (
                            <div className="flex flex-wrap gap-2">
                              {option.values.map((value) => {
                                const isSelected = selectedOptions[option.name] === value;
                                const colorHex = getColorHex(value);
                                const light = isLightColor(value);
                                
                                return (
                                  <motion.button
                                    key={value}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                                    className={`relative w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                                      isSelected 
                                        ? 'ring-2 ring-gray-900 ring-offset-2' 
                                        : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                                    }`}
                                    style={{ backgroundColor: colorHex }}
                                    title={value}
                                  >
                                    {isSelected && (
                                      <Check className={`h-5 w-5 ${light ? 'text-gray-900' : 'text-white'}`} />
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {option.values.map((value) => {
                                const isSelected = selectedOptions[option.name] === value;
                                const variantWithOption = product.variants?.find(
                                  v => v.options && v.options[option.name] === value
                                );
                                const variantPrice = variantWithOption?.prices?.[0]?.amount;
                                const isUnavailable = variantWithOption && variantWithOption.inventory_quantity === 0;
                                
                                return (
                                  <motion.button
                                    key={value}
                                    whileHover={!isUnavailable ? { scale: 1.05 } : {}}
                                    whileTap={!isUnavailable ? { scale: 0.95 } : {}}
                                    onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                                    disabled={isUnavailable}
                                    className={`min-w-[60px] px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                                      isSelected
                                        ? 'border-gray-900 bg-gray-900 text-white'
                                        : isUnavailable
                                        ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-400'
                                    }`}
                                  >
                                    {value}
                                    {variantPrice && variantPrice !== price && (
                                      <span className={`block text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {formatPrice(variantPrice)}
                                      </span>
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-50 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <motion.span
                        key={quantity}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="w-14 text-center font-bold text-lg"
                      >
                        {quantity}
                      </motion.span>
                      <button
                        onClick={() => setQuantity(Math.min(inventory, quantity + 1))}
                        className="p-3 hover:bg-gray-50 transition-colors"
                        disabled={quantity >= inventory}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-gray-700'}`}>
                        {isOutOfStock ? 'Out of stock' : `${inventory} in stock`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-6">
                    <motion.button
                      whileHover={!isOutOfStock && !addedToCart ? { scale: 1.02 } : {}}
                      whileTap={!isOutOfStock && !addedToCart ? { scale: 0.98 } : {}}
                      onClick={handleAddToCart}
                      disabled={addedToCart || isOutOfStock}
                      className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-lg ${
                        addedToCart
                          ? 'bg-green-500 text-white'
                          : isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-900 text-white hover:bg-gray-800 shadow-xl'
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <Check className="h-6 w-6" />
                          Added!
                        </>
                      ) : isOutOfStock ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <ShoppingCart className="h-6 w-6" />
                          Add to Cart
                        </>
                      )}
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <Truck className="h-5 w-5 text-gray-700 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Free Ship</p>
                    </div>
                    <div className="text-center border-x border-gray-200">
                      <Shield className="h-5 w-5 text-gray-700 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Secure Pay</p>
                    </div>
                    <div className="text-center">
                      <RotateCcw className="h-5 w-5 text-gray-700 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Easy Returns</p>
                    </div>
                  </div>

                  <Link
                    href={`/products/${product.handle}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 mt-4 py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                  >
                    View full details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}