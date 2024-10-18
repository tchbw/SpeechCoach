"use client";

import { Bar, BarChart, LabelList, Rectangle, XAxis, YAxis } from "recharts";

import type { SpeechAnalysis } from "@/app/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/client/components/ui/chart";

export const description = `A collection of health charts.`;

export default function Analysis({
  analysisResults,
}: {
  analysisResults: SpeechAnalysis;
}) {
  return (
    <div className="chart-wrapper mx-auto flex max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-[22rem] lg:grid-cols-1 xl:max-w-[25rem]">
        <TopWordsCard topWords={analysisResults.topWords} />
        {` `}
      </div>
      <div className="grid w-full flex-1 gap-6 lg:max-w-[20rem]">
        <GradeLevelCard analysisResults={analysisResults} />
        <SpeakingPaceCard analysisResults={analysisResults} />
        <Card className="max-w-xs" x-chunk="charts-01-chunk-4">
          <CardHeader>
            <CardTitle>Filler words</CardTitle>
          </CardHeader>
          <CardContent className="">
            {Object.keys(analysisResults.fillerWords).length === 0 && (
              <CardDescription>
                You didn&apos;t use any filler words. Nice job!
              </CardDescription>
            )}
            {Object.keys(analysisResults.fillerWords).length !== 0 && (
              <ChartContainer
                config={Object.fromEntries(
                  Object.keys(analysisResults.fillerWords).map((word) => [
                    word,
                    {
                      label: word,
                      color: `hsl(var(--chart-${Object.keys(analysisResults.fillerWords).indexOf(word) + 1}))`,
                    },
                  ])
                )}
                className="h-[140px] w-full"
              >
                <BarChart
                  margin={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 10,
                  }}
                  data={Object.entries(analysisResults.fillerWords).map(
                    ([word, count]) => ({
                      word,
                      value: count,
                      label: `${count}`,
                      fill: `var(--color-${word.replace(/\s+/g, `-`)})`,
                    })
                  )}
                  layout="vertical"
                  barSize={32}
                  barGap={2}
                >
                  <XAxis type="number" dataKey="value" hide />
                  <YAxis
                    dataKey="word"
                    type="category"
                    tickLine={false}
                    tickMargin={4}
                    axisLine={false}
                    className="capitalize"
                  />
                  <Bar dataKey="value" radius={5}>
                    <LabelList
                      position="insideLeft"
                      dataKey="label"
                      fill="white"
                      offset={8}
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid w-full flex-1 gap-6">
        <ResponseStructureComparisonCard analysisResults={analysisResults} />
      </div>
    </div>
  );
}

function TopWordsCard({ topWords }: { topWords: SpeechAnalysis[`topWords`] }) {
  return (
    <Card className="lg:max-w-md">
      <CardHeader className="space-y-0 pb-2">
        <CardDescription>Top Words</CardDescription>
        <CardTitle className="text-4xl tabular-nums">
          {Object.keys(topWords).length}
          {` `}
          <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
            words
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: `Count`,
              color: `hsl(var(--chart-1))`,
            },
          }}
        >
          <BarChart
            accessibilityLayer
            margin={{
              left: -4,
              right: -4,
            }}
            data={Object.entries(topWords).map(([word, count]) => ({
              word,
              count,
            }))}
          >
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={5}
              fillOpacity={0.6}
              activeBar={<Rectangle fillOpacity={0.8} />}
            />
            <XAxis
              dataKey="word"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideIndicator />}
              cursor={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <CardDescription>
          Your top {Object.keys(topWords).length} most used words.
        </CardDescription>
      </CardFooter>
    </Card>
  );
}

function GradeLevelCard({
  analysisResults,
}: {
  analysisResults: SpeechAnalysis;
}) {
  return (
    <Card className="max-w-xs" x-chunk="charts-01-chunk-2">
      <CardHeader>
        <CardTitle>Grade level</CardTitle>
        <CardDescription>
          This is the grade level of your speaking compared to the reference
          speaker.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid auto-rows-min gap-2">
          <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
            {analysisResults.gradeLevel}
            <span className="text-sm font-normal text-muted-foreground">
              grade level
            </span>
          </div>
          <ChartContainer
            config={{
              steps: {
                label: `Steps`,
                color: `hsl(var(--chart-1))`,
              },
            }}
            className="aspect-auto h-[32px] w-full"
          >
            <BarChart
              accessibilityLayer
              layout="vertical"
              margin={{
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
              }}
              data={[
                {
                  date: `Your grade level`,
                  steps: analysisResults.gradeLevel,
                },
              ]}
            >
              <Bar
                dataKey="steps"
                fill="var(--color-steps)"
                radius={4}
                barSize={32}
              ></Bar>
              <YAxis dataKey="date" type="category" tickCount={1} hide />
              <XAxis dataKey="steps" type="number" hide />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="grid auto-rows-min gap-2">
          <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
            {analysisResults.reference.referenceGradeLevel}
            <span className="text-sm font-normal text-muted-foreground">
              grade level
            </span>
          </div>
          <ChartContainer
            config={{
              steps: {
                label: `Steps`,
                color: `hsl(var(--muted))`,
              },
            }}
            className="aspect-auto h-[32px] w-full"
          >
            <BarChart
              accessibilityLayer
              layout="vertical"
              margin={{
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
              }}
              data={[
                {
                  date: `Reference grade level`,
                  steps: analysisResults.reference.referenceGradeLevel,
                },
              ]}
            >
              <Bar
                dataKey="steps"
                fill="var(--color-steps)"
                radius={4}
                barSize={32}
              ></Bar>
              <YAxis dataKey="date" type="category" tickCount={1} hide />
              <XAxis dataKey="steps" type="number" hide />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function SpeakingPaceCard({
  analysisResults,
}: {
  analysisResults: SpeechAnalysis;
}) {
  return (
    <Card className="max-w-xs" x-chunk="charts-01-chunk-3">
      <CardHeader className="p-4 pb-0">
        <CardTitle>Speaking pace</CardTitle>
        <CardDescription>
          Reference speaks at approximately{` `}
          {analysisResults.reference.referenceSpeakingPace} words per minute.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
        <div className="mt-2 flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
          {analysisResults.speakingPace}
          <span className="text-sm font-normal text-muted-foreground">
            words/minute
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function ResponseStructureComparisonCard({
  analysisResults,
}: {
  analysisResults: SpeechAnalysis;
}) {
  return (
    <Card className="max-w-md" x-chunk="charts-01-chunk-5">
      <CardHeader>
        <CardTitle>Response Structure Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-left">Your Response</th>
                <th className="p-2 text-left">Reference Response</th>
              </tr>
            </thead>
            <tbody>
              {analysisResults.structure.map((item, index) => (
                <tr key={index}>
                  <td className="p-2">{item}</td>
                  <td className="p-2">
                    {analysisResults.reference.impersonatedResponseStructure[
                      index
                    ] || ``}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardTitle>Reference response</CardTitle>
        <CardDescription>
          {analysisResults.reference.impersonatedResponse}
        </CardDescription>
        <CardTitle>Advice</CardTitle>
        <CardDescription>
          {analysisResults.reference.feedbackToMatchReference}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
