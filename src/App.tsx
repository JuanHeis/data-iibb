import { useState, useMemo, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Search,
  Calendar,
  Building2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import MapChart from "@/components/MapChart";
import {
  RAW_IIBB_DATA,
  getFilteredIIBBData,
  getIIBBStats,
  getIIBBLevel,
  getColorByIIBB,
  getYearOptions,
  getActivityOptions,
  getAvailableYears,
  type IIBBDataItem,
} from "@/constants/constants";

export default function App() {
  // Estado para los datos crudos (se actualizará cuando se carguen los datos reales)
  const [rawData] = useState<IIBBDataItem[]>(RAW_IIBB_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    "General",
  ]);

  // Inicializar año por defecto cuando haya datos
  const availableYears = useMemo(() => getAvailableYears(rawData), [rawData]);
  const currentYear =
    selectedYear || (availableYears.length > 0 ? availableYears[0] : "2024");

  // Debug: verificar datos en consola
  useEffect(() => {
    if (rawData.length > 0) {
      console.log("📊 Total registros:", rawData.length);
      console.log("📅 Años disponibles:", availableYears);
      console.log("🏛️ Año actual:", currentYear);
      console.log("📋 Actividades seleccionadas:", selectedActivities);
    }
  }, [rawData, availableYears, currentYear, selectedActivities]);

  // Datos filtrados basados en año y actividades seleccionadas
  const currentData = useMemo(() => {
    if (rawData.length === 0) return {};
    const filtered = getFilteredIIBBData(
      rawData,
      currentYear,
      selectedActivities
    );
    console.log(
      "🗂️ Datos filtrados para",
      currentYear,
      ":",
      Object.keys(filtered).length,
      "provincias"
    );
    return filtered;
  }, [rawData, currentYear, selectedActivities]);

  const stats = useMemo(() => getIIBBStats(currentData), [currentData]);

  const yearOptions = useMemo(() => getYearOptions(rawData), [rawData]);
  const activityOptions = useMemo(
    () => getActivityOptions(rawData, currentYear),
    [rawData, currentYear]
  );

  const handleActivityChange = (activity: string, checked: boolean) => {
    setSelectedActivities((prev) => {
      if (activity === "General") {
        return checked ? ["General"] : [];
      } else {
        const withoutGeneral = prev.filter((a) => a !== "General");
        if (checked) {
          const newActivities = [...withoutGeneral, activity];
          return newActivities;
        } else {
          const filtered = withoutGeneral.filter((a) => a !== activity);
          return filtered.length === 0 ? ["General"] : filtered;
        }
      }
    });
  };

  // Filtrar provincias para la búsqueda
  const filteredProvinces = Object.entries(currentData).filter(([province]) =>
    province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar mensaje si no hay datos
  if (rawData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Dashboard IIBB - Argentina
            </CardTitle>
            <CardDescription>Esperando datos para cargar...</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Los datos de IIBB se cargarán próximamente. Una vez cargados,
              podrás explorar:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
              <li>Datos por año y actividad económica</li>
              <li>Mapa interactivo de provincias argentinas</li>
              <li>Filtros dinámicos por categorías</li>
              <li>Estadísticas y análisis detallados</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-6 w-6 text-blue-600 " />
              Monitor Fiscal Provincial
            </CardTitle>
            <CardDescription>
              Análisis interactivo del Impuesto sobre los Ingresos Brutos por
              provincia
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rango de Alícuotas
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.min}% - {stats.max}%
              </div>
              <p className="text-xs text-muted-foreground">
                Variación significativa entre provincias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Promedio Nacional
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg}%</div>
              <p className="text-xs text-muted-foreground">
                Alícuota promedio ponderada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Provincias Analizadas
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Cobertura completa del territorio
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Mapa Principal */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Mapa de IIBB por Provincias Argentinas
                </CardTitle>
                <CardDescription>
                  Visualización interactiva del Impuesto sobre los Ingresos
                  Brutos (IIBB) por provincia. Los colores van de verde (bajo) a
                  rojo (alto), con valores entre 1% y 3.7%.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* CRÍTICO: Sin restricciones de altura o contenedor que limiten el mapa */}
                <div className="w-full">
                  <MapChart data={currentData} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* ¿Qué es el IIBB? */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  ¿Qué es el IIBB?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  El <strong>Impuesto sobre los Ingresos Brutos</strong> es un
                  tributo provincial que grava el ejercicio habitual de
                  actividades económicas.
                </p>

                <Accordion type="single" collapsible>
                  <AccordionItem value="caracteristicas">
                    <AccordionTrigger className="text-sm">
                      Características:
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Tributo de naturaleza provincial</li>
                        <li>Grava actividades habituales</li>
                        <li>Base imponible: ingresos brutos</li>
                        <li>Alícuotas variables por jurisdicción</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="impacto">
                    <AccordionTrigger className="text-sm">
                      Impacto:
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Principal fuente de recursos provinciales</li>
                        <li>Afecta competitividad empresarial</li>
                        <li>Genera distorsiones en el mercado</li>
                        <li>Influye en decisiones de localización</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Selector de Año */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Selector de Variable (Año)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={currentYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Selector de Actividad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Actividad Económica (Nivel 1)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activityOptions.map((activity) => (
                  <div
                    key={activity.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={activity.value}
                      checked={selectedActivities.includes(activity.value)}
                      onCheckedChange={(checked) =>
                        handleActivityChange(activity.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={activity.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {activity.label}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Fuente de Datos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fuente de Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Datos IIBB con escala de colores - {stats.total} provincias
                    argentinas. Formulado por Juan I. Fernández y DataDriven.
                  </p>
                  <Separator />
                  <p className="text-xs">
                    <strong>Última actualización:</strong> {currentYear}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Buscar Provincias - Solo Mobile */}
        <div className="md:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-blue-600" />
                Buscar Provincia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Escribir nombre de provincia..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />

              {/* Leyenda IIBB - Solo cuando no hay búsqueda */}
              {!searchTerm && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Leyenda IIBB por Provincia
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: getColorByIIBB(1.0) }}
                        ></div>
                        <span className="text-sm">1.0% - Muy Bajo (Verde)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: getColorByIIBB(1.85) }}
                        ></div>
                        <span className="text-sm">
                          1.85% - Medio (Amarillo)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: getColorByIIBB(2.5) }}
                        ></div>
                        <span className="text-sm">2.5% - Alto (Naranja)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: getColorByIIBB(3.7) }}
                        ></div>
                        <span className="text-sm">3.7% - Muy Alto (Rojo)</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Resultados de búsqueda */}
              {searchTerm && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredProvinces.length > 0 ? (
                    filteredProvinces.map(([province, percentage]) => (
                      <div
                        key={province}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium">{province}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: getColorByIIBB(percentage),
                              color: getColorByIIBB(percentage),
                            }}
                          >
                            {percentage}%
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {getIIBBLevel(percentage)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No se encontraron provincias
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
