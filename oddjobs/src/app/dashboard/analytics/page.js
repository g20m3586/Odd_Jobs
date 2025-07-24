"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = {
  submitted: "#8884d8",
  interview: "#83a6ed",
  offer: "#8dd1e1",
  rejected: "#82ca9d",
  jobs: "#3b82f6",
};

export default function AnalyticsPage() {
  const [mode, setMode] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobTrend, setJobTrend] = useState([]);
  const [appStatusPie, setAppStatusPie] = useState([]);
  const [statusOverTime, setStatusOverTime] = useState([]);
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    totalApps: 0,
    avgAppsPerJob: 0,
    responseRate: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw authError;

      const groupByUser = mode === "personal";

      // Fetch jobs data
      const jobsQuery = supabase.from("jobs").select("created_at");
      if (groupByUser) jobsQuery.eq("user_id", user.id);
      const { data: jobs = [] } = await jobsQuery;

      // Fetch applications data
      const appsQuery = supabase.from("applications").select("status, created_at, job_id");
      if (groupByUser) appsQuery.eq("user_id", user.id);
      const { data: apps = [] } = await appsQuery;

      // Calculate metrics
      const totalJobs = jobs.length;
      const totalApps = apps.length;
      const avgAppsPerJob = totalJobs > 0 ? (totalApps / totalJobs).toFixed(1) : 0;
      const respondedApps = apps.filter(app => 
        ["interview", "offer", "rejected"].includes(app.status)
      ).length;
      const responseRate = totalApps > 0 ? Math.round((respondedApps / totalApps) * 100) : 0;

      setMetrics({
        totalJobs,
        totalApps,
        avgAppsPerJob,
        responseRate,
      });

      // Process data for charts
      processChartData(jobs, apps);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (jobs, apps) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Job trend data
    const jobCounts = {};
    jobs
      .filter(job => new Date(job.created_at) >= sixMonthsAgo)
      .forEach(job => {
        const date = new Date(job.created_at);
        const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        jobCounts[monthYear] = (jobCounts[monthYear] || 0) + 1;
      });

    const sortedMonths = Object.keys(jobCounts).sort((a, b) => {
      const [aMonth, aYear] = a.split(' ');
      const [bMonth, bYear] = b.split(' ');
      return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
    });

    setJobTrend(sortedMonths.map(month => ({
      x: month,
      y: jobCounts[month] || 0
    })));

    // Application status over time
    const statusCountsByMonth = {};
    apps
      .filter(app => new Date(app.created_at) >= sixMonthsAgo)
      .forEach(app => {
        const date = new Date(app.created_at);
        const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        
        if (!statusCountsByMonth[monthYear]) {
          statusCountsByMonth[monthYear] = {
            month: monthYear,
            submitted: 0,
            interview: 0,
            offer: 0,
            rejected: 0,
          };
        }
        statusCountsByMonth[monthYear][app.status] += 1;
      });

    setStatusOverTime(Object.values(statusCountsByMonth));

    // Application status distribution
    const statusCounts = apps.reduce((acc, cur) => {
      acc[cur.status] = (acc[cur.status] || 0) + 1;
      return acc;
    }, { submitted: 0, interview: 0, offer: 0, rejected: 0 });

    setAppStatusPie([
      { id: "Submitted", value: statusCounts.submitted },
      { id: "Interview", value: statusCounts.interview },
      { id: "Offer", value: statusCounts.offer },
      { id: "Rejected", value: statusCounts.rejected },
    ]);
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Application Analytics</h1>
        <div className="flex gap-2 items-center">
          <Tabs value={mode} onValueChange={setMode} className="mr-2">
            <TabsList>
              <TabsTrigger value="personal">My Stats</TabsTrigger>
              <TabsTrigger value="global">Global Stats</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" onClick={fetchData} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-600 flex flex-col items-center space-y-2">
          <span>{error}</span>
          <Button onClick={fetchData} size="sm" variant="outline">
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalJobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalApps}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Apps per Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgAppsPerJob}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Response Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.responseRate}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Job Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === "personal" ? "My" : "Global"} Job Postings Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={jobTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="x" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke={COLORS.jobs}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Jobs"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Application Status Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="submitted" fill={COLORS.submitted} name="Submitted" />
                  <Bar dataKey="interview" fill={COLORS.interview} name="Interview" />
                  <Bar dataKey="offer" fill={COLORS.offer} name="Offer" />
                  <Bar dataKey="rejected" fill={COLORS.rejected} name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Application Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appStatusPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="id"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {appStatusPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.id.toLowerCase()]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      value, 
                      `${name}: ${((value / metrics.totalApps) * 100).toFixed(1)}%`
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}