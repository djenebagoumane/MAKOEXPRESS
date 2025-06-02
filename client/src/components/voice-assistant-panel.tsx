import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

interface VoiceAssistantPanelProps {
  userType: 'driver' | 'customer';
  className?: string;
}

export default function VoiceAssistantPanel({ userType, className = "" }: VoiceAssistantPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const {
    settings,
    updateSettings,
    isPlaying,
    currentMessage,
    messageQueue,
    testVoice,
    stopSpeaking,
    isSupported,
    currentPersona,
    availableVoices
  } = useVoiceAssistant();

  const languageOptions = [
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'bm', label: 'Bamanankan', flag: '🇲🇱' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' },
    { value: 'en', label: 'English', flag: '🇺🇸' }
  ];

  const getStatusColor = () => {
    if (!settings.enabled) return 'bg-gray-500';
    if (isPlaying) return 'bg-blue-500 animate-pulse';
    if (messageQueue > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!settings.enabled) return 'Désactivé';
    if (isPlaying) return 'En cours...';
    if (messageQueue > 0) return `${messageQueue} en attente`;
    return 'Prêt';
  };

  if (!isSupported) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center text-red-600">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <span className="text-sm">Assistant vocal non supporté par ce navigateur</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-gray-900">
            <i className="fas fa-microphone mr-2 text-blue-500"></i>
            Assistant vocal
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-xs text-gray-600">{getStatusText()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
            <span className="text-sm font-medium">
              {settings.enabled ? 'Activé' : 'Désactivé'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isPlaying && (
              <Button
                size="sm"
                variant="outline"
                onClick={stopSpeaking}
                className="text-red-600"
              >
                <i className="fas fa-stop mr-1"></i>
                Stop
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={testVoice}
              disabled={!settings.enabled}
            >
              <i className="fas fa-play mr-1"></i>
              Test
            </Button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Langue</label>
          <Select
            value={settings.language}
            onValueChange={(language: 'fr' | 'bm' | 'ar' | 'en') => updateSettings({ language })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <div className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Voice Persona */}
        {currentPersona && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Voix : {currentPersona.name}
                </p>
                <p className="text-xs text-blue-700">
                  {currentPersona.characteristics}
                </p>
              </div>
              <i className="fas fa-user-circle text-2xl text-blue-500"></i>
            </div>
          </div>
        )}

        {/* Auto-announce toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Annonces automatiques</p>
            <p className="text-xs text-gray-600">
              {userType === 'driver' 
                ? 'Nouvelles commandes et navigation'
                : 'Mises à jour de livraison'
              }
            </p>
          </div>
          <Switch
            checked={settings.autoAnnounce}
            onCheckedChange={(autoAnnounce) => updateSettings({ autoAnnounce })}
            disabled={!settings.enabled}
          />
        </div>

        {/* Current Message Display */}
        {currentMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <i className="fas fa-volume-up text-green-600 mt-1"></i>
              <div className="flex-1">
                <p className="text-sm text-green-800 font-medium">En cours :</p>
                <p className="text-sm text-green-700">{currentMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Message Queue */}
        {messageQueue > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <i className="fas fa-clock text-yellow-600"></i>
              <span className="text-sm text-yellow-800">
                {messageQueue} message{messageQueue > 1 ? 's' : ''} en attente
              </span>
            </div>
          </div>
        )}

        {/* Advanced Settings Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-center"
        >
          <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'} mr-2`}></i>
          Paramètres avancés
        </Button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Volume</label>
                <span className="text-xs text-gray-600">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.volume]}
                onValueChange={([volume]) => updateSettings({ volume })}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
                disabled={!settings.enabled}
              />
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Vitesse</label>
                <span className="text-xs text-gray-600">
                  {settings.rate.toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[settings.rate]}
                onValueChange={([rate]) => updateSettings({ rate })}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
                disabled={!settings.enabled}
              />
            </div>

            {/* Pitch Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Hauteur</label>
                <span className="text-xs text-gray-600">
                  {settings.pitch.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[settings.pitch]}
                onValueChange={([pitch]) => updateSettings({ pitch })}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
                disabled={!settings.enabled}
              />
            </div>

            {/* Voice Gender Preference */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Préférence de voix</label>
              <Select
                value={settings.voiceGender}
                onValueChange={(voiceGender: 'male' | 'female' | 'auto') => updateSettings({ voiceGender })}
                disabled={!settings.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatique</SelectItem>
                  <SelectItem value="female">Voix féminine</SelectItem>
                  <SelectItem value="male">Voix masculine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Available Voices Info */}
            {availableVoices.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Voix disponibles : {availableVoices.length}
                </p>
                <div className="flex flex-wrap gap-1">
                  {availableVoices.slice(0, 3).map((voice, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {voice.name.split(' ')[0]}
                    </Badge>
                  ))}
                  {availableVoices.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{availableVoices.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Usage Tips */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <i className="fas fa-lightbulb text-blue-500 mt-1"></i>
            <div>
              <p className="text-xs font-medium text-blue-900 mb-1">Conseil :</p>
              <p className="text-xs text-blue-700">
                {userType === 'driver' 
                  ? 'L\'assistant vous guide automatiquement lors des livraisons en ' + 
                    languageOptions.find(l => l.value === settings.language)?.label
                  : 'Vous recevrez des notifications vocales sur l\'état de votre livraison'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}