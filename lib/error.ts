export interface BackendError {
    message: string;
    error: string;
    status: number;
}


export function isBackendError(err: unknown): err is BackendError {
    return (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        "error" in err &&
        "status" in err &&
        typeof (err as any).message === "string" &&
        typeof (err as any).error === "string" &&
        typeof (err as any).status === "number"
    );
}
