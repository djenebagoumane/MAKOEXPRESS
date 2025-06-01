import { useState, useEffect } from "react";

const ONBOARDING_STORAGE_KEY = "makoexpress_onboarding_completed";

export function useOnboarding() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const hasCompleted = completed === "true";
    
    setIsOnboardingCompleted(hasCompleted);
    
    // Afficher l'onboarding si pas encore complété et après un petit délai
    if (!hasCompleted) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1500); // Délai de 1.5 secondes pour laisser la page se charger
      
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOnboardingCompleted(true);
    setShowOnboarding(false);
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsOnboardingCompleted(false);
    setShowOnboarding(true);
  };

  return {
    isOnboardingCompleted,
    showOnboarding,
    completeOnboarding,
    startOnboarding,
    closeOnboarding,
    resetOnboarding,
  };
}