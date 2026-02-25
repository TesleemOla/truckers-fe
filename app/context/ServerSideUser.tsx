import { AuthUser, Manifest, Truck } from "@/lib/api";
import { serverApiFetch } from "@/lib/server-api";

export default async function ServerAuth() {
  try {
    // 1. Fetch user profile first. This is the source of truth for auth.
    const user = await serverApiFetch<any>("/auth/profile").catch(() => null);

    // 2. If no user, return immediately. No need to fetch trucks/manifests.
    if (!user || !user.user) {
      return { user: null, trucks: [], manifests: [] };
    }

    // 3. Now fetch data relevant to the authenticated user in parallel
    const [allTrucks, allManifests] = await Promise.all([
      serverApiFetch<Truck[]>("/trucks").catch(() => []),
      serverApiFetch<Manifest[]>("/manifests").catch(() => [])
    ]);

    const trucks = Array.isArray(allTrucks) ? allTrucks : [];
    const manifests = Array.isArray(allManifests) ? allManifests : [];

    // Extract roles and filter accordingly
    const role = user?.user?.role || user?.role;
    const userId = user?.user?._id || user?._id;

    if (role === "driver") {
      const assignedTrucks = trucks.filter((t) => t.assignedDriver?._id === userId);
      const assignedManifests = manifests.filter((m) => {
        if (!m.driver) return false;
        return (typeof m.driver === "string" ? m.driver === userId : m.driver._id === userId);
      });
      return { user, trucks: assignedTrucks, manifests: assignedManifests };
    }

    return { user, trucks, manifests };
  } catch (error) {
    console.error("ServerAuth error:", error);
    return { user: null, trucks: [], manifests: [] };
  }
}

