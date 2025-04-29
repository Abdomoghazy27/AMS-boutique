
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Settings, ShoppingBag, Mail, Edit, Save, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  // Placeholder user data - replace with actual data fetching when auth is implemented
  const initialUser = {
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    initials: 'AT',
    avatarUrl: 'https://picsum.photos/seed/alex/100/100',
    memberSince: 'January 2024', // Example data
    orderCount: 3, // Example data
  };

  const [user, setUser] = useState(initialUser);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const { toast } = useToast();

  const handleEditName = () => {
    setEditedName(user.name); // Reset edited name to current name
    setIsEditingName(true);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
  };

  const handleSaveName = () => {
    // Basic name validation (e.g., not empty)
    if (!editedName || editedName.trim().length === 0) {
      toast({
        title: 'Invalid Name',
        description: 'Please enter a valid name.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate saving the name (replace with actual API call)
    console.log('Saving new name:', editedName);
    // Update initials based on the new name
    const newInitials = editedName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    setUser((prevUser) => ({ ...prevUser, name: editedName.trim(), initials: newInitials }));
    setIsEditingName(false);
    toast({
      title: 'Name Updated',
      description: 'Your name has been successfully updated.',
    });
  };


  const handleEditEmail = () => {
    setEditedEmail(user.email); // Reset edited email to current email
    setIsEditingEmail(true);
  };

  const handleCancelEditEmail = () => {
    setIsEditingEmail(false);
  };

  const handleSaveEmail = () => {
    // Basic email validation
    if (!editedEmail || !/\S+@\S+\.\S+/.test(editedEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate saving the email
    console.log('Saving new email:', editedEmail);
    setUser((prevUser) => ({ ...prevUser, email: editedEmail }));
    setIsEditingEmail(false);
    toast({
      title: 'Email Updated',
      description: 'Your email address has been successfully updated.',
    });
  };


  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-2xl">{user.initials}</AvatarFallback>
          </Avatar>
          {/* Display or Edit Name */}
          {isEditingName ? (
             <div className="flex items-center gap-2 mt-2">
                 <Input
                    id="name"
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-10 text-center text-lg font-bold" // Larger input for name
                    aria-label="Edit Name"
                 />
                  <Button size="sm" onClick={handleSaveName} className="h-10">
                      <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEditName} className="h-10">
                     <XCircle className="h-4 w-4" />
                 </Button>
             </div>
          ) : (
            <div className="flex items-center gap-2">
                 <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
                 <Button variant="ghost" size="icon" onClick={handleEditName} className="h-7 w-7 text-muted-foreground hover:text-primary">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Name</span>
                 </Button>
            </div>
          )}
          <CardDescription className="text-muted-foreground flex items-center gap-1 mt-1">
             <Mail className="h-4 w-4" /> {user.email}
          </CardDescription>
           <CardDescription className="text-sm text-muted-foreground mt-1">Member since {user.memberSince}</CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
           <section>
             <h3 className="text-lg font-semibold mb-3 flex items-center justify-between text-primary">
                 <div className="flex items-center gap-2">
                    <User className="h-5 w-5" /> Account Details
                 </div>
                 {/* Edit Email Button */}
                 {!isEditingEmail && !isEditingName && ( // Only show if not editing name or email
                      <Button variant="ghost" size="sm" onClick={handleEditEmail} className="text-xs">
                        <Edit className="h-3 w-3 mr-1" /> Edit Email
                      </Button>
                  )}
             </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                  {/* Name Display (not editable here, edited in header) */}
                  <p><span className="font-medium text-foreground">Name:</span> {user.name}</p>

                  {/* Email Display/Edit Section */}
                   <div className="flex items-center gap-2">
                     <Label htmlFor="email" className="font-medium text-foreground min-w-[50px]">Email:</Label>
                     {isEditingEmail ? (
                        <div className="flex-grow flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <Input
                                id="email"
                                type="email"
                                value={editedEmail}
                                onChange={(e) => setEditedEmail(e.target.value)}
                                className="flex-grow h-9"
                                aria-label="Edit Email Address"
                            />
                            <div className="flex gap-1 self-end sm:self-center">
                                <Button size="sm" onClick={handleSaveEmail} className="h-9">
                                    <Save className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleCancelEditEmail} className="h-9">
                                    <XCircle className="h-4 w-4" />
                                </Button>
                             </div>
                         </div>
                     ) : (
                        <span>{user.email}</span>
                     )}
                   </div>
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
