const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}


export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  // Only set Content-Type to JSON if it's not already set and we aren't sending FormData
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    let data;
    try {
      data = (await res.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      // ignore
    }
    
    throw new ApiError(message, res.status, data);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export type AuthUser = {
  user: any;
  id: string;
  email: string;
  name: string;
  role: string;
};

export type Truck = {
  _id: string;
  truckNumber: string;
  licensePlate: string;
  make?: string;
  model?: string;
  year?: number;
  status?: string;
  assignedDriver?: {
    _id: string;
    name: string;
    email: string;
  };
  currentLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    lastUpdated?: string;
  };
};

export type Manifest = {
  _id: string;
  manifestNumber: string;
  truck: Truck | string;
  driver: {
    _id: string;
    name: string;
    email: string;
  } | string;
  origin: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };
  status: string;
  departureTime?: string;
  arrivalTime?: string;
  lastReportedLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  };
  cargoDescription?: string;
  notes?: string;
};

export async function login(email: string, password: string) {
  return apiFetch<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  return apiFetch<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logout() {
  await apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export async function getProfile() {
  return apiFetch<AuthUser | null>("/auth/profile");
}

export async function getTrucks() {
  return apiFetch<Truck[]>("/trucks");
}

export async function getManifests() {
  return apiFetch<Manifest[]>("/manifests");
}

export async function getTruck(id: string) {
  return apiFetch<Truck>(`/trucks/${id}`);
}

export async function createTruck(body: {
  truckNumber: string;
  licensePlate: string;
  make?: string;
  model?: string;
  year?: number;
  assignedDriver?: string;
  status?: string;
}) {
  return apiFetch<Truck>("/trucks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateTruck(
  id: string,
  body: Partial<{
    truckNumber: string;
    licensePlate: string;
    make: string;
    model: string;
    year: number;
    assignedDriver: string;
    status: string;
  }>,
) {
  return apiFetch<Truck>(`/trucks/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function updateTruckLocation(
  id: string,
  body: { latitude: number; longitude: number; address?: string },
) {
  return apiFetch<Truck>(`/trucks/${id}/location`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteTruck(id: string) {
  await apiFetch<void>(`/trucks/${id}`, {
    method: "DELETE",
  });
}

export async function getManifest(id: string) {
  return apiFetch<Manifest>(`/manifests/${id}`);
}

export async function createManifest(body: {
  manifestNumber: string;
  truck: string;
  driver: string;
  origin: { address: string; latitude: number; longitude: number };
  destination: { address: string; latitude: number; longitude: number };
  cargoDescription?: string;
  notes?: string;
}) {
  return apiFetch<Manifest>("/manifests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateManifest(
  id: string,
  body: Partial<{
    manifestNumber: string;
    truck: string;
    driver: string;
    origin: { address: string; latitude: number; longitude: number };
    destination: { address: string; latitude: number; longitude: number };
    status: string;
    cargoDescription: string;
    notes: string;
  }>,
) {
  return apiFetch<Manifest>(`/manifests/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function updateManifestLocation(
  id: string,
  body: { latitude: number; longitude: number; address?: string },
) {
  return apiFetch<Manifest>(`/manifests/${id}/location`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function recordDeparture(id: string) {
  return apiFetch<Manifest>(`/manifests/${id}/departure`, {
    method: "PUT",
  });
}

export async function recordArrival(id: string) {
  return apiFetch<Manifest>(`/manifests/${id}/arrival`, {
    method: "PUT",
  });
}

export async function deleteManifest(id: string) {
  await apiFetch<void>(`/manifests/${id}`, {
    method: "DELETE",
  });
}
