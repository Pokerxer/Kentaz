export interface Product {
  id: string;
  title: string;
  description: string;
  handle: string;
  status: string;
  thumbnail?: string;
  images?: { url: string }[];
  variants?: Variant[];
  price?: Price;
  collection?: Collection;
  tags?: Tag[];
}

export interface Variant {
  id: string;
  title: string;
  sku?: string;
  inventory_quantity?: number;
  prices?: Price[];
  options?: Option[];
}

export interface Price {
  amount: number;
  currency_code: string;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
}

export interface Tag {
  id: string;
  value: string;
}

export interface Option {
  value: string;
  option: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  region?: Region;
  customer?: Customer;
}

export interface CartItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total: number;
  thumbnail?: string;
  variant?: Variant;
}

export interface Region {
  id: string;
  name: string;
  currency_code: string;
  countries?: { display_name: string }[];
}

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}
