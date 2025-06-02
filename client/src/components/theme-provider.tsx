import { createContext, useContext, ReactNode } from "react";
import { useAdaptiveTheme } from "@/hooks/useAdaptiveTheme";

interface ThemeContextType {
  theme: "light" | "dark";
  isAutomatic: boolean;
  weather: any;
  toggleTheme: () => void;
  enableAutomatic: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeData = useAdaptiveTheme();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}