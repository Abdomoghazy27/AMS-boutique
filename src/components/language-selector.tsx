
'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  // In a real app, this would likely come from an i18n context or global state
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageChange = (value: string) => {
    console.log('Language selected:', value);
    setSelectedLanguage(value);
    // TODO: Implement actual language change logic here.
    // This would involve:
    // 1. Calling a function from your i18n library (e.g., i18n.changeLanguage(value))
    // 2. Potentially storing the preference in localStorage or user settings
    // 3. Triggering a re-render or refresh if necessary for the changes to take effect app-wide.
  };

  return (
    <div className="flex flex-col space-y-2 max-w-xs">
      <Label htmlFor="language-select" className="flex items-center gap-1">
        <Globe className="h-4 w-4" /> Interface Language
      </Label>
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger id="language-select" aria-label="Select Language">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Español (Spanish)</SelectItem>
          <SelectItem value="fr">Français (French)</SelectItem>
          <SelectItem value="de" disabled>Deutsch (German) - Coming Soon</SelectItem>
          {/* Add more languages as needed */}
        </SelectContent>
      </Select>
    </div>
  );
}
