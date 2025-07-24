import { useState, useMemo, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import MapChart from "@/components/MapChart";
import ColorLegend from "@/components/ColorLegend";
import HorizontalBarChart from "@/components/horizontalChart"; // Importar el nuevo componente
import dataDrive from "@/assets/datadriven.jfif";
import {
  RAW_IIBB_DATA,
  getAvailableYears,
  getActivityOptions,
  getFilteredIIBBData,
  getFilteredIIBBDataExcludingConsensus,
  getConsensoFiscalValue,
  getIIBBStats,
  getColorByIIBB,
} from "@/constants/constants";
import { BarChart, Building2, MapPin } from "lucide-react";
import { Funnel } from "lucide-react";

function App() {
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    "General",
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const availableYears = useMemo(() => getAvailableYears(RAW_IIBB_DATA), []);
  const activityOptions = useMemo(
    () => getActivityOptions(RAW_IIBB_DATA, selectedYear),
    [selectedYear]
  );

  const provincialData = useMemo(
    () =>
      getFilteredIIBBDataExcludingConsensus(
        RAW_IIBB_DATA,
        selectedYear,
        selectedActivities
      ),
    [selectedYear, selectedActivities]
  );

  // Datos incluyendo consenso fiscal para el mapa
  const allData = useMemo(
    () => getFilteredIIBBData(RAW_IIBB_DATA, selectedYear, selectedActivities),
    [selectedYear, selectedActivities]
  );

  // Valor del consenso fiscal
  const consensoValue = useMemo(
    () =>
      getConsensoFiscalValue(RAW_IIBB_DATA, selectedYear, selectedActivities),
    [selectedYear, selectedActivities]
  );

  // Calcular min/max solo de las provincias (sin consenso fiscal)
  const { min: minValue, max: maxValue } = useMemo(() => {
    const values = Object.values(provincialData);
    if (values.length === 0) return { min: 0, max: 3.7 };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [provincialData]);

  // Estadísticas basadas en datos provinciales
  const stats = useMemo(() => getIIBBStats(provincialData), [provincialData]);

  // Establecer año inicial
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, selectedYear]);

  // Función para manejar cambios en actividades (solo una selección permitida)
  const handleActivityChange = (activity: string, checked: boolean) => {
    if (checked) {
      // Si se marca una opción, se convierte en la única seleccionada
      setSelectedActivities([activity]);
    } else {
      // Si se desmarca la única opción seleccionada, vuelve a "General" por defecto
      setSelectedActivities(["General"]);
    }
  };

  // Filtrar provincias para búsqueda móvil
  const filteredProvinces = useMemo(() => {
    if (!searchTerm) return [];

    return Object.entries(provincialData)
      .filter(([province]) =>
        province.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5); // Máximo 5 resultados
  }, [searchTerm, provincialData]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Monitor Fiscal Provincial
            </h1>
            <p className="text-lg text-gray-600">
              Análisis de Alícuotas del Impuesto sobre los Ingresos Brutos por
              Provincia.
            </p>
          </div>
          <img src={dataDrive} className="h-[80px]" alt="" />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-medium">
                Provincias Analizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">de 24 provincias</p>
            </CardContent>
          </Card>

          <Card className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-medium">
                Promedio IIBB
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg}%</div>
              <p className="text-xs text-muted-foreground">alícuota promedio</p>
            </CardContent>
          </Card>

          <Card className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
              <CardTitle className="text-xl font-medium">Rango IIBB</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.min}% - {stats.max}%
              </div>
              <p className="text-xs text-muted-foreground">mínimo - máximo</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Funnel className="h-4 w-4 text-blue-600" />
                  Filtros
                </CardTitle>
                <CardDescription>
                  Configurá los parámetros de análisis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selector de Año */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Año</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar año" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Selector de Actividades */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Actividad Económica
                  </label>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="activities">
                      <AccordionTrigger className="text-sm">
                        Seleccionar Actividades ({selectedActivities.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {activityOptions.map((option) => (
                            <div
                              key={option.value}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={option.value}
                                checked={selectedActivities.includes(
                                  option.value
                                )}
                                onCheckedChange={(checked) =>
                                  handleActivityChange(
                                    option.value,
                                    checked as boolean
                                  )
                                }
                              />
                              <label
                                htmlFor={option.value}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
            </Card>
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
            {/* Buscador móvil */}
            <div className="block md:hidden">
              <Card>
                <CardHeader>
                  <CardTitle>Buscar Provincia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Escribí el nombre de una provincia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {filteredProvinces.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Resultados:</p>
                      <div className="flex flex-wrap gap-2">
                        {filteredProvinces.map(([province, value]) => (
                          <Badge
                            key={province}
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: getColorByIIBB(
                                value,
                                minValue,
                                maxValue
                              ),
                              color: value > 2 ? "white" : "black",
                              borderColor: getColorByIIBB(
                                value,
                                minValue,
                                maxValue
                              ),
                            }}
                          >
                            {province}: {value.toFixed(1)}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <ColorLegend
                    minValue={minValue}
                    maxValue={maxValue}
                    consensoValue={consensoValue ?? undefined}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Visualización de Datos IIBB</CardTitle>
                <CardDescription>
                  {Object.keys(provincialData).length > 0
                    ? `Mostrando datos de ${selectedYear} para ${selectedActivities.join(
                        ", "
                      )}`
                    : "Esperando datos para cargar..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="map" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="map">
                      <MapPin /> Mapa
                    </TabsTrigger>
                    <TabsTrigger value="horizontal-chart">
                      <BarChart /> Barras
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="map" className="space-y-4">
                    <div className="relative">
                      <MapChart data={allData} />

                      {/* Leyenda solo en desktop */}
                      <div className="hidden md:block absolute bottom-4 right-4">
                        <ColorLegend
                          minValue={minValue}
                          maxValue={maxValue}
                          consensoValue={consensoValue ?? undefined}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="horizontal-chart" className="space-y-4">
                    <HorizontalBarChart
                      data={provincialData}
                      consensoValue={consensoValue ?? undefined}
                      minValue={minValue}
                      maxValue={maxValue}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer con información adicional */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500">
              <p>
                Datos del Impuesto sobre los Ingresos Brutos por provincia •
                Último año disponible:{" "}
                {availableYears[availableYears.length - 1]}
              </p>
              <p>
                Fuente: Data Driven en base a Subsecretaría de Coordinación
                Fiscal Provincial con datos de ERREPAR
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
