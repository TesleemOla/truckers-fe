import React from "react";
import LoadingTruck from "./LoadingTruck";

export default function Loading() {
    return (
        <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4">
            <LoadingTruck />

            <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-primary-500 delay-100 animate-bounce">Please Wait</span>
                <span className="animate-bounce text-sm text-primary-500">.</span>
                <span className="animate-bounce text-sm text-primary-500 delay-100">.</span>
                <span className="animate-bounce text-sm text-primary-500 delay-200">.</span>
            </div>
        </div>
    );
}
