import { useState, useEffect, useRef } from "react";

interface VoiceSettings {
  language: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  enabled: boolean;
}

interface VoiceMessage {
  id: string;
  text: string;
  language: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'navigation' | 'order' | 'status' | 'alert' | 'instruction';
}

const MALI_LANGUAGES = {
  'fr-FR': 'Français',
  'bm': 'Bambara', // Using bambara language code
  'ar-MA': 'Arabe',
  'en-US': 'English'
};

const VOICE_MESSAGES = {
  // Navigation messages
  'turn_left': {
    'fr-FR': 'Tournez à gauche',
    'bm': 'Ka kalan numan fɛ', // Bambara for turn left
    'ar-MA': 'استدر يسارا',
    'en-US': 'Turn left'
  },
  'turn_right': {
    'fr-FR': 'Tournez à droite',
    'bm': 'Ka kalan kunman fɛ', // Bambara for turn right
    'ar-MA': 'استدر يمينا',
    'en-US': 'Turn right'
  },
  'arrived_pickup': {
    'fr-FR': 'Vous êtes arrivé au point de collecte',
    'bm': 'I sera lajɛla ye', // Bambara for you have arrived
    'ar-MA': 'وصلت إلى نقطة الجمع',
    'en-US': 'You have arrived at the pickup location'
  },
  'arrived_delivery': {
    'fr-FR': 'Vous êtes arrivé au point de livraison',
    'bm': 'I sera dilanbɔla ye',
    'ar-MA': 'وصلت إلى نقطة التسليم',
    'en-US': 'You have arrived at the delivery location'
  },
  
  // Order status messages
  'new_order': {
    'fr-FR': 'Nouvelle commande disponible',
    'bm': 'Baarakɛcogo kura bɛ yen',
    'ar-MA': 'طلب جديد متاح',
    'en-US': 'New order available'
  },
  'order_accepted': {
    'fr-FR': 'Commande acceptée par le livreur',
    'bm': 'Baarakɛcogo senna',
    'ar-MA': 'تم قبول الطلب من قبل المُسلم',
    'en-US': 'Order accepted by driver'
  },
  'driver_arriving': {
    'fr-FR': 'Le livreur arrive dans 5 minutes',
    'bm': 'Dilannikɛla bɛ na miniti duuru',
    'ar-MA': 'سيصل المُسلم خلال 5 دقائق',
    'en-US': 'Driver arriving in 5 minutes'
  },
  'package_delivered': {
    'fr-FR': 'Colis livré avec succès',
    'bm': 'Fɛnwolo dilan ka nɔgɔn',
    'ar-MA': 'تم تسليم الطرد بنجاح',
    'en-US': 'Package delivered successfully'
  },

  // Alert messages
  'weather_warning': {
    'fr-FR': 'Attention, conditions météo difficiles',
    'bm': 'Kɔlɔsi, saniya ka gɛlɛn',
    'ar-MA': 'تحذير، ظروف جوية صعبة',
    'en-US': 'Warning, difficult weather conditions'
  },
  'traffic_alert': {
    'fr-FR': 'Embouteillage détecté sur votre route',
    'bm': 'Mobiliw makɔnɔ i sira kan',
    'ar-MA': 'اكتشاف ازدحام مروري في طريقك',
    'en-US': 'Traffic detected on your route'
  },

  // Instructions
  'call_customer': {
    'fr-FR': 'Appelez le client maintenant',
    'bm': 'Wele kilisi sisan',
    'ar-MA': 'اتصل بالعميل الآن',
    'en-US': 'Call the customer now'
  },
  'confirm_pickup': {
    'fr-FR': 'Confirmez la collecte du colis',
    'bm': 'Fɛnwolo tacogo dafa',
    'ar-MA': 'أكد استلام الطرد',
    'en-US': 'Confirm package pickup'
  }
};

export function useVoiceGuidance() {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'fr-FR',
    voice: '',
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    enabled: true
  });
  
  const messageQueue = useRef<VoiceMessage[]>([]);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check for speech synthesis support
    const speechSupported = 'speechSynthesis' in window;
    setIsSupported(speechSupported);

    if (speechSupported) {
      // Load available voices
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Set default voice for selected language
        const defaultVoice = voices.find(voice => 
          voice.lang.startsWith(settings.language.split('-')[0])
        );
        if (defaultVoice && !settings.voice) {
          setSettings(prev => ({ ...prev, voice: defaultVoice.name }));
        }
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('mako-voice-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = (newSettings: VoiceSettings) => {
    setSettings(newSettings);
    localStorage.setItem('mako-voice-settings', JSON.stringify(newSettings));
  };

  const speak = (messageKey: string, priority: VoiceMessage['priority'] = 'medium', category: VoiceMessage['category'] = 'instruction') => {
    if (!isSupported || !settings.enabled) return;

    const messageText = VOICE_MESSAGES[messageKey as keyof typeof VOICE_MESSAGES];
    if (!messageText) return;

    const text = messageText[settings.language as keyof typeof messageText] || messageText['fr-FR'];
    
    const message: VoiceMessage = {
      id: Date.now().toString(),
      text,
      language: settings.language,
      priority,
      category
    };

    // Add to queue based on priority
    if (priority === 'urgent') {
      messageQueue.current.unshift(message);
    } else {
      messageQueue.current.push(message);
    }

    processQueue();
  };

  const speakCustom = (text: string, language?: string, priority: VoiceMessage['priority'] = 'medium') => {
    if (!isSupported || !settings.enabled) return;

    const message: VoiceMessage = {
      id: Date.now().toString(),
      text,
      language: language || settings.language,
      priority,
      category: 'instruction'
    };

    if (priority === 'urgent') {
      messageQueue.current.unshift(message);
    } else {
      messageQueue.current.push(message);
    }

    processQueue();
  };

  const processQueue = () => {
    if (isPlaying || messageQueue.current.length === 0) return;

    const nextMessage = messageQueue.current.shift();
    if (!nextMessage) return;

    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(nextMessage.text);
    currentUtterance.current = utterance;

    // Configure voice settings
    utterance.lang = nextMessage.language;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    // Set voice if available
    const selectedVoice = availableVoices.find(voice => 
      voice.name === settings.voice || voice.lang === nextMessage.language
    );
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      currentUtterance.current = null;
      // Process next message in queue
      setTimeout(processQueue, 500);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      currentUtterance.current = null;
      setTimeout(processQueue, 1000);
    };

    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    speechSynthesis.cancel();
    messageQueue.current = [];
    setIsPlaying(false);
    currentUtterance.current = null;
  };

  const pause = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  };

  // Predefined quick actions for common scenarios
  const announceNewOrder = (orderInfo: { trackingNumber: string; location: string }) => {
    speakCustom(
      `${VOICE_MESSAGES.new_order[settings.language as keyof typeof VOICE_MESSAGES.new_order]}. Commande ${orderInfo.trackingNumber} vers ${orderInfo.location}`,
      settings.language,
      'high'
    );
  };

  const announceArrival = (locationType: 'pickup' | 'delivery') => {
    const messageKey = locationType === 'pickup' ? 'arrived_pickup' : 'arrived_delivery';
    speak(messageKey, 'high', 'navigation');
  };

  const announceStatusChange = (status: string) => {
    switch (status) {
      case 'accepted':
        speak('order_accepted', 'medium', 'status');
        break;
      case 'delivered':
        speak('package_delivered', 'medium', 'status');
        break;
      default:
        break;
    }
  };

  return {
    isSupported,
    isPlaying,
    settings,
    availableVoices,
    availableLanguages: MALI_LANGUAGES,
    speak,
    speakCustom,
    stop,
    pause,
    resume,
    saveSettings,
    announceNewOrder,
    announceArrival,
    announceStatusChange,
    messageQueue: messageQueue.current.length
  };
}