"use client"

import { useState } from "react"
import {
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react"
import SideNav from "../../components/sideNav"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import useHospital from "@/services/useFetchCompany"
import { auth } from '@/lib/firebaseConfig'
import { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
// Sample data for charts
const usageData = [
  { date: "Jan", queries: 2500, tokens: 125000, cost: 2.5 },
  { date: "Feb", queries: 3200, tokens: 160000, cost: 3.2 },
  { date: "Mar", queries: 2800, tokens: 140000, cost: 2.8 },
  { date: "Apr", queries: 4300, tokens: 215000, cost: 4.3 },
  { date: "May", queries: 3800, tokens: 190000, cost: 3.8 },
  { date: "Jun", queries: 5100, tokens: 255000, cost: 5.1 },
  { date: "Jul", queries: 4700, tokens: 235000, cost: 4.7 },
  { date: "Aug", queries: 6200, tokens: 310000, cost: 6.2 },
  { date: "Sep", queries: 5800, tokens: 290000, cost: 5.8 },
  { date: "Oct", queries: 7500, tokens: 375000, cost: 7.5 },
  { date: "Nov", queries: 8200, tokens: 410000, cost: 8.2 },
  { date: "Dec", queries: 9000, tokens: 450000, cost: 9.0 },
]

const agentUsageData = [
  { name: "Customer Support", value: 35 },
  { name: "Product Recommendations", value: 25 },
  { name: "Content Moderation", value: 20 },
  { name: "Data Analysis", value: 15 },
  { name: "Other", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  description: string;
}

export default function Chart() {
  const [timeRange, setTimeRange] = useState("monthly")
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
      });
      return () => unsubscribe();
  }, []);

  const { hospital }  = useHospital({
      userId: user?.uid,
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Same as dashboard but with Chart instead of Interact */}
      <SideNav />

      {/* Main Content - Chart Page */}
      <div className="flex-1 overflow-auto">
        <header className="flex h-14 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <span className="font-medium">{hospital?.organization}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Feedback
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
              <span className="text-sm font-medium">PP</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Monitor your AI agents' performance and usage metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" /> Date Range
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Total Queries"
              value="58,300"
              change="+12.5%"
              trend="up"
              description="vs. previous period"
            />
            <SummaryCard
              title="Total Tokens"
              value="2.91M"
              change="+8.2%"
              trend="up"
              description="vs. previous period"
            />
            <SummaryCard
              title="Avg. Response Time"
              value="0.7s"
              change="-15.3%"
              trend="down"
              description="vs. previous period"
            />
            <SummaryCard
              title="User Satisfaction"
              value="91%"
              change="+3.7%"
              trend="up"
              description="vs. previous period"
            />
          </div>

          <Tabs defaultValue="usage" className="space-y-6">
            <TabsList>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="distribution">Performance</TabsTrigger>
            </TabsList>

            {/* Usage Tab */}
            <TabsContent value="usage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Usage Over Time</CardTitle>
                  <CardDescription>Number of queries and tokens processed monthly</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] w-[90rem]">
                  <ChartContainer
                    config={{
                      queries: {
                        label: "Queries",
                        color: "hsl(var(--chart-1))",
                      },
                      tokens: {
                        label: "Tokens (thousands)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="queries"
                          stroke="var(--color-queries)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="tokens"
                          stroke="var(--color-tokens)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Distribution Tab */}
            <TabsContent value="distribution" className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Usage Distribution</CardTitle>
                  <CardDescription>Percentage of queries by agent type</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={agentUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {agentUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Usage"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Growth Trend</CardTitle>
                  <CardDescription>Cumulative usage growth over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="queries" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, change, trend, description }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="mt-2 flex items-baseline">
          <h3 className="text-2xl font-bold">{value}</h3>
          <span className={cn("ml-2 text-sm font-medium", trend === "up" ? "text-green-500" : "text-red-500")}>
            {change}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function TrendingUp(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function TrendingDown(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  )
}