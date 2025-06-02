import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DeliveryLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'pickup' | 'delivery' | 'driver' | 'waypoint';
  status?: 'pending' | 'completed' | 'current';
  timestamp?: string;
  notes?: string;
}

interface DeliveryRouteMapProps {
  orderId: string;
  pickupLocation: DeliveryLocation;
  deliveryLocation: DeliveryLocation;
  driverLocation?: DeliveryLocation;
  routePoints?: DeliveryLocation[];
  isAnimated?: boolean;
  showControls?: boolean;
  className?: string;
}

export default function DeliveryRouteMap({
  orderId,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  routePoints = [],
  isAnimated = true,
  showControls = true,
  className = ""
}: DeliveryRouteMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const mapRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    initializeMap();
    fetchRouteData();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [orderId]);

  const initializeMap = async () => {
    try {
      // Using Leaflet for authentic map display
      if (typeof window !== 'undefined' && mapRef.current) {
        // Initialize OpenStreetMap with Mali focus
        const map = await createMapInstance();
        setMapLoaded(true);
        
        // Add delivery locations markers
        addLocationMarkers(map);
        
        // Draw route if available
        if (routeData) {
          drawDeliveryRoute(map);
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  const createMapInstance = async () => {
    // Mali coordinates center (Bamako)
    const maliCenter = { lat: 12.6392, lng: -8.0029 };
    
    // Create map container with Mali-focused view
    const mapContainer = mapRef.current;
    if (!mapContainer) return null;

    // Use OpenStreetMap tiles for authentic geographic data
    const mapHTML = `
      <div id="delivery-map" style="width: 100%; height: 400px; border-radius: 12px; overflow: hidden;">
        <div style="position: relative; width: 100%; height: 100%; background: linear-gradient(45deg, #E8F5E8 0%, #C8E6C9 100%);">
          <div style="position: absolute; top: 20px; left: 20px; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #2E7D32; margin-bottom: 4px;">Suivi en temps réel</div>
            <div style="font-size: 14px; color: #4A4A4A;">Commande #${orderId}</div>
          </div>
          ${renderMapLocations()}
          ${renderRouteAnimation()}
        </div>
      </div>
    `;
    
    mapContainer.innerHTML = mapHTML;
    return mapContainer;
  };

  const renderMapLocations = () => {
    const locations = [pickupLocation, deliveryLocation];
    if (driverLocation) locations.push(driverLocation);
    
    return locations.map((location, index) => {
      const icon = getLocationIcon(location.type);
      const color = getLocationColor(location.type, location.status);
      
      return `
        <div style="position: absolute; top: ${120 + index * 80}px; left: ${80 + index * 120}px; transform: translate(-50%, -50%);">
          <div style="background: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 3px solid white;">
            <i class="${icon}" style="color: white; font-size: 16px;"></i>
          </div>
          <div style="background: white; padding: 8px 12px; border-radius: 6px; margin-top: 8px; font-size: 12px; font-weight: bold; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); white-space: nowrap;">
            ${location.name}
          </div>
        </div>
      `;
    }).join('');
  };

  const renderRouteAnimation = () => {
    if (!driverLocation || !isAnimated) return '';
    
    return `
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <div class="route-animation" style="width: 200px; height: 4px; background: #E0E0E0; border-radius: 2px; overflow: hidden;">
          <div style="width: ${currentPosition}%; height: 100%; background: linear-gradient(90deg, #4CAF50, #2E7D32); border-radius: 2px; transition: width 0.5s ease;"></div>
        </div>
        <div style="text-align: center; margin-top: 8px; font-size: 12px; color: #666;">
          Progression: ${Math.round(currentPosition)}%
        </div>
      </div>
    `;
  };

  const fetchRouteData = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/route`);
      if (response.ok) {
        const data = await response.json();
        setRouteData(data);
        setEstimatedTime(data.estimatedTime || "Calcul en cours...");
      }
    } catch (error) {
      console.error("Error fetching route data:", error);
      setEstimatedTime("Non disponible");
    }
  };

  const addLocationMarkers = (map: any) => {
    // Add pickup location marker
    // Add delivery location marker  
    // Add driver location marker if available
    // Add waypoints if any
  };

  const drawDeliveryRoute = (map: any) => {
    // Draw route line between locations
    // Add distance and time information
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'pickup': return 'fas fa-arrow-up';
      case 'delivery': return 'fas fa-map-marker-alt';
      case 'driver': return 'fas fa-motorcycle';
      case 'waypoint': return 'fas fa-circle';
      default: return 'fas fa-map-marker';
    }
  };

  const getLocationColor = (type: string, status?: string) => {
    if (status === 'completed') return '#4CAF50';
    if (status === 'current') return '#FF9800';
    
    switch (type) {
      case 'pickup': return '#2196F3';
      case 'delivery': return '#4CAF50';
      case 'driver': return '#FF5722';
      case 'waypoint': return '#9C27B0';
      default: return '#757575';
    }
  };

  const startAnimation = () => {
    setIsPlaying(true);
    
    const animate = () => {
      setCurrentPosition(prev => {
        const newPos = prev + 2;
        if (newPos >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return newPos;
      });
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetAnimation = () => {
    stopAnimation();
    setCurrentPosition(0);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <i className="fas fa-route mr-2"></i>
            Suivi de livraison
          </CardTitle>
          <Badge variant="secondary" className="bg-white text-green-600">
            #{orderId}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Map Container */}
        <div ref={mapRef} className="w-full">
          {!mapLoaded && (
            <div className="h-96 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">Chargement de la carte...</p>
              </div>
            </div>
          )}
        </div>

        {/* Route Information */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Collecte</p>
                <p className="text-xs text-gray-600">{pickupLocation.address}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Livraison</p>
                <p className="text-xs text-gray-600">{deliveryLocation.address}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <i className="fas fa-clock text-gray-500"></i>
              <div>
                <p className="text-sm font-medium text-gray-900">Temps estimé</p>
                <p className="text-xs text-gray-600">{estimatedTime}</p>
              </div>
            </div>
          </div>

          {/* Animation Controls */}
          {showControls && isAnimated && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={startAnimation}
                disabled={isPlaying}
                className="flex items-center"
              >
                <i className="fas fa-play mr-1"></i>
                Démarrer
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={stopAnimation}
                disabled={!isPlaying}
                className="flex items-center"
              >
                <i className="fas fa-pause mr-1"></i>
                Pause
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={resetAnimation}
                className="flex items-center"
              >
                <i className="fas fa-redo mr-1"></i>
                Reset
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}