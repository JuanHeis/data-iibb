import React from "react";
import { getColorByIIBB, CONSENSO_FISCAL_COLOR } from "@/constants/constants";

interface ColorLegendProps {
  minValue: number;
  maxValue: number;
  consensoValue?: number;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ 
  minValue, 
  maxValue, 
  consensoValue 
}) => {
  // Crear puntos de referencia para la leyenda
  const steps = 4;
  const range = maxValue - minValue;
  const stepSize = range / (steps - 1);
  
  const legendItems = [];
  
  // Agregar pasos de color normal
  for (let i = 0; i < steps; i++) {
    const value = minValue + (stepSize * i);
    const color = getColorByIIBB(value, minValue, maxValue);
    let label = "";
    
    if (i === 0) {
      label = `${value.toFixed(1)}% - Muy Bajo (Verde)`;
    } else if (i === 1) {
      label = `${value.toFixed(1)}% - Bajo (Amarillo)`;
    } else if (i === 2) {
      label = `${value.toFixed(1)}% - Alto (Naranja)`;
    } else {
      label = `${value.toFixed(1)}% - Muy Alto (Rojo)`;
    }
    
    legendItems.push({
      color,
      label,
      value
    });
  }
  
  return (
    <div className="bg-white/90 backdrop-blur-sm border rounded-lg p-3 space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        IIBB por Provincia
      </h4>
      
      {/* Leyenda de colores provinciales */}
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-gray-600">{item.label}</span>
        </div>
      ))}
      
      {/* Consenso Fiscal en gris */}
      {consensoValue !== undefined && consensoValue !== null && (
        <>
          <div className="border-t border-gray-200 my-2" />
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: CONSENSO_FISCAL_COLOR }}
            />
            <span className="text-xs text-gray-600">
              {consensoValue.toFixed(1)}% - Consenso Fiscal (Gris)
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorLegend; 