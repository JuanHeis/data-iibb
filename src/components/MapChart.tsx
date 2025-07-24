import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { getColorByIIBB, getIIBBLevel, normalizeProvinceName } from "@/constants/constants";

// Datos GeoJSON de provincias argentinas
const geoUrl = "https://infra.datos.gob.ar/catalog/modernizacion/dataset/7/distribution/7.2/download/provincias.geojson";

interface GeoProperties {
  GID_0: string;
  NAME_0: string;
  GID_1: string;
  NAME: string;
  COLOR: string;
  TYPE_1: string;
  ENGTYPE_1: string;
  HASC_1: string;
  VALUE: string;
}

interface MapChartProps {
  data?: Record<string, number>;
}

export default function MapChart({ data = {} }: MapChartProps) {
  const [content, setContent] = useState("");
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [position, setPosition] = useState({ coordinates: [-65, -40], zoom: 1 });

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // Mobile: usar el ancho disponible y 80vh de altura
        const availableWidth = Math.min(window.innerWidth - 64, 400); // 64px de padding total
        const availableHeight = window.innerHeight * 0.8;
        setDimensions({
          width: availableWidth,
          height: availableHeight,
        });
      } else {
        // Desktop: dimensiones fijas grandes sin restricciones
        setDimensions({
          width: 1400, // Incrementado aún más para desktop
          height: 900,  // Incrementado aún más para desktop
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getProvinceName = (geo: { properties: GeoProperties }): string => {
    const properties = geo.properties as GeoProperties;
    const rawName = properties.NAME || properties.NAME_0 || "Desconocida";
    return normalizeProvinceName(rawName);
  };

  const getProvinceData = (provinceName: string) => {
    // Buscar datos tanto con el nombre original como normalizado
    const normalizedName = normalizeProvinceName(provinceName);
    const percentage = data[normalizedName] || data[provinceName] || 0;
    const level = getIIBBLevel(percentage);
    const color = percentage > 0 ? getColorByIIBB(percentage) : "#f0f0f0"; // Gris para datos faltantes
    
    return { percentage, level, color };
  };

  const isMobile = window.innerWidth < 768;

  // Debug: verificar qué datos tenemos
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      console.log("🗺️ Datos del mapa:", Object.keys(data));
      console.log("📊 Ejemplo de datos:", Object.entries(data).slice(0, 5));
    }
  }, [data]);

  return (
    <div className="relative w-full flex justify-center">
      {/* Usamos ZoomableGroup nativo de react-simple-maps para evitar conflictos */}
      <div 
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          maxWidth: "none", // CRÍTICO: no limitar el tamaño máximo
          maxHeight: "none"  // CRÍTICO: no limitar el tamaño máximo
        }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: position.coordinates as [number, number],
            scale: isMobile ? 600 : 1200, // Escala mucho más grande para desktop
          }}
          width={dimensions.width}
          height={dimensions.height}
          style={{ 
            width: "100%", 
            height: "100%",
            maxWidth: "none", // CRÍTICO: no limitar
            maxHeight: "none", // CRÍTICO: no limitar
            display: "block" // Asegurar que no hay problemas de display
          }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates as [number, number]}
            onMoveEnd={(position) => setPosition(position)}
            maxZoom={isMobile ? 3 : 4}
            minZoom={0.5}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const provinceName = getProvinceName(geo);
                  const { percentage, level, color } = getProvinceData(provinceName);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={color}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      onMouseEnter={() => {
                        const displayText = percentage > 0 
                          ? `${provinceName} - ${percentage}% (${level})`
                          : `${provinceName} - Sin datos`;
                        setContent(displayText);
                      }}
                      onMouseLeave={() => {
                        setContent("");
                      }}
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          outline: "none",
                          strokeWidth: 1,
                          stroke: "#000000",
                        },
                        pressed: {
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      
      {/* Tooltip */}
      {content && (
        <div 
          className={`
            absolute z-20 bg-black text-white rounded-lg shadow-lg pointer-events-none
            ${isMobile 
              ? 'bottom-4 left-4 px-2 py-1 text-xs max-w-[200px]' 
              : 'top-4 left-4 px-4 py-3 text-sm max-w-[250px]'
            }
          `}
        >
          {content}
        </div>
      )}
      
      {/* Controles de zoom solo para mobile */}
      {isMobile && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button 
            onClick={() => setPosition(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 3) }))}
            className="bg-white shadow-lg border border-gray-200 rounded-lg p-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg font-bold">+</span>
          </button>
          <button 
            onClick={() => setPosition(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.5, 0.5) }))}
            className="bg-white shadow-lg border border-gray-200 rounded-lg p-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg font-bold">-</span>
          </button>
          <button 
            onClick={() => setPosition({ coordinates: [-65, -40], zoom: 1 })}
            className="bg-white shadow-lg border border-gray-200 rounded-lg p-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      )}
      
      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-sm font-medium text-gray-700">IIBB por Provincia</p>
        </div>
      </div>
    </div>
  );
} 