import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, isAutomatic, weather, toggleTheme, enableAutomatic } = useTheme();

  const getThemeIcon = () => {
    if (isAutomatic && weather) {
      if (weather.condition.includes("rain")) return "fas fa-cloud-rain";
      if (weather.condition.includes("cloud")) return "fas fa-cloud";
      if (weather.isDay) return "fas fa-sun";
      return "fas fa-moon";
    }
    return theme === "light" ? "fas fa-sun" : "fas fa-moon";
  };

  const getThemeDescription = () => {
    if (isAutomatic) {
      if (weather) {
        const timeReason = weather.isDay ? "jour" : "nuit";
        const weatherReason = weather.condition.includes("rain") ? "pluie" : 
                             weather.cloudiness > 80 ? "très nuageux" : "";
        return `Auto (${timeReason}${weatherReason ? `, ${weatherReason}` : ""})`;
      }
      return "Automatique";
    }
    return theme === "light" ? "Clair" : "Sombre";
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <i className={`${getThemeIcon()} mr-2 text-mako-green`}></i>
          Thème
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {getThemeDescription()}
          </span>
          <Badge 
            variant={isAutomatic ? "default" : "secondary"}
            className={isAutomatic ? "bg-mako-green text-white" : ""}
          >
            {theme === "light" ? "☀️" : "🌙"}
          </Badge>
        </div>

        {weather && isAutomatic && (
          <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="flex items-center justify-between">
              <span>{weather.temperature}°C, {weather.condition}</span>
              <span>{weather.isDay ? "Jour" : "Nuit"}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleTheme}
            className="flex-1 text-xs"
          >
            <i className="fas fa-sync mr-1"></i>
            Basculer
          </Button>
          
          {!isAutomatic && (
            <Button
              size="sm"
              variant="outline"
              onClick={enableAutomatic}
              className="flex-1 text-xs"
            >
              <i className="fas fa-magic mr-1"></i>
              Auto
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}