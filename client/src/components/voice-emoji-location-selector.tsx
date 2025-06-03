import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, MapPin, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationEmoji {
  id: string;
  name: string;
  emoji: string;
  keywords: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface VoiceEmojiLocationSelectorProps {
  onLocationSelect: (location: LocationEmoji) => void;
  selectedLocation?: LocationEmoji | null;
  className?: string;
}

interface VoiceMessage {
  fr: string;
  bm: string; // Bambara
}

const VOICE_MESSAGES: Record<string, VoiceMessage> = {
  start: {
    fr: "Dites le lieu que vous cherchez",
    bm: "Yoro min b'a fɛ, o fɔ"
  },
  selected: {
    fr: "sélectionné",
    bm: "sugandi"
  },
  notRecognized: {
    fr: "Lieu non reconnu, essayez à nouveau", 
    bm: "Yoro ma dɔn, segin-ka kɛ"
  },
  examples: {
    fr: "Essayez de dire: maison, bureau, école, hôpital",
    bm: "Segin ni: so, baara yoro, kalan yoro, dɔgɔtɔrɔ so"
  }
};

const LOCATION_EMOJIS: LocationEmoji[] = [
  {
    id: "home",
    name: "Maison / So",
    emoji: "🏠",
    keywords: ["maison", "home", "domicile", "chez moi", "so", "du", "na so"],
    coordinates: { lat: 12.6392, lng: -8.0029 }
  },
  {
    id: "office",
    name: "Bureau / Baara yoro",
    emoji: "🏢",
    keywords: ["bureau", "office", "travail", "boulot", "baara", "baara yoro", "baro"],
    coordinates: { lat: 12.6528, lng: -7.9916 }
  },
  {
    id: "school",
    name: "École / Kalan yoro",
    emoji: "🏫",
    keywords: ["école", "school", "université", "campus", "kalan", "kalan yoro", "lakol"],
    coordinates: { lat: 12.6461, lng: -8.0134 }
  },
  {
    id: "hospital",
    name: "Hôpital / Dɔgɔtɔrɔ so",
    emoji: "🏥",
    keywords: ["hôpital", "hospital", "clinique", "médecin", "dɔgɔtɔrɔ", "dɔgɔtɔrɔ so", "fura yoro"],
    coordinates: { lat: 12.6398, lng: -7.9921 }
  },
  {
    id: "market",
    name: "Marché / Sugu",
    emoji: "🏪",
    keywords: ["marché", "market", "magasin", "boutique", "sugu", "feere yoro", "sangaji"],
    coordinates: { lat: 12.6501, lng: -8.0087 }
  },
  {
    id: "restaurant",
    name: "Restaurant / Dumuni yoro",
    emoji: "🍽️",
    keywords: ["restaurant", "manger", "nourriture", "repas", "dumuni", "dumuni yoro", "balimaya"],
    coordinates: { lat: 12.6445, lng: -7.9998 }
  },
  {
    id: "airport",
    name: "Aéroport / Sankaba yoro",
    emoji: "✈️",
    keywords: ["aéroport", "airport", "avion", "vol", "sankaba", "sankaba yoro", "degen yoro"],
    coordinates: { lat: 12.5336, lng: -7.9499 }
  },
  {
    id: "mosque",
    name: "Mosquée / Misiri",
    emoji: "🕌",
    keywords: ["mosquée", "mosque", "prière", "religion", "misiri", "salida yoro", "alamudulillahi"],
    coordinates: { lat: 12.6512, lng: -8.0156 }
  }
];

export default function VoiceEmojiLocationSelector({
  onLocationSelect,
  selectedLocation,
  className = ""
}: VoiceEmojiLocationSelectorProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'bm'>('bm');
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      // Note: Browser speech recognition may not support Bambara directly, 
      // but we'll use French as fallback while handling Bambara keywords
      recognitionInstance.lang = selectedLanguage === 'bm' ? 'fr-FR' : 'fr-FR';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript("");
        speakText(VOICE_MESSAGES.start[selectedLanguage]);
      };
      
      recognitionInstance.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const spokenText = lastResult[0].transcript.toLowerCase();
        setTranscript(spokenText);
        
        // Find matching location
        const matchedLocation = findLocationByVoice(spokenText);
        if (matchedLocation) {
          onLocationSelect(matchedLocation);
          const selectedMessage = selectedLanguage === 'bm' 
            ? `${matchedLocation.name.split(' / ')[1] || matchedLocation.name} ${VOICE_MESSAGES.selected[selectedLanguage]}`
            : `${matchedLocation.name.split(' / ')[0]} ${VOICE_MESSAGES.selected[selectedLanguage]}`;
          speakText(selectedMessage);
          toast({
            title: selectedLanguage === 'bm' ? "Yoro sugandi" : "Lieu sélectionné",
            description: `${matchedLocation.emoji} ${matchedLocation.name}`,
          });
        } else {
          speakText(VOICE_MESSAGES.notRecognized[selectedLanguage]);
          toast({
            title: selectedLanguage === 'bm' ? "Yoro ma dɔn" : "Lieu non reconnu",
            description: VOICE_MESSAGES.examples[selectedLanguage],
            variant: "destructive",
          });
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Erreur de reconnaissance vocale",
          description: "Vérifiez votre microphone et réessayez",
          variant: "destructive",
        });
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onLocationSelect, toast]);

  const findLocationByVoice = (spokenText: string): LocationEmoji | null => {
    return LOCATION_EMOJIS.find(location =>
      location.keywords.some(keyword =>
        spokenText.includes(keyword.toLowerCase())
      )
    ) || null;
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Use French voice for both languages since Bambara TTS is not widely supported
      // but we'll speak the Bambara words with French pronunciation
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const handleLocationClick = (location: LocationEmoji) => {
    onLocationSelect(location);
    speakText(`${location.name} sélectionné`);
    toast({
      title: "Lieu sélectionné",
      description: `${location.emoji} ${location.name}`,
    });
  };

  const playLocationName = (location: LocationEmoji) => {
    speakText(location.name);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-mako-green">
          <MapPin className="w-5 h-5" />
          Sélecteur de lieu vocal avec emojis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selector */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-mako-green">
            {selectedLanguage === 'bm' ? 'Kuma-kan sugandi' : 'Sélection de langue'}
          </h3>
          <div className="flex gap-2">
            <Button
              variant={selectedLanguage === 'fr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage('fr')}
              className={selectedLanguage === 'fr' ? 'bg-mako-green text-white' : 'text-mako-green border-mako-green'}
            >
              🇫🇷 Français
            </Button>
            <Button
              variant={selectedLanguage === 'bm' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLanguage('bm')}
              className={selectedLanguage === 'bm' ? 'bg-mako-green text-white' : 'text-mako-green border-mako-green'}
            >
              🇲🇱 Bamanankan
            </Button>
          </div>
        </div>

        {/* Voice Control */}
        <div className="flex items-center gap-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center gap-2 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-mako-green hover:bg-mako-green/90 text-white'
            }`}
            disabled={!recognition}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                {selectedLanguage === 'bm' ? 'Dabɔ' : 'Arrêter'}
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                {selectedLanguage === 'bm' ? 'Kuma' : 'Parler'}
              </>
            )}
          </Button>
          
          {transcript && (
            <div className="flex-1 p-2 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-600">
                {selectedLanguage === 'bm' ? 'I ye fɔ: ' : 'Vous avez dit: '}
              </span>
              <span className="font-medium">{transcript}</span>
            </div>
          )}
        </div>

        {/* Selected Location */}
        {selectedLocation && (
          <div className="p-4 bg-mako-green/10 border border-mako-green/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedLocation.emoji}</span>
                <div>
                  <h3 className="font-medium text-mako-green">{selectedLocation.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedLanguage === 'bm' ? 'Yoro sugandi' : 'Lieu sélectionné'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playLocationName(selectedLocation)}
                className="text-mako-green hover:bg-mako-green/10"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Location Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LOCATION_EMOJIS.map((location) => (
            <Button
              key={location.id}
              variant="outline"
              className={`h-20 flex flex-col items-center gap-2 hover:bg-mako-green/10 hover:border-mako-green transition-colors ${
                selectedLocation?.id === location.id 
                  ? 'bg-mako-green/10 border-mako-green' 
                  : 'border-gray-200'
              }`}
              onClick={() => handleLocationClick(location)}
            >
              <span className="text-2xl">{location.emoji}</span>
              <span className="text-xs font-medium text-center">{location.name}</span>
            </Button>
          ))}
        </div>

        {/* Voice Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium">Instructions vocales:</p>
          <p>• Cliquez sur "Parler" et dites le lieu souhaité</p>
          <p>• Exemples: "maison", "bureau", "école", "hôpital", "marché"</p>
          <p>• Ou cliquez directement sur un emoji</p>
        </div>
      </CardContent>
    </Card>
  );
}