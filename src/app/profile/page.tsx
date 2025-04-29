
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Settings, ShoppingBag, Mail } from 'lucide-react';

export default function ProfilePage() {
  // Placeholder user data - replace with actual data fetching when auth is implemented
  const user = {
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    initials: 'AT',
    avatarUrl: 'https://picsum.photos/seed/alex/100/100',
    memberSince: 'January 2024', // Example data
    orderCount: 3, // Example data
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-2xl">{user.initials}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
          <CardDescription className="text-muted-foreground flex items-center gap-1">
             <Mail className="h-4 w-4" /> {user.email}
          </CardDescription>
           <CardDescription className="text-sm text-muted-foreground mt-1">Member since {user.memberSince}</CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
           <section>
             <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
                <User className="h-5 w-5" /> Account Details
             </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Name:</span> {user.name}</p>
                  <p><span className="font-medium text-foreground">Email:</span> {user.email}</p>
                  {/* Add more details like address, phone number if needed */}
              </div>
           </section>

          <Separator />

          <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
                 <ShoppingBag className="h-5 w-5" /> Order History
              </h3>
               <p className="text-sm text-muted-foreground mb-3">You have placed {user.orderCount} order(s).</p>
               {/* Link to a dedicated order history page (if implemented) */}
               <Button variant="outline" disabled>
                  View Orders (Coming Soon)
               </Button>
          </section>

          <Separator />

           <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
                 <Settings className="h-5 w-5" /> Settings
               </h3>
               <p className="text-sm text-muted-foreground mb-3">Manage your preferences and account settings.</p>
               <Button variant="default" asChild>
                   <Link href="/settings">Go to Settings</Link>
               </Button>
           </section>

        </CardContent>

        {/* Optional Footer */}
        {/* <CardFooter className="bg-muted/50 p-4 justify-center">
           <Button variant="destructive" disabled>Log Out (Not Implemented)</Button>
        </CardFooter> */}
      </Card>
    </div>
  );
}
