import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { 
  MAP_JSON, 
  getColorByIIBB, 
  normalizeProvinceName,
  CONSENSO_FISCAL_COLOR
} from "@/constants/constants";

interface GeoProperties {
  NAME: string;
  GID_0?: string;
  NAME_0?: string;
  GID_1?: string;
  COLOR?: string;
  TYPE_1?: string;
  ENGTYPE_1?: string;
  HASC_1?: string;
  VALUE?: string;
}

interface MapChartProps {
  data: Record<string, number>;
}

const MapChart: React.FC<MapChartProps> = ({ data = {} }) => {
  const [content, setContent] = useState("");
  const [dimensions, setDimensions] = useState({ width: 1400, height: 900 });

  // Calcular rangos dinámicos excluyendo consenso fiscal
  const { minValue, maxValue } = React.useMemo(() => {
    // Filtrar datos excluyendo "Alícuota Máxima Consenso Fiscal"
    const provincialValues = Object.entries(data)
      .filter(([province]) => province !== "Alícuota Máxima Consenso Fiscal")
      .map(([, value]) => value);
    
    if (provincialValues.length === 0) return { minValue: 0, maxValue: 3.7 };
    
    return {
      minValue: Math.min(...provincialValues),
      maxValue: Math.max(...provincialValues)
    };
  }, [data]);

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const width = Math.min(window.innerWidth - 64, 400);
        const height = window.innerHeight * 0.8;
        setDimensions({ width, height });
      } else {
        setDimensions({ width: 1400, height: 900 });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const getProvinceName = (geo: { properties: GeoProperties }): string => {
    return geo.properties.NAME || "";
  };

  const getProvinceData = (provinceName: string) => {
    const normalizedName = normalizeProvinceName(provinceName);
    const iibbValue = data[normalizedName];
    
    if (iibbValue !== undefined) {
      // Usar color gris para consenso fiscal, dinámico para provincias
      const isConsensoFiscal = normalizedName === "Alícuota Máxima Consenso Fiscal";
      const color = isConsensoFiscal 
        ? CONSENSO_FISCAL_COLOR 
        : getColorByIIBB(iibbValue, minValue, maxValue);
        
      return {
        value: iibbValue,
        color: color,
      };
    }
    
    return {
      value: null,
      color: "#f0f0f0",
    };
  };

  const isMobile = window.innerWidth < 768;
  const scale = isMobile ? 700 : 1000;

  return (
    <div className="relative w-full">
      <ComposableMap
        projectionConfig={{
          rotate: [60, 0, 0],
          scale: scale,
        }}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          maxWidth: "none",
          maxHeight: "none",
          display: "block",
        }}
      >
        <ZoomableGroup center={[-60, -40]} zoom={1} minZoom={0.5} maxZoom={8}>
          <Geographies geography={MAP_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const provinceName = getProvinceName(geo);
                const { value, color } = getProvinceData(provinceName);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      if (value !== null) {
                        setContent(`${provinceName}: ${value.toFixed(2)}%`);
                      } else {
                        setContent(`${provinceName}: Sin datos`);
                      }
                    }}
                    data-tip={`${geo.properties.NAME} ${value}`}
                    onMouseLeave={() => {
                      setContent("");
                    }}
                    style={{
                      default: {
                        fill: color,
                        outline: "none",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                      },
                      hover: {
                        fill: color,
                        outline: "none",
                        stroke: "#000000",
                        strokeWidth: 1.5,
                      },
                      pressed: {
                        fill: color,
                        outline: "none",
                        stroke: "#000000",
                        strokeWidth: 1.5,
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {content && (
        <div
          className={`absolute ${
            isMobile
              ? "bottom-4 left-4 text-xs bg-black text-white px-2 py-1 rounded shadow-lg max-w-xs"
              : "top-4 left-4 bg-white p-3 rounded shadow-lg border text-sm"
          } pointer-events-none z-10`}
        >
          {content}
        </div>
      )}

      {/* Mobile Zoom Controls */}
      {isMobile && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="bg-white p-2 rounded shadow-lg border text-lg font-bold">
            +
          </button>
          <button className="bg-white p-2 rounded shadow-lg border text-lg font-bold">
            -
          </button>
          <button className="bg-white px-3 py-1 rounded shadow-lg border text-sm">
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default MapChart;
