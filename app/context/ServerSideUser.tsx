import { AuthUser, Manifest, Truck } from "@/lib/api";
import { serverApiFetch } from "@/lib/server-api";

export default async function ServerAuth() {
  try {
    // Fetch everything in parallel to avoid waterfalls
    const [userResponse, allTrucks, allManifests] = await Promise.all([
      serverApiFetch<any>("/auth/profile").catch(() => null),
      serverApiFetch<Truck[]>("/trucks").catch(() => []),
      serverApiFetch<Manifest[]>("/manifests").catch(() => [])
    ]);

    const user = userResponse;
    const trucks = Array.isArray(allTrucks) ? allTrucks : [];
    const manifests = Array.isArray(allManifests) ? allManifests : [];

    // Extract inner user info if it's wrapped
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

