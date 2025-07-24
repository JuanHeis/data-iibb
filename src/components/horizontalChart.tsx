import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getColorByIIBB, CONSENSO_FISCAL_COLOR } from "@/constants/constants";
import { ChartContainer, ChartTooltipContent } from "./ui/chart";

// Props interface
interface HorizontalBarChartProps {
  data: Record<string, number>;
  consensoValue?: number;
  minValue: number;
  maxValue: number;
}

// Data item interface for the chart
interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  consensoValue,
  minValue,
  maxValue,
}) => {
  const chartData: ChartDataItem[] = [];

  // Add provincial data
  Object.entries(data).forEach(([provincia, value]) => {
    chartData.push({
      name: provincia,
      value: value,
      color: getColorByIIBB(value, minValue, maxValue),
    });
  });

  // Add "Consenso Fiscal" data if available
  if (consensoValue !== undefined && consensoValue !== null) {
    chartData.push({
      name: "Consenso Fiscal",
      value: consensoValue,
      color: CONSENSO_FISCAL_COLOR,
    });
  }

  // Sort data from lowest to highest to display bars from bottom to top
  chartData.sort((a, b) => a.value - b.value);

  // Custom Tooltip component
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: ChartDataItem }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 p-2 border rounded-lg shadow-lg text-sm">
          <p className="font-bold">{label}</p>
          <p>IIBB: {payload[0].value.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  // Dynamic height for the container based on number of items
  const chartHeight = chartData.length * 35;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Alícuotas IIBB</CardTitle>
        <CardDescription>
          Comparativa de IIBB por provincia, de menor a mayor alícuota.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
          >
            <XAxis type="number" tickLine={true} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.reverse().map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="flex items-center justify-center"
                ></Cell>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default HorizontalBarChart;
