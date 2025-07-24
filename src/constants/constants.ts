import { datos } from "./datos";

export interface IIBBDataItem {
  anio: string;
  act_econ_nivel_1: string;
  act_econ_nivel_2: string;
  provincia: string;
  prov_id: string;
  unique_id: string;
  alicuota_pct: string;
}

export const PROVINCE_NAME_MAPPING: Record<string, string> = {
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
  "Sgo del Estero": "Santiago del Estero",
  "Tierra del Fuego": "Tierra del Fuego",
  "Tucumán": "Tucumán"
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

export const MAP_JSON = {
  type: "Topology",
  arcs: [
    [[3027, 4077], [1, 1]],
    [[3028, 4078], [-1, -1]],
    [[3029, 4078], [-167, 92], [0, 403]],
    [[2862, 4573], [-1, 716], [-1, 539]],
    [[2860, 5828], [0, 178], [142, 1]],
    [[3002, 6007], [329, 1], [226, 216], [128, 2], [59, 107]],
    [[3744, 6333], [182, -124], [94, -8], [180, -95], [59, 11]],
    [[4259, 6117], [-10, -154]],
    [[4249, 5963], [31, -29]],
    [
      [4280, 5934],
      [235, -113],
      [107, -116],
      [-66, -94],
      [24, -112],
      [153, -57],
      [18, -160],
      [-131, -182],
      [-107, -106],
      [-7, -65],
      [-168, -92],
      [-246, -78],
      [-516, -87],
      [-272, -2],
      [-137, 58],
      [0, -135],
      [82, -31],
      [-30, -150],
      [-103, -124],
      [75, -105],
      [-27, -61],
      [-135, -44]
    ],
    [[2457, 7407], [-22, -99], [-143, -63]],
    [
      [2292, 7245],
      [-95, 245],
      [-101, 98],
      [-78, 21],
      [-54, 159],
      [-117, 23],
      [-46, -40],
      [-136, 20],
      [-77, 55],
      [-151, 35],
      [-28, 85],
      [-149, -19]
    ],
    [
      [1260, 7927],
      [90, 199],
      [129, 56],
      [-79, 113],
      [55, 92],
      [-48, 156],
      [18, 145]
    ],
    [
      [1425, 8688],
      [144, -25],
      [402, -10],
      [-8, -115],
      [-59, -68],
      [94, -131],
      [106, 40]
    ],
    [[2104, 8379], [-22, -107], [81, -43], [-27, -236], [87, -120], [134, 7]],
    [[2357, 7880], [14, -227], [87, -115], [-1, -131]],
    [[3332, 7863], [1, 680], [-482, 1]],
    [[2851, 8544], [303, 365], [0, 83]],
    [
      [3154, 8992],
      [123, -46],
      [360, -263],
      [133, -137],
      [81, -47],
      [56, -88],
      [156, -62],
      [211, -158]
    ],
    [[4274, 8191], [-68, -125]],
    [[4206, 8066], [-79, -54], [-1, -150]],
    [[4126, 7862], [-794, 1]],
    [[1680, 2633], [-817, 0], [-323, -3]],
    [
      [540, 2630],
      [-25, 134],
      [123, 71],
      [-74, 93],
      [86, 57],
      [12, 104],
      [-162, 6],
      [26, 226],
      [-66, 52],
      [53, 81],
      [-110, 45],
      [2, 204],
      [102, 91]
    ],
    [[507, 3794], [355, 1], [844, 0], [683, 0]],
    [
      [2389, 3795],
      [264, -125],
      [150, 28],
      [-10, -126],
      [-133, -33],
      [-65, 100],
      [-98, 6],
      [-95, -76],
      [200, -61],
      [-189, -80],
      [-99, -119],
      [28, -209],
      [-128, -96],
      [11, -95],
      [-152, 18],
      [-231, -94],
      [-162, -200]
    ],
    [[4249, 5963], [31, -29]],
    [[2860, 5828], [-482, 0]],
    [[2378, 5828], [-11, 522], [34, 48], [28, 208], [-103, 78], [-136, 49]],
    [[2190, 6733], [2, 248], [100, 264]],
    [
      [2457, 7407],
      [139, 18],
      [148, -20],
      [100, -59],
      [188, -12],
      [73, -148],
      [112, -45]
    ],
    [
      [3217, 7141],
      [82, -56],
      [-84, -272],
      [-18, -148],
      [110, -188],
      [3, -74],
      [-308, -396]
    ],
    [[4432, 7060], [-133, 149], [-86, 23], [-184, -56], [-119, 3]],
    [[3910, 7179], [19, 285], [105, 87], [45, 167], [-12, 74], [59, 70]],
    [[4206, 8066], [102, 14], [269, -50], [128, -53], [66, 46], [160, 36]],
    [[4931, 8059], [-8, -39], [124, -197]],
    [[5047, 7823], [-227, -273], [-400, -407], [12, -83]],
    [
      [3744, 6333],
      [-120, 105],
      [-20, 123],
      [22, 212],
      [148, 89],
      [145, 214],
      [-9, 103]
    ],
    [
      [4432, 7060],
      [-107, -403],
      [20, -230],
      [-85, -40],
      [-39, -189],
      [38, -81]
    ],
    [[3154, 8992], [5, 477]],
    [
      [3159, 9469],
      [96, -161],
      [252, -173],
      [25, -52],
      [192, -73],
      [77, 10],
      [195, -137],
      [197, -102],
      [219, -71],
      [90, -106],
      [-83, -163],
      [-75, -43],
      [-21, -143],
      [-49, -64]
    ],
    [
      [1785, 9111],
      [65, 205],
      [-54, 55],
      [124, 166],
      [114, 34],
      [31, 98],
      [133, -95],
      [158, 6]
    ],
    [
      [2356, 9580],
      [-43, -147],
      [27, -99],
      [66, -28],
      [39, -137],
      [128, -31],
      [68, 29],
      [5, -200],
      [-35, -63],
      [-107, -58],
      [-238, 45],
      [-145, 182],
      [9, 91],
      [-105, 38],
      [-13, -222],
      [-112, 17],
      [-115, 114]
    ],
    [
      [2862, 4573],
      [-301, 134],
      [-255, 2],
      [-200, 36],
      [-426, 141],
      [-87, 72],
      [5, 111],
      [-101, 10]
    ],
    [[1497, 5079], [0, 410], [-15, 49], [469, 0]],
    [[1951, 5538], [429, 0], [-2, 290]],
    [[2190, 6733], [-159, -34], [-105, 33]],
    [
      [1926, 6732],
      [-108, 145],
      [7, 146],
      [-177, 206],
      [-177, 146],
      [-183, 14],
      [10, 207],
      [-113, 139],
      [-82, 16]
    ],
    [[1103, 7751], [157, 176]],
    [[1497, 5079], [-231, 104], [-180, 37], [-191, 234], [-8, 53]],
    [
      [887, 5507],
      [24, 85],
      [-31, 141],
      [35, 162],
      [140, 158],
      [-22, 123],
      [42, 109],
      [-99, 112],
      [-11, 137]
    ],
    [
      [965, 6534],
      [87, 1],
      [65, 124],
      [130, 49],
      [56, -103],
      [271, 73],
      [168, -83]
    ],
    [
      [1742, 6595],
      [51, -124],
      [9, -188],
      [117, -150],
      [-21, -111],
      [67, -148],
      [20, -140],
      [-34, -196]
    ],
    [
      [4931, 8059],
      [85, -35],
      [83, 126],
      [132, 63],
      [73, 102],
      [31, 175],
      [121, 85],
      [80, -28],
      [54, -202],
      [-34, -233],
      [-152, -96],
      [-156, -52],
      [-13, -39],
      [-188, -102]
    ],
    [
      [482, 4077],
      [38, 401],
      [63, 8],
      [20, 202],
      [166, 106],
      [-105, 255],
      [24, 58],
      [1, 237],
      [156, 157],
      [42, 6]
    ],
    [
      [1497, 5079],
      [8, -404],
      [-104, -37],
      [-116, -119],
      [-265, -129],
      [-66, -154],
      [-228, -49],
      [-70, -130],
      [-174, 20]
    ],
    [[507, 3794], [-36, 109], [11, 174]],
    [[3029, 4078], [-1, 0]],
    [[3027, 4077], [-97, -38], [-182, 0], [-294, 116]],
    [[2454, 4155], [-87, -45], [45, -176], [-23, -139]],
    [[1425, 8688], [-20, 118], [55, 81], [290, 126], [35, 98]],
    [[2356, 9580], [182, -59], [76, -105], [94, 188], [317, -1], [134, -134]],
    [[2851, 8544], [-242, -20], [-58, -149]],
    [[2551, 8375], [-110, -8], [-222, 41], [-115, -29]],
    [
      [965, 6534],
      [-52, 91],
      [33, 83],
      [-99, 119],
      [12, 116],
      [119, 225],
      [43, 4],
      [16, 202],
      [-36, 93],
      [58, 59],
      [44, 225]
    ],
    [[1926, 6732], [-189, 2], [5, -139]],
    [
      [1680, 2633],
      [42, -159],
      [184, -133],
      [239, -23],
      [55, -125],
      [-65, -156],
      [-147, -108],
      [-177, -76],
      [-151, -151],
      [-19, -167],
      [-118, -96],
      [-199, -63],
      [-84, -195],
      [114, -271],
      [-21, -102],
      [-336, 81],
      [-532, 0],
      [-144, 135],
      [46, 87],
      [-5, 167],
      [-129, 13],
      [-120, -42],
      [-113, 349],
      [182, 179],
      [104, 44],
      [-12, 93],
      [84, 35],
      [-61, 118],
      [100, 154],
      [83, 54],
      [-20, 121],
      [80, 38],
      [-34, 132],
      [34, 64]
    ],
    [[3217, 7141], [115, 722]],
    [[2357, 7880], [129, 321], [63, 43], [2, 131]],
    [
      [1702, 58],
      [-207, 19],
      [-102, -29],
      [1, 651],
      [90, -87],
      [93, -193],
      [415, -248],
      [191, -53],
      [-52, -73],
      [-151, -44],
      [-278, 57]
    ]
  ],
  transform: {
    scale: [0.0035565227853309477, 0.003442034403764608],
    translate: [-73.56581116, -55.05957794]
  },
  objects: {
    gadm36_ARG_1: {
      type: "GeometryCollection",
      geometries: [
        {
          arcs: [[2, 3, 4, 5, 6, 7, 8, 9]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.1_1",
            NAME: "Buenos Aires",
            COLOR: "#77C91E",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.BA",
            VALUE: "16666000"
          }
        },
        {
          arcs: [[10, 11, 12, 13, 14, 15]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.2_1",
            NAME: "Catamarca",
            COLOR: "#77C91E",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.CT",
            VALUE: "396895"
          }
        },
        {
          arcs: [[16, 17, 18, 19, 20, 21]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.3_1",
            NAME: "Chaco",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.CC",
            VALUE: "1131000"
          }
        },
        {
          arcs: [[22, 23, 24, 25]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.4_1",
            NAME: "Chubut",
            COLOR: "#77C91E",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.CH",
            VALUE: "556319"
          }
        },
        {
          arcs: [[26, -9]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.5_1",
            NAME: "Ciudad de Buenos Aires",
            COLOR:
              "#FFFBUENOS AIRES D.F.|Capital Federal|Distretto Federale|Distrito Federal|Federal Capital",
            NL_NAME_1: "",
            TYPE_1: "Distrito Federal",
            ENGTYPE_1: "Federal District",
            CC_1: "",
            HASC_1: "AR.DF",
            VALUE: "797675"
          }
        },
        {
          arcs: [[27, 28, 29, -11, 30, 31, -5]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.6_1",
            NAME: "Córdoba",
            COLOR: "#AAD500",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.CB",
            VALUE: "3506000"
          }
        },
        {
          arcs: [[32, 33, -21, 34, 35, 36]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.7_1",
            NAME: "Corrientes",
            COLOR: " #AAD500",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.CN",
            VALUE: "214523"
          }
        },
        {
          arcs: [[-7, 37, -33, 38]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.8_1",
            NAME: "Entre Ríos",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.ER",
            VALUE: "224535"
          }
        },
        {
          arcs: [[-19, 39, 40]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.9_1",
            NAME: "Formosa",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.FM",
            VALUE: "573823"
          }
        },
        {
          arcs: [[41, 42]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.10_1",
            NAME: "Jujuy",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.JY",
            VALUE: "718971"
          }
        },
        {
          arcs: [[43, 44, 45, -28, -4]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.11_1",
            NAME: "La Pampa",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.LP",
            VALUE: "364524"
          }
        },
        {
          arcs: [[46, 47, 48, -12, -30]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.12_1",
            NAME: "La Rioja",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.LR",
            VALUE: "312624"
          }
        },
        {
          arcs: [[49, 50, 51, 52, -45]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.13_1",
            NAME: "Mendoza",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.MZ",
            VALUE: "1888000"
          }
        },
        {
          arcs: [[-36, 53]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.14_1",
            NAME: "Misiones",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.MN",
            VALUE: "1175000"
          }
        },
        {
          arcs: [[54, -50, 55]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.15_1",
            NAME: "Neuquén",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.NQ",
            VALUE: "364524"
          }
        },
        {
          arcs: [[56, -56, -44, -3, 57, -1, 58, 59, -25]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.16_1",
            NAME: "Río Negro",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.RN",
            VALUE: "364524"
          }
        },
        {
          arcs: [[-14, 60, -43, 61, -40, -18, 62, 63]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.17_1",
            NAME: "Salta",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.SA",
            VALUE: "364524"
          }
        },
        {
          arcs: [[64, -48, 65, -52]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.18_1",
            NAME: "San Juan",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.SJ",
            VALUE: "364524"
          }
        },
        {
          arcs: [[-66, -47, -29, -46, -53]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.19_1",
            NAME: "San Luis",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.SL",
            VALUE: "476351"
          }
        },
        {
          arcs: [[-23, 66]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.20_1",
            NAME: "Santa Cruz",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.SC",
            VALUE: "320469"
          }
        },
        {
          arcs: [[-32, 67, -22, -34, -38, -6]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.21_1",
            NAME: "Santa Fe",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.SF",
            VALUE: "3369000"
          }
        },
        {
          arcs: [[-31, -16, 68, -63, -17, -68]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.22_1",
            NAME: "Santiago del Estero",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.SE",
            VALUE: "911506"
          }
        },
        {
          arcs: [[69]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.23_1",
            NAME: "Tierra del Fuego",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Territorio Nacional|Provincia",
            ENGTYPE_1: "National Territory",
            CC_1: "",
            HASC_1: "AR.TF",
            VALUE: "153317"
          }
        },
        {
          arcs: [[-64, -69, -15]],
          type: "Polygon",
          properties: {
            GID_0: "ARG",
            NAME_0: "Argentina",
            GID_1: "ARG.24_1",
            NAME: "Tucumán",
            COLOR: "#EBF5C2",
            NL_NAME_1: "",
            TYPE_1: "Provincia",
            ENGTYPE_1: "Province",
            CC_1: "",
            HASC_1: "AR.TM",
            VALUE: "364524"
          }
        }
      ]
    }
  }
};