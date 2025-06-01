import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface AddressSuggestion {
  id: string;
  address: string;
  city: string;
  region: string;
  country: string;
  formattedAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  icon?: string;
}

// Adresses prédéfinies pour le Mali (communes et quartiers principaux)
const maliAddresses: AddressSuggestion[] = [
  // Bamako
  { id: "1", address: "ACI 2000", city: "Bamako", region: "District de Bamako", country: "Mali", formattedAddress: "ACI 2000, Bamako" },
  { id: "2", address: "Hippodrome", city: "Bamako", region: "District de Bamako", country: "Mali", formattedAddress: "Hippodrome, Bamako" },
  { id: "3", address: "Medina Coura", city: "Bamako", region: "District de Bamako", country: "Mali", formattedAddress: "Medina Coura, Bamako" },
  { id: "4", address: "Hamdallaye", city: "Bamako", region: "District de Bamako", country: "Mali", formattedAddress: "Hamdallaye, Bamako" },
  { id: "5", address: "Magnambougou", city: "Bamako", region: "District de Bamako", country: "Mali", formattedAddress: "Magnambougou, Bamako" },
  { id: "6", address: "Sotuba", city: "Bamako", region: "District de Bamako", country: "Mali", formattedAddress: "Sotuba, Bamako" },
  { id: "7", address: "Kalaban Coura", city: "Bamako", region: "District de Bamako", country: "Mali", formattedAddress: "Kalaban Coura, Bamako" },
  { id: "8", address: "Sabalibougou", city: "Bamako", region: "District de Bamako", country: "Mali", formattedAddress: "Sabalibougou, Bamako" },
  { id: "9", address: "Faladié", city: "Bamako", region: "District de Bamako", country: "Mali", formattedAddress: "Faladié, Bamako" },
  { id: "10", address: "Quinzambougou", city: "Bamako", region: "District de Bamako", country: "Mali", formattedAddress: "Quinzambougou, Bamako" },
  
  // Sikasso
  { id: "11", address: "Centre-ville", city: "Sikasso", region: "Région de Sikasso", country: "Mali", formattedAddress: "Centre-ville, Sikasso" },
  { id: "12", address: "Wayerma", city: "Sikasso", region: "Région de Sikasso", country: "Mali", formattedAddress: "Wayerma, Sikasso" },
  { id: "13", address: "Lafiabougou", city: "Sikasso", region: "Région de Sikasso", country: "Mali", formattedAddress: "Lafiabougou, Sikasso" },
  { id: "14", address: "Medine", city: "Sikasso", region: "Région de Sikasso", country: "Mali", formattedAddress: "Medine, Sikasso" },
  
  // Ségou
  { id: "15", address: "Pelengana", city: "Ségou", region: "Région de Ségou", country: "Mali", formattedAddress: "Pelengana, Ségou" },
  { id: "16", address: "Angoulême", city: "Ségou", region: "Région de Ségou", country: "Mali", formattedAddress: "Angoulême, Ségou" },
  { id: "17", address: "Alamissani", city: "Ségou", region: "Région de Ségou", country: "Mali", formattedAddress: "Alamissani, Ségou" },
  
  // Koutiala
  { id: "18", address: "Centre Commercial", city: "Koutiala", region: "Région de Sikasso", country: "Mali", formattedAddress: "Centre Commercial, Koutiala" },
  { id: "19", address: "Quartier Résidentiel", city: "Koutiala", region: "Région de Sikasso", country: "Mali", formattedAddress: "Quartier Résidentiel, Koutiala" },
  
  // Kayes
  { id: "20", address: "Plateau", city: "Kayes", region: "Région de Kayes", country: "Mali", formattedAddress: "Plateau, Kayes" },
  { id: "21", address: "Liberté", city: "Kayes", region: "Région de Kayes", country: "Mali", formattedAddress: "Liberté, Kayes" },
  
  // Mopti
  { id: "22", address: "Komoguel", city: "Mopti", region: "Région de Mopti", country: "Mali", formattedAddress: "Komoguel, Mopti" },
  { id: "23", address: "Gangal", city: "Mopti", region: "Région de Mopti", country: "Mali", formattedAddress: "Gangal, Mopti" },
  
  // Gao
  { id: "24", address: "Centre administratif", city: "Gao", region: "Région de Gao", country: "Mali", formattedAddress: "Centre administratif, Gao" },
  { id: "25", address: "Château", city: "Gao", region: "Région de Gao", country: "Mali", formattedAddress: "Château, Gao" },
  
  // Tombouctou
  { id: "26", address: "Sankore", city: "Tombouctou", region: "Région de Tombouctou", country: "Mali", formattedAddress: "Sankore, Tombouctou" },
  { id: "27", address: "Djinguereber", city: "Tombouctou", region: "Région de Tombouctou", country: "Mali", formattedAddress: "Djinguereber, Tombouctou" },
];

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Rechercher une adresse...",
  className = "",
  icon = "fas fa-map-marker-alt"
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filtrer les suggestions en fonction de la saisie
  useEffect(() => {
    if (value.length >= 2) {
      const filtered = maliAddresses.filter((address) =>
        address.formattedAddress.toLowerCase().includes(value.toLowerCase()) ||
        address.address.toLowerCase().includes(value.toLowerCase()) ||
        address.city.toLowerCase().includes(value.toLowerCase()) ||
        address.region.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8); // Limiter à 8 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setActiveSuggestion(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.formattedAddress);
    onSelect?.(suggestion);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(
          activeSuggestion < suggestions.length - 1 ? activeSuggestion + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(
          activeSuggestion > 0 ? activeSuggestion - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestion >= 0 && activeSuggestion < suggestions.length) {
          handleSuggestionClick(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    }, 150);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
          autoComplete="off"
        />
        <i className={`${icon} absolute left-3 top-1/2 transform -translate-y-1/2 text-mako-anthracite opacity-50`}></i>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto shadow-lg border border-gray-200"
        >
          <CardContent className="p-0">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-mako-green hover:text-white transition-colors border-b border-gray-100 last:border-b-0 ${
                  index === activeSuggestion ? 'bg-mako-green text-white' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <i className="fas fa-map-marker-alt text-mako-green"></i>
                  <div>
                    <div className="font-medium">{suggestion.address}</div>
                    <div className="text-sm opacity-70">
                      {suggestion.city}, {suggestion.region}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {value.length >= 2 && suggestions.length === 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border border-gray-200">
          <CardContent className="p-4 text-center text-mako-anthracite opacity-70">
            <i className="fas fa-search text-2xl mb-2"></i>
            <p>Aucune adresse trouvée</p>
            <p className="text-sm">Essayez une autre recherche ou tapez l'adresse complète</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}