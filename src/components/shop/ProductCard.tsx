'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Check, Star, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import { addToCart } from '@/store/cartSlice';

interface ProductVariant {
  id?: string;
  title?: string;
  size?: string;
  color?: string;
  price?: number;
  stock?: number;
  inventory_quantity?: number;
  prices?: { amount: number }[];
  options?: Record<string, string>;
}

interface Product {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  slug?: string;
  handle?: string;
  description?: string;
  thumbnail?: string;
  images?: { url: string }[];
  variants?: ProductVariant[];
  options?: { name: string; values: string[] }[];
  category?: string;
  tags?: string[] | { id?: string; value: string }[];
  ratings?: { avg?: number; count?: number };
  price?: { amount?: number };
}

interface ProductCardProps {
  product: {
    id?: string;
    _id?: string;
    name?: string;
    title?: string;
    slug?: string;
    handle?: string;
    description?: string;
    thumbnail?: string;
    images?: { url: string }[];
    variants?: ProductVariant[];
    options?: { name: string; values: string[] }[];
    category?: string;
    tags?: string[] | { id?: string; value: string }[];
    ratings?: { avg?: number; count?: number };
    price?: { amount?: number };
  };
  showCompare?: boolean;
  isComparing?: boolean;
  onCompareToggle?: (product: any) => void;
  onQuickView?: (product: any) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showHoverImage, setShowHoverImage] = useState(false);

  const productId = product.id || product._id || '';
  const isInWishlist = wishlistItems.some((item) => item.id === productId);

  const getPrice = () => {
    return product.variants?.[0]?.price || product.price?.amount || 0;
  };

  const price = getPrice();
  const images = product.images?.map(img => img.url) || [];
  if (product.thumbnail && !images.includes(product.thumbnail)) {
    images.unshift(product.thumbnail);
  }
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600');
  }

  const imageUrl = images[0];
  const hoverImageUrl = images[1] || imageUrl;
  const stock = product.variants?.[0]?.stock || 0;
  const isOutOfStock = stock === 0;
  const tagValues = product.tags?.map(t => typeof t === 'string' ? t : t.value) || [];
  const isBestseller = tagValues.includes('bestseller') || tagValues.includes('best-seller');
  const isFeatured = tagValues.includes('featured');
  const rating = product.ratings?.avg || 4.5;
  const reviewCount = product.ratings?.count || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    dispatch(addToCart({
      product: {
        id: productId,
        title: product.title || product.name || '',
        handle: product.handle || product.slug,
        thumbnail: product.thumbnail,
        images: product.images,
        price: product.variants?.[0]?.price || product.price?.amount,
      },
      quantity: 1,
      variant: product.variants?.[0] ? {
        id: product.variants[0].id,
        title: product.variants[0].size || product.variants[0].color,
        size: product.variants[0].size,
        color: product.variants[0].color,
        price: product.variants[0].price,
      } : undefined,
    }));

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeFromWishlist(productId));
    } else {
      dispatch(addToWishlist({ id: productId, title: product.title || product.name || '', handle: product.handle || product.slug, thumbnail: imageUrl }));
    }
  };

  const formatPrice = (amount: number) => '₦' + amount.toLocaleString('en-NG');

  return (
    <div className="group relative">
      <div
        className="relative overflow-hidden rounded-xl bg-muted/30"
        onMouseEnter={() => setShowHoverImage(true)}
        onMouseLeave={() => setShowHoverImage(false)}
      >
        <Link href={`/products/${product.slug || product.handle || productId}`}>
          <div className="relative aspect-[3/4] bg-muted/50">
            <Image
              src={imageUrl}
              alt={product.title || product.name || 'Product'}
              fill
              className={`object-cover transition-opacity duration-500 ${showHoverImage ? 'opacity-0' : 'opacity-100'}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {hoverImageUrl && (
              <Image
                src={hoverImageUrl}
                alt={`${product.title || product.name || 'Product'} hover`}
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
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-4 text-center">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-2">
            {product.name}
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
        </div>
      </div>
    </div>
  );
}

export function ProductListCard({ product }: { product: ProductCardProps['product'] }) {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const [addedToCart, setAddedToCart] = useState(false);

  const productId = product.id || product._id || '';
  const isInWishlist = wishlistItems.some((item) => item.id === productId);

  const price = product.variants?.[0]?.price || product.price?.amount || 0;
  const imageUrl = product.thumbnail || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
  const stock = product.variants?.[0]?.stock || product.variants?.[0]?.inventory_quantity || 0;
  const isOutOfStock = stock === 0;
  const rating = product.ratings?.avg || 4.5;
  const reviewCount = product.ratings?.count || 0;

  const formatPrice = (amount: number) => '₦' + amount.toLocaleString('en-NG');

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    dispatch(addToCart({
      product: {
        id: productId,
        title: product.title || product.name || '',
        handle: product.handle || product.slug,
        thumbnail: product.thumbnail,
        images: product.images,
        price: product.variants?.[0]?.price || product.price?.amount,
      },
      quantity: 1,
    }));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(productId));
    } else {
      dispatch(addToWishlist({ id: productId, title: product.title || product.name || '', handle: product.handle || product.slug, thumbnail: imageUrl }));
    }
  };

  return (
    <div className={`group relative flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-6 bg-white border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 ${isOutOfStock ? 'opacity-60' : ''}`}>
      <div className="relative w-full md:w-60 flex-shrink-0">
        <Link href={`/products/${product.slug || product.handle || productId}`}>
          <div className="relative aspect-[3/4] md:aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt={product.title || product.name || 'Product'}
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
          </div>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-3">
          {product.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              {product.category}
            </p>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-600 transition-colors">
              {product.name}
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
          {product.description || 'Premium quality product from our collection.'}
        </p>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl font-bold text-gray-900">{formatPrice(price)}</span>
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
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  );
}

export function ProductListView({ products, loading }: { products: Product[]; loading?: boolean }) {
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
        <ProductListCard key={product._id} product={product} />
      ))}
    </div>
  );
}
