import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useVoiceGuidance } from "@/hooks/useVoiceGuidance";

interface VoiceControlPanelProps {
  userType: 'driver' | 'customer';
  className?: string;
}

export default function VoiceControlPanel({ userType, className = "" }: VoiceControlPanelProps) {
  const {
    isSupported,
    isPlaying,
    settings,
    availableVoices,
    availableLanguages,
    speak,
    speakCustom,
    stop,
    pause,
    resume,
    saveSettings,
    messageQueue
  } = useVoiceGuidance();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!isSupported) {
    return (
      <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center text-yellow-700">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <span className="text-sm">
              Guidage vocal non disponible sur ce navigateur
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleLanguageChange = (language: string) => {
    saveSettings({ ...settings, language });
  };

  const handleVoiceChange = (voiceName: string) => {
    saveSettings({ ...settings, voice: voiceName });
  };

  const handleSettingChange = (key: string, value: number | boolean) => {
    saveSettings({ ...settings, [key]: value });
  };

  const testVoice = () => {
    const testMessages = {
      driver: {
        'fr-FR': 'Bonjour, je suis votre assistant vocal pour les livraisons',
        'bm': 'I ni ce, ne ye i ka dilanko dɛmɛbagaw ye',
        'ar-MA': 'مرحبا، أنا مساعدك الصوتي للتوصيل',
        'en-US': 'Hello, I am your voice assistant for deliveries'
      },
      customer: {
        'fr-FR': 'Bonjour, je vais vous guider pour votre commande',
        'bm': 'I ni ce, ne bɛna i ɲɛnajɛ i ka baarakɛcogo la',
        'ar-MA': 'مرحبا، سأرشدك خلال طلبك',
        'en-US': 'Hello, I will guide you through your order'
      }
    };

    const message = testMessages[userType][settings.language as keyof typeof testMessages.driver] ||
                   testMessages[userType]['fr-FR'];
    speakCustom(message, settings.language, 'medium');
  };

  const getLanguageVoices = () => {
    return availableVoices.filter(voice => 
      voice.lang.startsWith(settings.language.split('-')[0])
    );
  };

  return (
    <Card className={`border-mako-green ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-mako-dark">
            <i className="fas fa-volume-up mr-2 text-mako-green"></i>
            Guidage vocal
            {messageQueue > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white">
                {messageQueue} en attente
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isPlaying && (
              <div className="flex items-center text-green-600">
                <i className="fas fa-volume-up animate-pulse mr-1"></i>
                <span className="text-sm">Lecture...</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1"
            >
              <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Activé</span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => handleSettingChange('enabled', enabled)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {isPlaying && (
              <Button
                size="sm"
                variant="outline"
                onClick={pause}
                className="p-2"
              >
                <i className="fas fa-pause"></i>
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={stop}
              className="p-2"
              disabled={!isPlaying && messageQueue === 0}
            >
              <i className="fas fa-stop"></i>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={testVoice}
              className="p-2"
              disabled={!settings.enabled}
            >
              <i className="fas fa-play"></i>
            </Button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Langue</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(availableLanguages).map(([code, name]) => (
              <Button
                key={code}
                variant={settings.language === code ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange(code)}
                className={`text-xs ${settings.language === code ? "bg-mako-green text-white" : ""}`}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Voix disponibles</label>
              <select
                value={settings.voice}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white"
              >
                <option value="">Voix par défaut</option>
                {getLanguageVoices().map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Settings */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Vitesse</label>
                  <span className="text-xs text-gray-500">{settings.rate.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[settings.rate]}
                  onValueChange={([value]) => handleSettingChange('rate', value)}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Hauteur</label>
                  <span className="text-xs text-gray-500">{settings.pitch.toFixed(1)}</span>
                </div>
                <Slider
                  value={[settings.pitch]}
                  onValueChange={([value]) => handleSettingChange('pitch', value)}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Volume</label>
                  <span className="text-xs text-gray-500">{Math.round(settings.volume * 100)}%</span>
                </div>
                <Slider
                  value={[settings.volume]}
                  onValueChange={([value]) => handleSettingChange('volume', value)}
                  min={0.0}
                  max={1.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Quick Actions for Drivers */}
            {userType === 'driver' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions rapides</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speak('new_order', 'medium', 'alert')}
                    disabled={!settings.enabled}
                    className="text-xs"
                  >
                    <i className="fas fa-bell mr-1"></i>
                    Nouvelle commande
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speak('arrived_pickup', 'high', 'navigation')}
                    disabled={!settings.enabled}
                    className="text-xs"
                  >
                    <i className="fas fa-map-marker mr-1"></i>
                    Arrivé collecte
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speak('arrived_delivery', 'high', 'navigation')}
                    disabled={!settings.enabled}
                    className="text-xs"
                  >
                    <i className="fas fa-home mr-1"></i>
                    Arrivé livraison
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speak('call_customer', 'urgent', 'instruction')}
                    disabled={!settings.enabled}
                    className="text-xs"
                  >
                    <i className="fas fa-phone mr-1"></i>
                    Appeler client
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Actions for Customers */}
            {userType === 'customer' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions rapides</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speak('order_accepted', 'medium', 'status')}
                    disabled={!settings.enabled}
                    className="text-xs"
                  >
                    <i className="fas fa-check mr-1"></i>
                    Commande acceptée
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speak('driver_arriving', 'high', 'alert')}
                    disabled={!settings.enabled}
                    className="text-xs"
                  >
                    <i className="fas fa-truck mr-1"></i>
                    Livreur en route
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speak('package_delivered', 'medium', 'status')}
                    disabled={!settings.enabled}
                    className="text-xs"
                  >
                    <i className="fas fa-box-open mr-1"></i>
                    Colis livré
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speak('weather_warning', 'urgent', 'alert')}
                    disabled={!settings.enabled}
                    className="text-xs"
                  >
                    <i className="fas fa-cloud-rain mr-1"></i>
                    Alerte météo
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}