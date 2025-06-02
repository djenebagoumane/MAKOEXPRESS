import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  isDay: boolean;
  cloudiness: number;
  visibility: number;
}

export function useAdaptiveTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAutomatic, setIsAutomatic] = useState(true);

  // Get weather data for adaptive theming
  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    queryFn: async () => {
      const response = await fetch("/api/weather?location=Bamako");
      if (!response.ok) throw new Error("Weather data unavailable");
      const data = await response.json();
      
      return {
        temperature: data.temperature,
        condition: data.condition,
        icon: data.icon,
        isDay: data.icon.includes('d'), // 'd' for day, 'n' for night
        cloudiness: data.clouds?.all || 0,
        visibility: data.visibility || 10000
      };
    },
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
    retry: 1
  });

  // Auto-adapt theme based on time and weather
  useEffect(() => {
    if (!isAutomatic) return;

    const adaptTheme = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Base time-based theme
      let shouldUseDark = hour < 6 || hour >= 19; // Dark between 7 PM and 6 AM
      
      if (weather) {
        // Weather-based adjustments
        const { isDay, cloudiness, condition } = weather;
        
        // Override for weather conditions
        if (!isDay) {
          shouldUseDark = true;
        } else if (cloudiness > 80) {
          // Very cloudy during day - use dark theme for better contrast
          shouldUseDark = true;
        } else if (condition.includes("rain") || condition.includes("storm")) {
          // Rainy/stormy weather - dark theme
          shouldUseDark = true;
        } else if (condition.includes("clear") && isDay) {
          // Clear sunny day - light theme
          shouldUseDark = false;
        }
      }
      
      const newTheme = shouldUseDark ? "dark" : "light";
      if (newTheme !== theme) {
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    adaptTheme();
    
    // Check every minute for time changes
    const interval = setInterval(adaptTheme, 60000);
    
    return () => clearInterval(interval);
  }, [weather, theme, isAutomatic]);

  // Apply theme to document
  const applyTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement;
    
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Store preference
    localStorage.setItem("mako-theme", newTheme);
    localStorage.setItem("mako-theme-auto", isAutomatic.toString());
  };

  // Manual theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setIsAutomatic(false);
    applyTheme(newTheme);
  };

  // Enable automatic mode
  const enableAutomatic = () => {
    setIsAutomatic(true);
    localStorage.setItem("mako-theme-auto", "true");
  };

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem("mako-theme") as "light" | "dark" || "light";
    const savedAuto = localStorage.getItem("mako-theme-auto") === "true";
    
    setTheme(savedTheme);
    setIsAutomatic(savedAuto);
    
    if (!savedAuto) {
      applyTheme(savedTheme);
    }
  }, []);

  return {
    theme,
    isAutomatic,
    weather,
    toggleTheme,
    enableAutomatic,
    setTheme: (newTheme: "light" | "dark") => {
      setTheme(newTheme);
      setIsAutomatic(false);
      applyTheme(newTheme);
    }
  };
}