import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface LocationResult {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  confidence: number;
}

interface VoiceLocationSearchState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  results: LocationResult[];
  error: string | null;
}

export function useVoiceLocationSearch() {
  const [state, setState] = useState<VoiceLocationSearchState>({
    isListening: false,
    isProcessing: false,
    transcript: "",
    confidence: 0,
    results: [],
    error: null
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const initializeRecognition = useCallback((language: string = 'fr-FR') => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        
        if (lastResult) {
          const transcriptText = lastResult[0].transcript;
          const confidenceLevel = lastResult[0].confidence || 0;
          
          setState(prev => ({
            ...prev,
            transcript: transcriptText,
            confidence: confidenceLevel
          }));
        }
      };

      recognition.onerror = (event) => {
        let errorMessage = "Erreur de reconnaissance vocale";
        switch (event.error) {
          case 'no-speech':
            errorMessage = "Aucune parole détectée";
            break;
          case 'audio-capture':
            errorMessage = "Microphone non accessible";
            break;
          case 'not-allowed':
            errorMessage = "Permission microphone refusée";
            break;
          case 'network':
            errorMessage = "Erreur réseau";
            break;
        }
        
        setState(prev => ({
          ...prev,
          isListening: false,
          isProcessing: false,
          error: errorMessage
        }));
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      return recognition;
    }
    return null;
  }, []);

  const searchMaliLocations = useCallback(async (query: string): Promise<LocationResult[]> => {
    // Mali location database with key places
    const locations = [
      // Bamako districts
      { name: "Hippodrome", city: "Bamako", region: "District de Bamako", lat: -12.6319, lng: -8.0123 },
      { name: "Hamdallaye", city: "Bamako", region: "District de Bamako", lat: -12.6289, lng: -7.9891 },
      { name: "Badalabougou", city: "Bamako", region: "District de Bamako", lat: -12.6456, lng: -8.0234 },
      { name: "Medina Coura", city: "Bamako", region: "District de Bamako", lat: -12.6543, lng: -8.0012 },
      { name: "Bagadadji", city: "Bamako", region: "District de Bamako", lat: -12.6234, lng: -7.9876 },
      { name: "Djelibougou", city: "Bamako", region: "District de Bamako", lat: -12.6678, lng: -8.0345 },
      { name: "Lafiabougou", city: "Bamako", region: "District de Bamako", lat: -12.6123, lng: -7.9789 },
      { name: "Magnambougou", city: "Bamako", region: "District de Bamako", lat: -12.6789, lng: -8.0456 },
      { name: "Sogoniko", city: "Bamako", region: "District de Bamako", lat: -12.6456, lng: -7.9567 },
      { name: "Faladié", city: "Bamako", region: "District de Bamako", lat: -12.6234, lng: -8.0678 },
      
      // Major landmarks
      { name: "Aéroport Modibo Keita", city: "Bamako", region: "District de Bamako", lat: -12.5336, lng: -7.9499 },
      { name: "Palais de la Culture", city: "Bamako", region: "District de Bamako", lat: -12.6392, lng: -8.0029 },
      { name: "Grande Mosquée", city: "Bamako", region: "District de Bamako", lat: -12.6500, lng: -8.0100 },
      { name: "Marché Central", city: "Bamako", region: "District de Bamako", lat: -12.6450, lng: -8.0050 },
      { name: "Université de Bamako", city: "Bamako", region: "District de Bamako", lat: -12.6300, lng: -7.9900 },
      { name: "Hôpital Gabriel Touré", city: "Bamako", region: "District de Bamako", lat: -12.6400, lng: -8.0000 },
      { name: "Stade du 26 Mars", city: "Bamako", region: "District de Bamako", lat: -12.6350, lng: -7.9950 },
      
      // Other major cities
      { name: "Sikasso", city: "Sikasso", region: "Sikasso", lat: -11.3167, lng: -5.6667 },
      { name: "Mopti", city: "Mopti", region: "Mopti", lat: -14.4844, lng: -4.1964 },
      { name: "Kayes", city: "Kayes", region: "Kayes", lat: -14.4467, lng: -11.4458 },
      { name: "Ségou", city: "Ségou", region: "Ségou", lat: -13.4317, lng: -6.2633 },
      { name: "Gao", city: "Gao", region: "Gao", lat: -16.2667, lng: -0.0500 },
      { name: "Tombouctou", city: "Tombouctou", region: "Tombouctou", lat: -16.7666, lng: -3.0026 }
    ];

    const results: LocationResult[] = [];
    const queryLower = query.toLowerCase();

    locations.forEach((location, index) => {
      const nameLower = location.name.toLowerCase();
      let confidence = 0;

      // Exact match
      if (nameLower === queryLower) {
        confidence = 1.0;
      }
      // Contains match
      else if (nameLower.includes(queryLower) || queryLower.includes(nameLower)) {
        confidence = 0.8;
      }
      // Word match
      else if (queryLower.split(' ').some(word => word.length > 2 && nameLower.includes(word))) {
        confidence = 0.6;
      }
      // Fuzzy match (similar characters)
      else {
        const similarity = calculateSimilarity(nameLower, queryLower);
        if (similarity > 0.7) {
          confidence = similarity * 0.5;
        }
      }

      if (confidence > 0.4) {
        results.push({
          id: `mali-${index}`,
          name: location.name,
          address: `${location.name}, ${location.city}`,
          city: location.city,
          region: location.region,
          coordinates: {
            lat: location.lat,
            lng: location.lng
          },
          confidence
        });
      }
    });

    return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }, []);

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const startListening = useCallback((language: string = 'fr-FR') => {
    const recognition = initializeRecognition(language);
    if (!recognition) {
      setState(prev => ({ 
        ...prev, 
        error: "Reconnaissance vocale non supportée" 
      }));
      return;
    }

    try {
      recognition.start();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: "Impossible d'accéder au microphone" 
      }));
    }
  }, [initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const processVoiceInput = useCallback(async (transcript: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const cleanedTranscript = transcript
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
        .trim();

      const results = await searchMaliLocations(cleanedTranscript);
      
      setState(prev => ({
        ...prev,
        results,
        isProcessing: false
      }));

      if (results.length > 0) {
        toast({
          title: `${results.length} adresse(s) trouvée(s)`,
          description: results[0].name,
          duration: 3000,
        });
      } else {
        toast({
          title: "Aucune adresse trouvée",
          description: "Essayez d'être plus précis",
          variant: "destructive",
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: "Erreur lors de la recherche"
      }));
    }
  }, [searchMaliLocations, toast]);

  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      transcript: "",
      confidence: 0,
      error: null
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    processVoiceInput,
    clearResults,
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  };
}