
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Users, Smile } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-primary mb-4" />
          <CardTitle className="text-4xl font-extrabold tracking-tight">About AMS Boutique</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Curating Your Confidence, One Outfit at a Time.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded with a passion for fashion and a commitment to quality, AMS Boutique started as a dream to bring unique, stylish, and accessible clothing to everyone. We believe that what you wear is an extension of your personality, and our goal is to provide pieces that make you feel confident, comfortable, and inspired. From everyday essentials to statement pieces, we meticulously curate our collection to ensure a blend of timeless style and current trends.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is simple: to empower individuals through fashion. We strive to offer a diverse range of high-quality clothing that caters to various styles and occasions. We are dedicated to providing an exceptional shopping experience, both online and potentially in future physical locations, focusing on customer satisfaction, sustainability, and ethical sourcing. We want AMS Boutique to be more than just a store; we aim to be a community where fashion lovers can find inspiration and express their unique selves.
            </p>
          </section>

           <Separator />

           <section>
             <h2 className="text-2xl font-semibold mb-6 text-primary text-center">Why Choose Us?</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
               <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary/50">
                 <Users className="h-10 w-10 text-primary mb-2" />
                 <h3 className="font-semibold">Curated Selection</h3>
                 <p className="text-sm text-muted-foreground">Handpicked items focusing on quality, style, and versatility.</p>
               </div>
               <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary/50">
                 <ShoppingBag className="h-10 w-10 text-primary mb-2" />
                 <h3 className="font-semibold">Seamless Shopping</h3>
                 <p className="text-sm text-muted-foreground">Easy navigation, secure checkout, and helpful AI recommendations.</p>
               </div>
               <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary/50">
                 <Smile className="h-10 w-10 text-primary mb-2" />
                 <h3 className="font-semibold">Customer Focus</h3>
                 <p className="text-sm text-muted-foreground">Dedicated to providing excellent service and support.</p>
               </div>
             </div>
           </section>

          {/* Optional: Team Section */}
          {/*
          <Separator />
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">Meet the Team</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
               <div className="text-center">
                 <Avatar className="w-24 h-24 mx-auto mb-2">
                   <AvatarImage src="https://picsum.photos/seed/ceo/100/100" alt="CEO Name" />
                   <AvatarFallback>CEO</AvatarFallback>
                 </Avatar>
                 <h3 className="font-medium">CEO Name</h3>
                 <p className="text-sm text-muted-foreground">Founder & CEO</p>
               </div>
                <div className="text-center">
                 <Avatar className="w-24 h-24 mx-auto mb-2">
                   <AvatarImage src="https://picsum.photos/seed/stylist/100/100" alt="Stylist Name" />
                   <AvatarFallback>ST</AvatarFallback>
                 </Avatar>
                 <h3 className="font-medium">Stylist Name</h3>
                 <p className="text-sm text-muted-foreground">Head Stylist</p>
               </div>
            </div>
           </section>
          */}

        </CardContent>
      </Card>
    </div>
  );
}
