import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { getColorByIIBB, CONSENSO_FISCAL_COLOR } from "@/constants/constants";

// Props interface remains the same
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
  const chartConfig: ChartConfig = {};

  // Add provincial data
  Object.entries(data).forEach(([provincia, value]) => {
    const color = getColorByIIBB(value, minValue, maxValue);
    chartData.push({ name: provincia, value, color });
    chartConfig[provincia] = { label: provincia, color };
  });

  // Add "Consenso Fiscal" data if available
  if (consensoValue !== undefined && consensoValue !== null) {
    chartData.push({
      name: "Consenso Fiscal",
      value: consensoValue,
      color: CONSENSO_FISCAL_COLOR,
    });
    chartConfig["Consenso Fiscal"] = {
      label: "Consenso Fiscal",
      color: CONSENSO_FISCAL_COLOR,
    };
  }

  // Sort data from highest to lowest for a top-to-bottom ranking
  chartData.sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Alícuotas IIBB</CardTitle>
        <CardDescription>
          Comparativa de IIBB por provincia, de mayor a menor alícuota.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[700px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 120, // More space for Y-Axis labels
              right: 50,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 14 }}
              width={110} // Explicit width for the axis
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <></>
                // <ChartTooltipContent
                //   indicator="line"
                //   hidden
                //   formatter={(value) => `IIBB: ${Number(value).toFixed(2)}%`}
                // />
              }
            />
            <Bar dataKey="value" layout="vertical" radius={5}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground font-semibold"
                fontSize={12}
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default HorizontalBarChart;
