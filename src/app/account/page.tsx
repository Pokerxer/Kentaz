'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, Calendar, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  const menuItems = [
    { name: 'My Orders', href: '/account/orders', icon: Package, description: 'Track and manage your orders' },
    { name: 'Bookings', href: '/account/bookings', icon: Calendar, description: 'View your service bookings' },
    { name: 'Wishlist', href: '/account/wishlist', icon: Heart, description: 'Items you saved for later' },
    { name: 'Settings', href: '/account/settings', icon: Settings, description: 'Manage your account' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session.user?.name || session.user?.email}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <Card hover className="h-full">
              <CardContent className="p-6">
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="font-medium">{session.user?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="font-medium">{session.user?.email}</p>
            </div>
            <Link href="/account/settings">
              <Button variant="outline" size="sm">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
