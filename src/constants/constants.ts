import { datos } from "./datos";

// Tipos para la nueva estructura de datos
export interface IIBBDataItem {
  anio: string;
  act_econ_nivel_1: string;
  act_econ_nivel_2: string;
  provincia: string;
  prov_id: string;
  unique_id: string;
  alicuota_pct: string; // Formato "2.50%" o "0.00%" o ""
}

// Mapeo de nombres de provincias entre los datos y el GeoJSON
export const PROVINCE_NAME_MAPPING: Record<string, string> = {
  // Datos -> GeoJSON
  "Buenos Aires": "Buenos Aires",
  "Catamarca": "Catamarca", 
  "Chaco": "Chaco",
  "Chubut": "Chubut",
  "Córdoba": "Córdoba",
  "Corrientes": "Corrientes",
  "Entre Ríos": "Entre Ríos",
  "Formosa": "Formosa",
  "Jujuy": "Jujuy",
  "La Pampa": "La Pampa",
  "La Rioja": "La Rioja",
  "Mendoza": "Mendoza",
  "Misiones": "Misiones",
  "Neuquén": "Neuquén",
  "Río Negro": "Río Negro",
  "Salta": "Salta",
  "San Juan": "San Juan",
  "San Luis": "San Luis",
  "Santa Cruz": "Santa Cruz",
  "Santa Fe": "Santa Fe",
  "Santiago del Estero": "Santiago del Estero",
  "Tierra del Fuego": "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
  "Tierra del Fuego, Antártida e Islas del Atlántico Sur": "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
  "Tucumán": "Tucumán",
  "Ciudad Autónoma de Buenos Aires": "Ciudad Autónoma de Buenos Aires",
  "CABA": "Ciudad Autónoma de Buenos Aires",
  "Capital Federal": "Ciudad Autónoma de Buenos Aires"
};

// Función para normalizar nombres de provincias
export function normalizeProvinceName(provinceName: string): string {
  const normalized = provinceName.trim();
  return PROVINCE_NAME_MAPPING[normalized] || normalized;
}

// Función para convertir alícuota de string a número
export function parseAlicuota(alicuota_pct: string): number {
  if (!alicuota_pct || alicuota_pct === "") return 0;
  // Remover el símbolo % y convertir a número
  const cleaned = alicuota_pct.replace('%', '').trim();
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

// Datos placeholder mientras no se cargan los datos reales
export const RAW_IIBB_DATA: IIBBDataItem[] = datos;

// Función para obtener años únicos disponibles
export function getAvailableYears(data: IIBBDataItem[]): string[] {
  const years = new Set(data.map(item => item.anio));
  return Array.from(years).sort();
}

// Función para obtener actividades económicas únicas de nivel 1
export function getAvailableActivities(data: IIBBDataItem[], year?: string): string[] {
  let filteredData = data;
  if (year) {
    filteredData = data.filter(item => item.anio === year);
  }
  
  const activities = new Set(filteredData.map(item => item.act_econ_nivel_1));
  return Array.from(activities).sort();
}

// Función para obtener provincias únicas disponibles
export function getAvailableProvinces(data: IIBBDataItem[]): string[] {
  const provinces = new Set(data.map(item => normalizeProvinceName(item.provincia)));
  return Array.from(provinces).sort();
}

// Función para filtrar y procesar datos según año y actividades seleccionadas
export function getFilteredIIBBData(
  data: IIBBDataItem[], 
  year: string, 
  activities: string[]
): Record<string, number> {
  // Filtrar por año
  let filteredData = data.filter(item => item.anio === year);
  
  // Si "General" está incluido o no hay actividades seleccionadas, tomar todas las actividades
  if (!activities.includes("General") && activities.length > 0) {
    filteredData = filteredData.filter(item => activities.includes(item.act_econ_nivel_1));
  }
  
  // Agrupar por provincia y calcular promedio si hay múltiples actividades
  const provinceData: Record<string, number[]> = {};
  
  filteredData.forEach(item => {
    const provincia = normalizeProvinceName(item.provincia); // Normalizar nombre
    const alicuota = parseAlicuota(item.alicuota_pct);
    
    if (!provinceData[provincia]) {
      provinceData[provincia] = [];
    }
    provinceData[provincia].push(alicuota);
  });
  
  // Calcular promedio por provincia
  const result: Record<string, number> = {};
  Object.entries(provinceData).forEach(([provincia, values]) => {
    if (values.length > 0) {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      result[provincia] = Number(avg.toFixed(2));
    }
  });
  
  return result;
}

// Función para obtener color basado en el porcentaje de IIBB
export function getColorByIIBB(percentage: number): string {
  // Escala: 0-1% verde, 1-2% amarillo verdoso, 2-3% amarillo, 3-4% rojo
  if (percentage <= 1) {
    // Verde
    const intensity = percentage; // 0 a 1
    return `rgb(${Math.round(34 + intensity * 100)}, ${Math.round(197 + intensity * 58)}, ${Math.round(94 + intensity * 100)})`;
  } else if (percentage <= 2) {
    // Verde a amarillo
    const t = (percentage - 1); // 0 a 1
    const r = Math.round(134 + t * 121); // 134 a 255
    const g = Math.round(255); // mantiene verde alto
    const b = Math.round(194 - t * 194); // 194 a 0
    return `rgb(${r}, ${g}, ${b})`;
  } else if (percentage <= 3) {
    // Amarillo a naranja
    const t = (percentage - 2); // 0 a 1
    const r = Math.round(255); // mantiene rojo alto
    const g = Math.round(255 - t * 100); // 255 a 155
    const b = Math.round(0); // mantiene azul bajo
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Naranja a rojo
    const t = Math.min((percentage - 3) / 0.7, 1); // 0 a 1 (máximo en 3.7%)
    const r = Math.round(255); // mantiene rojo alto
    const g = Math.round(155 - t * 155); // 155 a 0
    const b = Math.round(0); // mantiene azul bajo
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Función para obtener el nivel de IIBB
export function getIIBBLevel(percentage: number): string {
  if (percentage <= 1.2) return "Muy Bajo";
  if (percentage <= 1.8) return "Bajo";
  if (percentage <= 2.5) return "Medio";
  if (percentage <= 3.2) return "Alto";
  return "Muy Alto";
}

// Función para obtener estadísticas de IIBB
export function getIIBBStats(data: Record<string, number>) {
  const values = Object.values(data);
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, total: 0 };
  }
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const total = Object.keys(data).length;

  return {
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    avg: Number(avg.toFixed(2)),
    total
  };
}

// Función para obtener ejemplos de provincias por nivel
export function getExampleProvinces(data: Record<string, number>) {
  const examples: Record<string, string[]> = {
    "Muy Bajo": [],
    "Bajo": [],
    "Medio": [],
    "Alto": [],
    "Muy Alto": []
  };

  Object.entries(data).forEach(([province, percentage]) => {
    const level = getIIBBLevel(percentage);
    if (examples[level].length < 2) {
      examples[level].push(province);
    }
  });

  return examples;
}

// Función para generar opciones de años dinámicamente
export function getYearOptions(data: IIBBDataItem[]): { value: string; label: string }[] {
  const years = getAvailableYears(data);
  return years.map(year => ({ value: year, label: year }));
}

// Función para generar opciones de actividades dinámicamente
export function getActivityOptions(data: IIBBDataItem[], year?: string): { value: string; label: string }[] {
  const activities = getAvailableActivities(data, year);
  
  // Agregar "General" como primera opción
  const options = [{ value: "General", label: "General" }];
  
  // Agregar actividades específicas
  activities.forEach(activity => {
    if (activity && activity !== "") {
      options.push({ value: activity, label: activity });
    }
  });
  
  return options;
}

// Función para obtener datos agregados por año y actividad
export function getDataSummary(data: IIBBDataItem[]) {
  const summary = {
    totalRecords: data.length,
    uniqueProvinces: getAvailableProvinces(data).length,
    availableYears: getAvailableYears(data),
    availableActivities: getAvailableActivities(data),
    dataByYear: {} as Record<string, number>,
    dataByActivity: {} as Record<string, number>
  };
  
  // Contar registros por año
  data.forEach(item => {
    summary.dataByYear[item.anio] = (summary.dataByYear[item.anio] || 0) + 1;
  });
  
  // Contar registros por actividad
  data.forEach(item => {
    const activity = item.act_econ_nivel_1 || "Sin categoría";
    summary.dataByActivity[activity] = (summary.dataByActivity[activity] || 0) + 1;
  });
  
  return summary;
}

// Función para validar y limpiar datos
export function validateAndCleanData(rawData: IIBBDataItem[]): IIBBDataItem[] {
  return rawData
    .filter(item => {
      // Validar que tenga los campos mínimos requeridos
      return item && 
             item.anio && item.anio !== '' &&
             item.provincia && item.provincia !== '';
    })
    .map(item => ({
      anio: String(item.anio).trim(),
      act_econ_nivel_1: String(item.act_econ_nivel_1 || '').trim(),
      act_econ_nivel_2: String(item.act_econ_nivel_2 || '').trim(),
      provincia: String(item.provincia).trim(),
      prov_id: String(item.prov_id || '').trim(),
      unique_id: String(item.unique_id || '').trim(),
      alicuota_pct: String(item.alicuota_pct || '').trim()
    }));
}

// Datos por defecto para el año actual (se actualizará cuando se carguen los datos reales)
export const IIBB_DATA = {}; 