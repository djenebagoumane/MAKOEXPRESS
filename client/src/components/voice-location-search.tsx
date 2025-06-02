import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  confidence: number;
  type: 'exact' | 'partial' | 'nearby';
}

interface VoiceLocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
  supportedLanguages?: string[];
}

export default function VoiceLocationSearch({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Dites votre adresse ou tapez...",
  className = "",
  supportedLanguages = ['fr-FR', 'fr-ML', 'en-US']
}: VoiceLocationSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('fr-FR');
  const [confidence, setConfidence] = useState<number>(0);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setConfidence(0);
        toast({
          title: "Écoute activée",
          description: "Dites votre adresse clairement...",
          duration: 2000,
        });
      };

      recognition.onresult = (event: any) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        
        if (lastResult) {
          const transcriptText = lastResult[0].transcript;
          const confidenceLevel = lastResult[0].confidence || 0;
          
          setTranscript(transcriptText);
          setConfidence(confidenceLevel);
          
          if (lastResult.isFinal) {
            handleVoiceInput(transcriptText, confidenceLevel);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setIsProcessing(false);
        
        let errorMessage = "Erreur de reconnaissance vocale";
        switch (event.error) {
          case 'no-speech':
            errorMessage = "Aucune parole détectée. Veuillez réessayer.";
            break;
          case 'audio-capture':
            errorMessage = "Microphone non accessible. Vérifiez les permissions.";
            break;
          case 'not-allowed':
            errorMessage = "Permission microphone refusée. Autorisez l'accès au microphone.";
            break;
          case 'network':
            errorMessage = "Erreur réseau. Vérifiez votre connexion.";
            break;
        }
        
        toast({
          title: "Erreur vocale",
          description: errorMessage,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectedLanguage]);

  const handleVoiceInput = async (transcript: string, confidence: number) => {
    setIsProcessing(true);
    
    try {
      // Clean and normalize the transcript
      const cleanedTranscript = normalizeAddress(transcript);
      onChange(cleanedTranscript);
      
      // Search for location suggestions
      const suggestions = await searchLocations(cleanedTranscript);
      setSuggestions(suggestions);
      setShowSuggestions(true);
      
      // Auto-select if high confidence and single result
      if (confidence > 0.8 && suggestions.length === 1) {
        const location = suggestions[0];
        if (onLocationSelect) {
          onLocationSelect(location);
        }
        onChange(location.address);
        setShowSuggestions(false);
        
        toast({
          title: "Adresse trouvée",
          description: `${location.name}, ${location.city}`,
          duration: 3000,
        });
      } else if (suggestions.length > 0) {
        toast({
          title: `${suggestions.length} adresse(s) trouvée(s)`,
          description: "Sélectionnez celle qui vous convient",
          duration: 3000,
        });
      } else {
        toast({
          title: "Aucune adresse trouvée",
          description: "Essayez d'être plus précis ou tapez manuellement",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de recherche",
        description: "Impossible de rechercher l'adresse",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const normalizeAddress = (text: string): string => {
    // Clean the transcript for better address recognition
    return text
      .toLowerCase()
      .replace(/\b(rue|avenue|boulevard|place|quartier|secteur)\b/g, (match) => {
        const mapping: Record<string, string> = {
          'rue': 'Rue',
          'avenue': 'Avenue',
          'boulevard': 'Boulevard',
          'place': 'Place',
          'quartier': 'Quartier',
          'secteur': 'Secteur'
        };
        return mapping[match] || match;
      })
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
    // Mali-specific location database with common places
    const maliLocations = [
      // Bamako districts
      { name: "Hippodrome", city: "Bamako", region: "District de Bamako", type: "district" },
      { name: "Hamdallaye", city: "Bamako", region: "District de Bamako", type: "district" },
      { name: "Badalabougou", city: "Bamako", region: "District de Bamako", type: "district" },
      { name: "Medina Coura", city: "Bamako", region: "District de Bamako", type: "district" },
      { name: "Bagadadji", city: "Bamako", region: "District de Bamako", type: "district" },
      { name: "Djelibougou", city: "Bamako", region: "District de Bamako", type: "district" },
      { name: "Lafiabougou", city: "Bamako", region: "District de Bamako", type: "district" },
      { name: "Magnambougou", city: "Bamako", region: "District de Bamako", type: "district" },
      { name: "Sogoniko", city: "Bamako", region: "District de Bamako", type: "district" },
      { name: "Faladié", city: "Bamako", region: "District de Bamako", type: "district" },
      
      // Major cities
      { name: "Sikasso", city: "Sikasso", region: "Sikasso", type: "city" },
      { name: "Mopti", city: "Mopti", region: "Mopti", type: "city" },
      { name: "Kayes", city: "Kayes", region: "Kayes", type: "city" },
      { name: "Ségou", city: "Ségou", region: "Ségou", type: "city" },
      { name: "Gao", city: "Gao", region: "Gao", type: "city" },
      { name: "Tombouctou", city: "Tombouctou", region: "Tombouctou", type: "city" },
      
      // Landmarks
      { name: "Aéroport Modibo Keita", city: "Bamako", region: "District de Bamako", type: "landmark" },
      { name: "Palais de la Culture", city: "Bamako", region: "District de Bamako", type: "landmark" },
      { name: "Marché de Medina Coura", city: "Bamako", region: "District de Bamako", type: "landmark" },
      { name: "Grande Mosquée", city: "Bamako", region: "District de Bamako", type: "landmark" },
      { name: "Université de Bamako", city: "Bamako", region: "District de Bamako", type: "landmark" },
      { name: "Hôpital Gabriel Touré", city: "Bamako", region: "District de Bamako", type: "landmark" },
      { name: "Stade du 26 Mars", city: "Bamako", region: "District de Bamako", type: "landmark" },
    ];

    const results: LocationSuggestion[] = [];
    const queryLower = query.toLowerCase();

    maliLocations.forEach((location, index) => {
      const nameLower = location.name.toLowerCase();
      let confidence = 0;
      let matchType: 'exact' | 'partial' | 'nearby' = 'nearby';

      if (nameLower === queryLower) {
        confidence = 1.0;
        matchType = 'exact';
      } else if (nameLower.includes(queryLower) || queryLower.includes(nameLower)) {
        confidence = 0.8;
        matchType = 'partial';
      } else if (queryLower.split(' ').some(word => nameLower.includes(word))) {
        confidence = 0.6;
        matchType = 'nearby';
      }

      if (confidence > 0.5) {
        results.push({
          id: `mali-${index}`,
          name: location.name,
          address: `${location.name}, ${location.city}`,
          city: location.city,
          region: location.region,
          country: "Mali",
          coordinates: {
            lat: -12.6392 + (Math.random() - 0.5) * 0.1, // Approximate Bamako coordinates with variation
            lng: -8.0029 + (Math.random() - 0.5) * 0.1
          },
          confidence,
          type: matchType
        });
      }
    });

    return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Reconnaissance vocale non supportée",
        description: "Votre navigateur ne supporte pas la reconnaissance vocale",
        variant: "destructive",
      });
      return;
    }

    try {
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
      
      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
        }
      }, 10000);
    } catch (error) {
      toast({
        title: "Erreur microphone",
        description: "Impossible d'accéder au microphone",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    onChange(suggestion.address);
    if (onLocationSelect) {
      onLocationSelect(suggestion);
    }
    setShowSuggestions(false);
    setSuggestions([]);
    
    toast({
      title: "Adresse sélectionnée",
      description: suggestion.address,
      duration: 2000,
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exact': return 'fa-bullseye';
      case 'partial': return 'fa-search';
      case 'nearby': return 'fa-map-marker-alt';
      default: return 'fa-map-pin';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Voice Input Controls */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pr-12"
            onFocus={() => value && setShowSuggestions(true)}
          />
          
          {/* Voice Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`absolute right-1 top-1 h-8 w-8 p-0 ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'text-gray-500 hover:text-mako-green'
            }`}
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
          >
            <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
          </Button>
        </div>

        {/* Language Selector */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option value="fr-FR">Français</option>
          <option value="fr-ML">Français (Mali)</option>
          <option value="en-US">English</option>
        </select>
      </div>

      {/* Voice Status */}
      {(isListening || isProcessing) && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className={`fas ${isListening ? 'fa-microphone-alt' : 'fa-cog fa-spin'} text-blue-600`}></i>
              <span className="text-sm text-blue-700">
                {isListening ? 'En écoute...' : 'Traitement...'}
              </span>
            </div>
            {confidence > 0 && (
              <Badge className={`${getConfidenceColor(confidence)} bg-transparent border-current`}>
                {Math.round(confidence * 100)}% confiance
              </Badge>
            )}
          </div>
          
          {transcript && (
            <div className="mt-2 text-sm text-gray-600">
              <strong>Transcription:</strong> {transcript}
            </div>
          )}
        </div>
      )}

      {/* Location Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto shadow-lg border">
          <CardContent className="p-0">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                onClick={() => selectSuggestion(suggestion)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <i className={`fas ${getTypeIcon(suggestion.type)} text-mako-green`}></i>
                      <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(suggestion.confidence)} border-current`}
                      >
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.address}</p>
                    <p className="text-xs text-gray-500">{suggestion.region}, {suggestion.country}</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-sm mt-1"></i>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-500">
        <i className="fas fa-microphone mr-1"></i>
        Cliquez sur le microphone et dites votre adresse clairement
      </div>
    </div>
  );
}