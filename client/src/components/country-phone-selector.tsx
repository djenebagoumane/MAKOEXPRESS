import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  pattern: RegExp;
  format: string;
}

const countries: Country[] = [
  {
    code: "ML",
    name: "Mali",
    dialCode: "+223",
    flag: "🇲🇱",
    pattern: /^[67]\d{7}$/,
    format: "XX XX XX XX"
  },
  {
    code: "FR",
    name: "France", 
    dialCode: "+33",
    flag: "🇫🇷",
    pattern: /^[67]\d{8}$/,
    format: "X XX XX XX XX"
  },
  {
    code: "SN",
    name: "Sénégal",
    dialCode: "+221", 
    flag: "🇸🇳",
    pattern: /^[67]\d{7}$/,
    format: "XX XXX XX XX"
  },
  {
    code: "BF",
    name: "Burkina Faso",
    dialCode: "+226",
    flag: "🇧🇫", 
    pattern: /^[67]\d{7}$/,
    format: "XX XX XX XX"
  },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    dialCode: "+225",
    flag: "🇨🇮",
    pattern: /^[0-9]\d{7}$/,
    format: "XX XX XX XX"
  },
  {
    code: "GN",
    name: "Guinée",
    dialCode: "+224",
    flag: "🇬🇳",
    pattern: /^[67]\d{7}$/,
    format: "XXX XX XX XX"
  },
  {
    code: "NE",
    name: "Niger",
    dialCode: "+227",
    flag: "🇳🇪",
    pattern: /^[89]\d{7}$/,
    format: "XX XX XX XX"
  },
  {
    code: "MA",
    name: "Maroc",
    dialCode: "+212",
    flag: "🇲🇦",
    pattern: /^[67]\d{8}$/,
    format: "X XX XX XX XX"
  },
  {
    code: "DZ",
    name: "Algérie",
    dialCode: "+213",
    flag: "🇩🇿",
    pattern: /^[567]\d{8}$/,
    format: "X XX XX XX XX"
  },
  {
    code: "TN",
    name: "Tunisie",
    dialCode: "+216",
    flag: "🇹🇳",
    pattern: /^[29]\d{7}$/,
    format: "XX XXX XXX"
  }
];

interface CountryPhoneSelectorProps {
  value: string;
  onChange: (phone: string) => void;
  onCountryChange: (country: Country) => void;
  error?: string;
  required?: boolean;
}

export default function CountryPhoneSelector({
  value,
  onChange,
  onCountryChange,
  error,
  required = false
}: CountryPhoneSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      onCountryChange(country);
      const fullPhone = country.dialCode + phoneNumber;
      onChange(fullPhone);
    }
  };

  const handlePhoneChange = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");
    setPhoneNumber(digits);
    
    // Combine with country code
    const fullPhone = selectedCountry.dialCode + digits;
    onChange(fullPhone);
  };

  const isValidPhone = (phone: string): boolean => {
    return selectedCountry.pattern.test(phone);
  };

  const formatPhoneDisplay = (phone: string): string => {
    if (!phone) return "";
    
    let formatted = "";
    let digitIndex = 0;
    
    for (let i = 0; i < selectedCountry.format.length && digitIndex < phone.length; i++) {
      if (selectedCountry.format[i] === 'X') {
        formatted += phone[digitIndex];
        digitIndex++;
      } else {
        formatted += selectedCountry.format[i];
      }
    }
    
    return formatted;
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Numéro de téléphone {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="flex space-x-2">
        <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              <div className="flex items-center space-x-2">
                <span>{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.dialCode}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center space-x-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-muted-foreground">{country.dialCode}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex-1">
          <Input
            type="tel"
            value={formatPhoneDisplay(phoneNumber)}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder={selectedCountry.format.replace(/X/g, '0')}
            className={`${
              phoneNumber && !isValidPhone(phoneNumber) 
                ? 'border-red-500 focus:border-red-500' 
                : ''
            }`}
          />
        </div>
      </div>
      
      {phoneNumber && !isValidPhone(phoneNumber) && (
        <p className="text-sm text-red-500">
          Format invalide pour {selectedCountry.name}. Exemple: {selectedCountry.format}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Numéro complet: {selectedCountry.dialCode}{formatPhoneDisplay(phoneNumber)}
      </p>
    </div>
  );
}