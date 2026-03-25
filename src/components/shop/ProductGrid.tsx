'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProductSkeleton } from '@/components/ui/Skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToWishlist, removeFromWishlist } from '@/store/wishlistSlice';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  thumbnail?: string;
  handle?: string;
  images?: { url: string }[];
  price?: { amount: number };
  variants?: { prices?: { amount: number }[] }[];
  collection?: { title: string };
  tags?: { value: string }[];
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const dispatch = useAppDispatch();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  const getPrice = (product: Product) => {
    if (product.price?.amount) return product.price.amount;
    if (product.variants?.[0]?.prices?.[0]?.amount) return product.variants[0].prices[0].amount;
    return 0;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const isInWishlist = wishlistItems.some((item) => item.id === product.id);
        const price = getPrice(product);
        const imageUrl = product.thumbnail || product.images?.[0]?.url || '/placeholder.jpg';
        const title = product.title || 'Product';

        return (
          <Card key={product.id} hover className="group overflow-hidden">
            <div className="relative aspect-square bg-muted">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              
              {product.tags?.some((t) => t.value === 'featured') && (
                <Badge className="absolute top-3 left-3" variant="secondary">
                  Featured
                </Badge>
              )}

              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isInWishlist) {
                      dispatch(removeFromWishlist(product.id));
                    } else {
                      dispatch(addToWishlist({ id: product.id, title, thumbnail: imageUrl, handle: product.handle }));
                    }
                  }}
                  className="p-2 rounded-full bg-background/90 backdrop-blur hover:bg-background transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 ${isInWishlist ? 'fill-primary text-primary' : ''}`}
                  />
                </button>
              </div>
            </div>

            <div className="p-4">
              <Link href={`/products/${product.handle}`}>
                <h3 className="font-medium line-clamp-1 hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {product.collection?.title || 'Uncategorized'}
                </p>
              </Link>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{formatPrice(price)}</p>
                </div>
                <Link href={`/products/${product.handle}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
