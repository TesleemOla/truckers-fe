import type { Truck } from "@/lib/api";
import { Truck as TruckTag } from "lucide-react";
import StatusPill from "./StatusPill";
import CustomButton from "@/app/components/Button";
import Link from "next/link";

function TrucksCard({ trucks }: { trucks: Truck[] }) {
  return (
    <section className="glass-card col-span-12 px-5 py-4 sm:px-6 sm:py-5 lg:col-span-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            <TruckTag className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Active trucks
            </h2>
            <p className="text-[11px] text-slate-600">
              Live view of your fleet
            </p>
          </div>
          <CustomButton title="View Trucks" className="ml-3 px-2 py-1 text-xs">
            <Link href="/trucks">View All</Link>
          </CustomButton>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-slate-900">
            {trucks.length}
          </p>
          <p className="text-[11px] text-slate-600">Total units</p>
        </div>
      </div>

      <div className="mt-2 space-y-2.5">
        {trucks.slice(0, 4).map((truck) => (
          <div
            key={truck._id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs"
          >
            <div>
              <p className="font-medium text-slate-900">
                {truck.truckNumber ?? "Truck"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Plate {truck.licensePlate ?? "N/A"}
              </p>
            </div>
            <div className="text-right">
              <StatusPill status={truck.status} />
              {truck.currentLocation?.address && (
                <p className="mt-1 text-[11px] text-slate-400">
                  {truck.currentLocation.address}
                </p>
              )}
            </div>
          </div>
        ))}

        {trucks.length === 0 && (
          <p className="py-4 text-center text-[11px] text-slate-500">
            No trucks yet. Create trucks via the API to see them here.
          </p>
        )}
      </div>
    </section>
  );
}

export default TrucksCard;