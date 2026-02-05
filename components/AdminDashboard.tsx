import { Activity } from 'lucide-react'
import React from 'react'
import TrucksCard from './TrucksCard'
import ManifestsCard from './ManifestCard'
import { serverApiFetch } from '@/lib/server-api'
import { AuthUser, Manifest, Truck } from '@/lib/api'


export async function AdminDashboard() {

  async function loadData() {

    const [user, allTrucks, allManifests] = await Promise.all([
      serverApiFetch<AuthUser>("/auth/profile"),
      serverApiFetch<Truck[]>("/trucks"),
      serverApiFetch<Manifest[]>("/manifests"),
    ]);

    if (user?.user?.role === "driver") {
      const driverId = user.user._id;
      const trucks = allTrucks.filter(
        (truck) => truck.assignedDriver?._id === driverId,
      );
      const manifests = allManifests.filter((manifest) => {
        if (typeof manifest.driver === "string") {
          return manifest.driver === driverId;
        }
        return (manifest.driver as any)?._id === driverId;
      });

      return { user, trucks, manifests };
    }

    return { user, trucks: allTrucks, manifests: allManifests };
  }

  const { user, trucks, manifests } = await loadData()

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

      <TrucksCard trucks={trucks || []} />
      <ManifestsCard manifests={manifests || []} />
    </div>
  )
}

