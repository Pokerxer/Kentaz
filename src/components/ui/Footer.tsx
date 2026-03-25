import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Kentaz
            </Link>
            <p className="text-sm text-muted-foreground">
              Your destination for quality products and services.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">All Products</Link></li>
              <li><Link href="/products?category=featured" className="text-muted-foreground hover:text-foreground">Featured</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-foreground">Services</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/account" className="text-muted-foreground hover:text-foreground">My Account</Link></li>
              <li><Link href="/account/orders" className="text-muted-foreground hover:text-foreground">Orders</Link></li>
              <li><Link href="/account/bookings" className="text-muted-foreground hover:text-foreground">Bookings</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Kentaz. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
