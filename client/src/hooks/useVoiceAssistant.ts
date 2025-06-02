import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

interface VoiceSettings {
  enabled: boolean;
  language: 'fr' | 'bm' | 'ar' | 'en';
  autoAnnounce: boolean;
  volume: number;
  rate: number;
  pitch: number;
  voiceGender: 'male' | 'female' | 'auto';
}

interface DeliveryUpdate {
  orderId: string;
  status: string;
  location?: string;
  estimatedTime?: string;
  driverName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Authentic Mali language translations for delivery updates
const VOICE_MESSAGES = {
  // Status updates
  status_updates: {
    pending: {
      fr: "Votre commande est en attente d'un livreur",
      bm: "I ka baara bɛ makɔnɔ ye k'a sɔrɔ",
      ar: "طلبك في انتظار عامل التوصيل",
      en: "Your order is waiting for a driver"
    },
    accepted: {
      fr: "Un livreur a accepté votre commande",
      bm: "Mɔgɔ dɔ ye i ka baara sɔn",
      ar: "قبل عامل التوصيل طلبك",
      en: "A driver has accepted your order"
    },
    picked_up: {
      fr: "Votre colis a été récupéré",
      bm: "I ka fɛn ye ta",
      ar: "تم استلام طردك",
      en: "Your package has been picked up"
    },
    in_transit: {
      fr: "Votre colis est en route vers vous",
      bm: "I ka fɛn bɛ taama la ka na i ma",
      ar: "طردك في الطريق إليك",
      en: "Your package is on its way to you"
    },
    delivered: {
      fr: "Votre colis a été livré avec succès",
      bm: "I ka fɛn ye di i ma hɛrɛ",
      ar: "تم تسليم طردك بنجاح",
      en: "Your package has been delivered successfully"
    },
    cancelled: {
      fr: "Votre commande a été annulée",
      bm: "I ka baara ye ban",
      ar: "تم إلغاء طلبك",
      en: "Your order has been cancelled"
    }
  },
  
  // Driver notifications
  driver_notifications: {
    new_order: {
      fr: "Nouvelle commande disponible près de votre position",
      bm: "Baara kura bɛ yen i dan na",
      ar: "طلب جديد متاح بالقرب من موقعك",
      en: "New order available near your location"
    },
    order_accepted: {
      fr: "Vous avez accepté une nouvelle commande",
      bm: "I ye baara kura sɔn",
      ar: "لقد قبلت طلبًا جديدًا",
      en: "You have accepted a new order"
    },
    navigation_start: {
      fr: "Navigation démarrée vers l'adresse de collecte",
      bm: "Kalan daminɛna ka taa ta yɔrɔ la",
      ar: "بدأت الملاحة إلى عنوان الاستلام",
      en: "Navigation started to pickup address"
    },
    arrival_pickup: {
      fr: "Vous êtes arrivé à l'adresse de collecte",
      bm: "I se ta yɔrɔ la",
      ar: "وصلت إلى عنوان الاستلام",
      en: "You have arrived at the pickup address"
    },
    arrival_delivery: {
      fr: "Vous êtes arrivé à l'adresse de livraison",
      bm: "I se di yɔrɔ la",
      ar: "وصلت إلى عنوان التسليم",
      en: "You have arrived at the delivery address"
    }
  },

  // Navigation directions
  navigation: {
    turn_left: {
      fr: "Tournez à gauche",
      bm: "Ka kalan numan fɛ",
      ar: "انعطف يساراً",
      en: "Turn left"
    },
    turn_right: {
      fr: "Tournez à droite",
      bm: "Ka kalan kinin fɛ",
      ar: "انعطف يميناً", 
      en: "Turn right"
    },
    continue_straight: {
      fr: "Continuez tout droit",
      bm: "Ka taa ɲɛ kɔ",
      ar: "واصل بشكل مستقيم",
      en: "Continue straight"
    },
    arrive_destination: {
      fr: "Vous êtes arrivé à destination",
      bm: "I se lakolobɔyɔrɔ la",
      ar: "وصلت إلى الوجهة",
      en: "You have arrived at your destination"
    }
  },

  // Emergency and alerts
  alerts: {
    traffic_delay: {
      fr: "Attention, embouteillage détecté sur votre route",
      bm: "Hakilina, mɔgɔ caman bɛ sira la",
      ar: "تنبيه، تم اكتشاف ازدحام مروري في طريقك",
      en: "Warning, traffic jam detected on your route"
    },
    weather_alert: {
      fr: "Conditions météo difficiles, conduisez prudemment",
      bm: "Waati jumɔgɔ ka gɛlɛn, ka boli ka kɛlɛ",
      ar: "ظروف جوية صعبة، قد بحذر",
      en: "Difficult weather conditions, drive carefully"
    },
    customer_calling: {
      fr: "Le client vous appelle",
      bm: "Kiliyanw bɛ i wele",
      ar: "العميل يتصل بك",
      en: "The customer is calling you"
    }
  },

  // System messages
  system: {
    voice_enabled: {
      fr: "Assistant vocal activé",
      bm: "Kuma dɛmɛbaga ye wuli",
      ar: "تم تفعيل المساعد الصوتي",
      en: "Voice assistant enabled"
    },
    voice_disabled: {
      fr: "Assistant vocal désactivé",
      bm: "Kuma dɛmɛbaga ye ban",
      ar: "تم إيقاف المساعد الصوتي",
      en: "Voice assistant disabled"
    },
    language_changed: {
      fr: "Langue changée en français",
      bm: "Kan ye Changé ka kɛ bamanankan na",
      ar: "تم تغيير اللغة إلى العربية",
      en: "Language changed to English"
    }
  }
};

// Voice personas for different languages
const VOICE_PERSONAS = {
  fr: {
    name: "Aminata",
    characteristics: "Voix féminine chaleureuse du Mali"
  },
  bm: {
    name: "Sekou",
    characteristics: "Voix masculine traditionnelle bambara"
  },
  ar: {
    name: "Fatima",
    characteristics: "Voix féminine respectueuse arabe"
  },
  en: {
    name: "David",
    characteristics: "Voix masculine claire internationale"
  }
};

export function useVoiceAssistant() {
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: false,
    language: 'fr',
    autoAnnounce: true,
    volume: 0.8,
    rate: 1.0,
    pitch: 1.0,
    voiceGender: 'auto'
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [messageQueue, setMessageQueue] = useState<Array<{
    text: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
  }>>([]);

  // Get available voices for the selected language
  const getAvailableVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return [];
    
    const voices = speechSynthesis.getVoices();
    const languageMap = {
      fr: ['fr-FR', 'fr-CA', 'fr'],
      bm: ['fr-FR'], // Use French voice for Bambara with custom pronunciation
      ar: ['ar-SA', 'ar-EG', 'ar'],
      en: ['en-US', 'en-GB', 'en']
    };

    const targetLangs = languageMap[settings.language] || ['fr-FR'];
    return voices.filter(voice => 
      targetLangs.some(lang => voice.lang.startsWith(lang))
    );
  }, [settings.language]);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      speechSynthesis.onvoiceschanged = () => {
        getAvailableVoices();
      };
    }
  }, [getAvailableVoices]);

  // Process message queue
  useEffect(() => {
    if (!isPlaying && messageQueue.length > 0 && settings.enabled) {
      const nextMessage = messageQueue.reduce((highest, current) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[current.priority] > priorityOrder[highest.priority] ? current : highest;
      });

      setMessageQueue(prev => prev.filter(msg => msg !== nextMessage));
      speak(nextMessage.text, nextMessage.priority);
    }
  }, [isPlaying, messageQueue, settings.enabled]);

  const speak = useCallback((text: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') => {
    if (!settings.enabled || !('speechSynthesis' in window)) return;

    // Cancel current speech if higher priority
    if (isPlaying && (priority === 'urgent' || priority === 'high')) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = getAvailableVoices();
    
    // Select appropriate voice
    if (voices.length > 0) {
      const preferredVoice = voices.find(voice => {
        if (settings.voiceGender === 'auto') return true;
        return voice.name.toLowerCase().includes(settings.voiceGender === 'female' ? 'female' : 'male');
      }) || voices[0];
      
      utterance.voice = preferredVoice;
    }

    // Apply voice settings
    utterance.volume = settings.volume;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    // Special pronunciation adjustments for Bambara
    if (settings.language === 'bm') {
      utterance.rate = 0.8; // Slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentMessage(text);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentMessage("");
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentMessage("");
    };

    speechSynthesis.speak(utterance);
  }, [settings, isPlaying, getAvailableVoices]);

  const addToQueue = useCallback((text: string, priority: 'low' | 'medium' | 'high' | 'urgent', category: string) => {
    setMessageQueue(prev => [...prev, { text, priority, category }]);
  }, []);

  const announceDeliveryUpdate = useCallback((update: DeliveryUpdate) => {
    if (!settings.autoAnnounce) return;

    const statusMessages = VOICE_MESSAGES.status_updates[update.status as keyof typeof VOICE_MESSAGES.status_updates];
    if (!statusMessages) return;

    const message = statusMessages[settings.language];
    let enhancedMessage = message;

    // Add contextual information
    if (update.driverName && update.status === 'accepted') {
      const driverIntro = {
        fr: `${message}. Votre livreur est ${update.driverName}`,
        bm: `${message}. I ka di-mɔgɔ ye ${update.driverName} ye`,
        ar: `${message}. عامل التوصيل الخاص بك هو ${update.driverName}`,
        en: `${message}. Your driver is ${update.driverName}`
      };
      enhancedMessage = driverIntro[settings.language];
    }

    if (update.estimatedTime && update.status === 'in_transit') {
      const timeInfo = {
        fr: `${message}. Arrivée prévue dans ${update.estimatedTime}`,
        bm: `${message}. A bɛna se ${update.estimatedTime} kɔnɔ`,
        ar: `${message}. الوصول المتوقع خلال ${update.estimatedTime}`,
        en: `${message}. Expected arrival in ${update.estimatedTime}`
      };
      enhancedMessage = timeInfo[settings.language];
    }

    addToQueue(enhancedMessage, update.priority, 'delivery_update');
  }, [settings, addToQueue]);

  const announceDriverNotification = useCallback((type: keyof typeof VOICE_MESSAGES.driver_notifications, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') => {
    if (!settings.autoAnnounce) return;

    const messages = VOICE_MESSAGES.driver_notifications[type];
    if (!messages) return;

    const message = messages[settings.language];
    addToQueue(message, priority, 'driver_notification');
  }, [settings, addToQueue]);

  const announceNavigation = useCallback((direction: keyof typeof VOICE_MESSAGES.navigation) => {
    const messages = VOICE_MESSAGES.navigation[direction];
    if (!messages) return;

    const message = messages[settings.language];
    addToQueue(message, 'high', 'navigation');
  }, [settings, addToQueue]);

  const announceAlert = useCallback((alertType: keyof typeof VOICE_MESSAGES.alerts, priority: 'urgent' | 'high' = 'urgent') => {
    const messages = VOICE_MESSAGES.alerts[alertType];
    if (!messages) return;

    const message = messages[settings.language];
    addToQueue(message, priority, 'alert');
  }, [settings, addToQueue]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentMessage("");
      setMessageQueue([]);
    }
  }, []);

  const testVoice = useCallback(() => {
    const testMessages = VOICE_MESSAGES.system.voice_enabled;
    const message = testMessages[settings.language];
    speak(message, 'medium');
  }, [settings.language, speak]);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Announce language change
    if (newSettings.language && newSettings.language !== settings.language) {
      const langMessages = VOICE_MESSAGES.system.language_changed;
      const message = langMessages[newSettings.language];
      setTimeout(() => speak(message, 'medium'), 500);
    }
  }, [settings.language, speak]);

  return {
    settings,
    updateSettings,
    isPlaying,
    currentMessage,
    messageQueue: messageQueue.length,
    speak,
    announceDeliveryUpdate,
    announceDriverNotification,
    announceNavigation,
    announceAlert,
    stopSpeaking,
    testVoice,
    availableVoices: getAvailableVoices(),
    isSupported: 'speechSynthesis' in window,
    currentPersona: VOICE_PERSONAS[settings.language]
  };
}