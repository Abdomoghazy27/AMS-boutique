
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSelector } from '@/components/language-selector'; // Import the new component
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Palette, Bell } from 'lucide-react'; // Renamed to avoid conflict

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
             <SettingsIcon className="h-7 w-7 text-primary" /> Settings
          </CardTitle>
          <CardDescription>Manage your application preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Language Settings Section */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">Language</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose the language for the application interface.
              <br />
              <span className="text-xs italic">(Note: Full internationalization backend not implemented in this demo).</span>
            </p>
            <LanguageSelector />
          </section>

          <Separator />

          {/* Appearance Settings Placeholder */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                <Palette className="h-5 w-5" /> Appearance (Placeholder)
             </h2>
            <p className="text-sm text-muted-foreground mb-4">Customize the look and feel (e.g., theme).</p>
            {/* Add theme toggle or other appearance settings here */}
             <div className="text-sm text-muted-foreground italic">Coming soon...</div>
          </section>

           <Separator />

          {/* Notification Settings Placeholder */}
          <section>
             <h2 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notifications (Placeholder)
             </h2>
             <p className="text-sm text-muted-foreground mb-4">Manage your notification preferences.</p>
             {/* Add notification toggles here */}
             <div className="text-sm text-muted-foreground italic">Coming soon...</div>
           </section>

        </CardContent>
      </Card>
    </div>
  );
}
