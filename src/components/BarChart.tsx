"use client"

import React from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getColorByIIBB, CONSENSO_FISCAL_COLOR } from "@/constants/constants";

interface BarChartProps {
  data: Record<string, number>;
  consensoValue?: number;
  minValue: number;
  maxValue: number;
}

interface ChartDataItem {
  provincia: string;
  iibb: number;
  fill: string;
  isConsenso: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  consensoValue, 
  minValue, 
  maxValue 
}) => {
  // Preparar datos para el gráfico
  const chartData: ChartDataItem[] = [];
  
  // Agregar provincias
  Object.entries(data)
    .sort(([, a], [, b]) => b - a) // Ordenar de mayor a menor
    .forEach(([provincia, value]) => {
      chartData.push({
        provincia: provincia,
        iibb: value,
        fill: getColorByIIBB(value, minValue, maxValue),
        isConsenso: false,
      });
    });
  
  // Agregar Consenso Fiscal si existe
  if (consensoValue !== undefined && consensoValue !== null) {
    chartData.push({
      provincia: "Consenso Fiscal",
      iibb: consensoValue,
      fill: CONSENSO_FISCAL_COLOR,
      isConsenso: true,
    });
  }

  // Crear configuración dinámica del chart
  const chartConfig: ChartConfig = {
    iibb: {
      label: "IIBB %",
    },
  };

  // Agregar cada provincia a la configuración
  chartData.forEach((item) => {
    chartConfig[item.provincia] = {
      label: item.provincia,
    };
  });

  const estadisticas = {
    total: chartData.length,
    promedio: chartData.reduce((sum, item) => sum + item.iibb, 0) / chartData.length,
    maximo: Math.max(...chartData.map(item => item.iibb)),
    minimo: Math.min(...chartData.map(item => item.iibb))
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Barras - IIBB por Provincia</CardTitle>
        <CardDescription>
          Alícuotas ordenadas de mayor a menor (incluyendo Consenso Fiscal)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <RechartsBarChart
            accessibilityLayer
            data={chartData}
            layout="horizontal"
            margin={{
              left: 80, // Espacio para etiquetas de provincias
              right: 20,
              top: 20,
              bottom: 20,
            }}
          >
            <YAxis
              dataKey="provincia"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={true}
              width={70}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                // Truncar nombres largos
                return value.length > 12 ? value.substring(0, 12) + "..." : value;
              }}
            />
            <XAxis 
              dataKey="iibb" 
              type="number" 
              domain={[0, 'dataMax']}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataItem;
                  return (
                    <ChartTooltipContent 
                      hideLabel 
                      className="bg-white border rounded-lg shadow-lg p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{data.provincia}</p>
                        <p className="text-sm text-gray-600">
                          IIBB: {data.iibb.toFixed(2)}%
                        </p>
                        {data.isConsenso && (
                          <p className="text-xs text-gray-500">
                            (Alícuota Máxima)
                          </p>
                        )}
                      </div>
                    </ChartTooltipContent>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="iibb" 
              radius={[0, 4, 4, 0]}
              stroke="#fff"
              strokeWidth={1}
            />
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Rango: {estadisticas.minimo.toFixed(1)}% - {estadisticas.maximo.toFixed(1)}% 
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Promedio nacional: {estadisticas.promedio.toFixed(2)}% • {estadisticas.total} jurisdicciones analizadas
        </div>
      </CardFooter>
    </Card>
  );
};

export default BarChart; 