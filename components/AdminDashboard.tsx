"use client"

import { Activity, Loader2 } from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'
import TrucksCard from './TrucksCard'
import ManifestsCard from './ManifestCard'
import { apiFetch } from '@/lib/api'
import { AuthUser, Manifest, Truck } from '@/lib/api'

export function AdminDashboard() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [manifests, setManifests] = useState<Manifest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [user, allTrucks, allManifests] = await Promise.all([
        apiFetch<AuthUser>("/auth/profile"),
        apiFetch<Truck[]>("/trucks"),
        apiFetch<Manifest[]>("/manifests"),
      ]);

      if (user?.user?.role === "driver") {
        const driverId = user.user._id;
        const filteredTrucks = (allTrucks || []).filter(
          (truck) => truck.assignedDriver?._id === driverId,
        );
        const filteredManifests = (allManifests || []).filter((manifest) => {
          if (typeof manifest.driver === "string") {
            return manifest.driver === driverId;
          }
          return (manifest.driver as any)?._id === driverId;
        });

        setTrucks(filteredTrucks);
        setManifests(filteredManifests);
      } else {
        setTrucks(allTrucks || []);
        setManifests(allManifests || []);
      }
      setError(null)
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError(err?.message || "Something went wrong while fetching data");
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="col-span-12 flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-slate-500 font-medium">Loading dashboard statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="col-span-12 flex h-64 flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-900">Failed to load logistics data</p>
        <p className="mt-1 text-xs text-red-600">{error}</p>
        <button
          onClick={() => loadData()}
          className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-red-700 active:scale-95"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-5">
      <section className="glass-card col-span-12 flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/80 text-primary-300 shadow-soft ring-1 ring-slate-800">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-900">
              Operations snapshot
            </p>
            <p className="mt-0.5 text-[11px] text-slate-900">
              {trucks.length} trucks · {manifests.length} manifests in
              view
            </p>
          </div>
        </div>
      </section>

      <TrucksCard trucks={trucks} />
      <ManifestsCard manifests={manifests} />
    </div>
  )
}

