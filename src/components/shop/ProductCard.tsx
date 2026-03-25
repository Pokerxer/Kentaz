'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Check, Star, RotateCcw, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import { addToCart } from '@/store/cartSlice';
import { formatPrice } from '@/lib/utils';

interface ProductOption {
  name: string;
  values: string[];
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
  variants?: { prices?: { amount: number }[]; inventory_quantity?: number; options?: Record<string, string> }[];
  options?: ProductOption[];
  collection?: { title: string; handle?: string };
  tags?: { id?: string; value: string }[];
  rating?: number;
  review_count?: number;
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  showCompare?: boolean;
  isComparing?: boolean;
  onCompareToggle?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView, showCompare, isComparing, onCompareToggle }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showHoverImage, setShowHoverImage] = useState(false);

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);
  
  const getPrice = () => {
    if (product.price?.amount) return product.price.amount;
    if (product.variants?.[0]?.prices?.[0]?.amount) return product.variants[0].prices[0].amount;
    return 0;
  };

  const price = getPrice();
  const originalPrice = product.original_price || price * 1.25;
  const hasDiscount = originalPrice > price;
  const discount = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;
  
  const images = [product.thumbnail];
  if (product.images) {
    product.images.forEach((img) => {
      if (!images.includes(img.url)) images.push(img.url);
    });
  }
  
  const imageUrl = images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
  const hoverImageUrl = images[1] || imageUrl;
  const title = product.title || 'Product';
  const stock = product.variants?.[0]?.inventory_quantity || 0;
  const isOutOfStock = stock === 0;
  const isBestseller = product.tags?.some((t) => t.value === 'bestseller');
  const rating = product.rating || 4.5;
  const reviewCount = product.review_count || 12;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    dispatch(addToCart({
      product: {
        id: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        handle: product.handle,
        price: product.price,
      },
      quantity: 1,
    }));
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist({ id: product.id, title, thumbnail: imageUrl, handle: product.handle }));
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompareToggle?.(product);
  };

  return (
    <div className="group relative">
      <div 
        className="relative overflow-hidden rounded-xl bg-muted/30"
        onMouseEnter={() => setShowHoverImage(true)}
        onMouseLeave={() => setShowHoverImage(false)}
      >
        <Link href={`/products/${product.handle}`}>
          <div className="relative aspect-[3/4] bg-muted/50">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className={`object-cover transition-opacity duration-500 ${showHoverImage ? 'opacity-0' : 'opacity-100'}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {hoverImageUrl && (
              <Image
                src={hoverImageUrl}
                alt={`${title} hover`}
                fill
                className={`object-cover absolute inset-0 transition-opacity duration-500 ${showHoverImage ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
            
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="bg-gray-900 text-white px-4 py-2 text-sm font-medium">
                  Out of Stock
                </span>
              </div>
            )}

            {discount > 0 && (
              <div className="absolute top-3 left-3">
                <span className="bg-red-500 text-white px-2 py-1 text-xs font-medium">
                  -{discount}%
                </span>
              </div>
            )}

            {isBestseller && (
              <div className="absolute top-3 right-3">
                <span className="bg-amber-500 text-white px-2 py-1 text-xs font-medium">
                  Best Seller
                </span>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onQuickView) {
                    onQuickView(product);
                  } else {
                    handleAddToCart(e);
                  }
                }}
                disabled={addedToCart || isOutOfStock}
                className={`w-full py-3 rounded-lg font-medium text-sm transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-900 hover:bg-gray-900 hover:text-white shadow-lg'
                }`}
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" />
                    Added
                  </span>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </span>
                )}
              </button>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
              <button
                onClick={handleWishlist}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isInWishlist 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-red-500 hover:text-white'
                }`}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
              
              {onQuickView && (
                <button
                  onClick={(e) => { e.preventDefault(); onQuickView(product); }}
                  className="w-9 h-9 rounded-full bg-white text-gray-700 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-md"
                  aria-label="Quick view"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              
              {showCompare && (
                <button
                  onClick={handleCompare}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
                    isComparing 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-900 hover:text-white'
                  }`}
                  aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-4 text-center">
        <Link href={`/products/${product.handle}`}>
          <h3 className="font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        <div className="flex items-center justify-center gap-1 mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(rating) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : i < rating 
                    ? 'fill-yellow-400/50 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="font-semibold text-gray-900">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>


      </div>
    </div>
  );
}

export function ProductListCard({ 
  product, 
  onCompareToggle,
  isComparing,
  showCompare 
}: { 
  product: Product; 
  onCompareToggle?: (product: Product) => void;
  isComparing?: boolean;
  showCompare?: boolean;
}) {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const [addedToCart, setAddedToCart] = useState(false);

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);
  
  const getPrice = () => {
    if (product.price?.amount) return product.price.amount;
    if (product.variants?.[0]?.prices?.[0]?.amount) return product.variants[0].prices[0].amount;
    return 0;
  };

  const price = getPrice();
  const originalPrice = product.original_price || price * 1.25;
  const hasDiscount = originalPrice > price;
  const discount = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;
  const imageUrl = product.thumbnail || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
  const title = product.title || 'Product';
  const stock = product.variants?.[0]?.inventory_quantity || 0;
  const isOutOfStock = stock === 0;
  const rating = product.rating || 4.5;
  const reviewCount = product.review_count || 12;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    dispatch(addToCart({
      product: {
        id: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        handle: product.handle,
        price: product.price,
      },
      quantity: 1,
    }));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist({ id: product.id, title, thumbnail: imageUrl, handle: product.handle }));
    }
  };

  return (
    <div className={`group relative flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 ${isOutOfStock ? 'opacity-60' : ''}`}>
      <div className="relative w-full md:w-60 flex-shrink-0">
        <Link href={`/products/${product.handle}`}>
          <div className="relative aspect-[3/4] md:aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 240px"
            />
            
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="bg-gray-900 text-white px-4 py-2 text-sm font-medium">
                  Out of Stock
                </span>
              </div>
            )}

            {discount > 0 && (
              <div className="absolute top-3 left-3">
                <span className="bg-red-500 text-white px-2 py-1 text-xs font-medium">
                  -{discount}%
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-3">
          {product.collection && (
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              {product.collection.title}
            </p>
          )}
          <Link href={`/products/${product.handle}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-600 transition-colors">
              {title}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : i < rating 
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {product.description || 'Premium quality product from our collection. Made with the finest materials for lasting comfort and style.'}
        </p>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl font-bold text-gray-900">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>



        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAddToCart}
            disabled={addedToCart || isOutOfStock}
            className={`px-8 py-3 rounded-lg font-medium transition-all ${
              addedToCart
                ? 'bg-green-600 text-white'
                : isOutOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {addedToCart ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Added
              </span>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </span>
            )}
          </button>
          
          <button
            onClick={handleWishlist}
            className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-all ${
              isInWishlist 
                ? 'bg-red-500 text-white border-red-500' 
                : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
            }`}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          
          {showCompare && (
            <button
              onClick={() => onCompareToggle?.(product)}
              className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-all ${
                isComparing 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
              }`}
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductListView({ 
  products, 
  loading, 
  showCompare,
  compareList,
  onCompareToggle 
}: { 
  products: Product[]; 
  loading?: boolean;
  showCompare?: boolean;
  compareList?: Product[];
  onCompareToggle?: (product: Product) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-6 p-4 bg-white border border-gray-100 rounded-xl animate-pulse">
            <div className="w-60 h-60 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl">
        <p className="text-lg font-medium mb-2">No products found</p>
        <p className="text-gray-500">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {products.map((product) => (
        <ProductListCard 
          key={product.id} 
          product={product}
          showCompare={showCompare}
          isComparing={compareList?.some(p => p.id === product.id)}
          onCompareToggle={onCompareToggle}
        />
      ))}
    </div>
  );
}
