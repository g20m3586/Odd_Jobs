"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { RefreshCcw } from "lucide-react";

export default function AnalyticsPage() {
  const [mode, setMode] = useState("personal"); // 'personal' or 'global'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobTrend, setJobTrend] = useState([]);
  const [appStatusPie, setAppStatusPie] = useState([]);
  const [allJobs, setAllJobs] = useState(0);
  const [allApps, setAllApps] = useState(0);

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

      // Job count per month
      const jobsRes = await supabase
        .from("jobs")
        .select("created_at", { count: "exact", head: false })
        .eq(groupByUser ? "user_id" : "id", groupByUser ? user.id : undefined);

      // Applications grouped by status
      const appsRes = await supabase
        .from("applications")
        .select("status", { count: "exact", head: false })
        .eq(groupByUser ? "user_id" : "id", groupByUser ? user.id : undefined);

      const jobs = jobsRes.data || [];
      const apps = appsRes.data || [];

      // Transform jobTrend
      const countsByMonth = {};
      jobs.forEach((job) => {
        const month = new Date(job.created_at).toISOString().substr(0, 7);
        countsByMonth[month] = (countsByMonth[month] || 0) + 1;
      });
      const sortedTrend = Object.entries(countsByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ x: month, y: count }));
      setJobTrend([{ id: "Jobs per Month", data: sortedTrend }]);

      // Pie slice for status
      const statusCounts = apps.reduce((acc, cur) => {
        acc[cur.status] = (acc[cur.status] || 0) + 1;
        return acc;
      }, {});
      const pieData = Object.entries(statusCounts).map(([status, count]) => ({
        id: status,
        value: count,
      }));
      setAppStatusPie(pieData);

      if (!groupByUser) {
        setAllJobs(jobs.length);
        setAllApps(apps.length);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "personal" ? "primary" : "outline"}
            onClick={() => setMode("personal")}
          >
            My Stats
          </Button>
          <Button
            size="sm"
            variant={mode === "global" ? "primary" : "outline"}
            onClick={() => setMode("global")}
          >
            Global Stats
          </Button>
          <Button size="sm" onClick={fetchData} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
      ) : (
        <>
          {mode === "global" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <span className="text-lg block">Total Jobs</span>
                <span className="text-3xl font-bold">{allJobs}</span>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <span className="text-lg block">Total Applications</span>
                <span className="text-3xl font-bold">{allApps}</span>
              </div>
            </div>
          )}

          <div className="h-[300px] rounded-lg shadow p-4 bg-white">
            <ResponsiveLine
              data={jobTrend}
              margin={{ top: 20, right: 50, bottom: 50, left: 50 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              axisBottom={{ rotate: -45, legend: "Month", legendOffset: 36 }}
              axisLeft={{ legend: "Jobs", legendOffset: -40 }}
              colors={{ scheme: "category10" }}
            />
          </div>

          <div className="h-[300px] rounded-lg shadow p-4 bg-white">
            <ResponsivePie
              data={appStatusPie}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              tooltip={({ datum }) =>
                datum.value + " applications are " + datum.id
              }
              colors={{ scheme: "pastel1" }}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateY: 56,
                  itemWidth: 100,
                  itemHeight: 18,
                  symbolSize: 12,
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
