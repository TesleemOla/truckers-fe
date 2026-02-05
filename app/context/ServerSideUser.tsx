import { AuthUser, Manifest, Truck } from "@/lib/api";
import { serverApiFetch } from "@/lib/server-api";

export default async function ServerAuth() {
  // Middleware ensures user is authenticated, so we can safely fetch data
  const [user] = await Promise.all([
    serverApiFetch<AuthUser>("/auth/profile"),
  ]);

  const [trucks, manifests] = await Promise.all([
    serverApiFetch<Truck[]>("/trucks"),
    serverApiFetch<Manifest[]>("/manifests")
  ]);

  if (user?.user?.role === "driver") {
    const driverId = user.user._id;
    const assignedTrucks = trucks.filter((t) => t.assignedDriver?._id === driverId);
    const assignedManifests = manifests.filter((m) =>
      (typeof m.driver === "string" ? m.driver === driverId : m.driver._id === driverId)
    );
    return { user, trucks: assignedTrucks, manifests: assignedManifests };
  }

  return { user, trucks, manifests };
}
