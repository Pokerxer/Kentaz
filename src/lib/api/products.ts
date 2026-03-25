const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

export interface Product {
  id: string;
  title: string;
  description?: string;
  handle?: string;
  thumbnail?: string;
  images?: { url: string }[];
  price?: { amount: number; currency_code?: string };
  original_price?: number;
  variants?: { prices?: { amount: number }[]; inventory_quantity?: number; options?: Record<string, string> }[];
  options?: { name: string; values: string[] }[];
  collection?: { title: string; handle?: string };
  tags?: { id?: string; value: string }[];
  rating?: number;
  review_count?: number;
}

export interface ProductsResponse {
  products: Product[];
  count: number;
  offset: number;
  total: number;
}

export async function getProducts(params?: {
  limit?: number;
  offset?: number;
  q?: string;
  collection_id?: string;
}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());
  if (params?.q) searchParams.set('q', params.q);
  if (params?.collection_id) searchParams.set('collection_id', params.collection_id);

  const res = await fetch(`${API_BASE}/api/store/products?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getProduct(id: string): Promise<{ product: Product }> {
  const res = await fetch(`${API_BASE}/api/store/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function getFeaturedProducts(limit = 8): Promise<ProductsResponse> {
  return getProducts({ limit });
}

export async function getBestSellers(limit = 10): Promise<ProductsResponse> {
  return getProducts({ limit });
}