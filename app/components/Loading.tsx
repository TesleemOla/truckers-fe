import React from "react";

export default function Loading() {
    return (
        <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4">
            <div className="relative">
                <svg
                    width="120"
                    height="80"
                    viewBox="0 0 120 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary-600"
                >
                    {/* Truck Body Group with Suspension Animation */}
                    <g className="animate-truck-suspension">
                        {/* Cab */}
                        <path
                            d="M75 25H95L105 40V60H75V25Z"
                            className="fill-primary-600"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="M75 25V60H25L20 25H75Z"
                            className="fill-primary-500"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        {/* Trailer/Cargo Area */}
                        <rect
                            x="5"
                            y="15"
                            width="70"
                            height="45"
                            rx="2"
                            className="fill-primary-100/90"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        {/* Stripe on Trailer */}
                        <rect
                            x="5"
                            y="30"
                            width="70"
                            height="8"
                            className="fill-primary-200/50"
                        />

                        {/* Window */}
                        <path d="M93 28H80V38H101L93 28Z" className="fill-blue-100" />

                        {/* Headlight */}
                        <circle cx="105" cy="52" r="2" className="fill-yellow-300" />
                    </g>

                    {/* Wheels */}
                    <g className=" text-slate-800">
                        {/* Back Wheel 1 */}
                        <circle cx="25" cy="65" r="8" className="fill-current" />
                        <circle cx="25" cy="65" r="3" className="fill-slate-400" />
                    </g>

                    <g className="animate-wheel-spin text-slate-800" style={{ transformOrigin: "90px 65px" }}>
                        {/* Front Wheel */}
                        <circle cx="90" cy="65" r="8" className="fill-current" />
                        <circle cx="90" cy="65" r="3" className="fill-slate-400" />
                    </g>
                </svg>

                {/* Road Links */}
                <div className="absolute -bottom-1 left-1/2 h-0.5 w-32 -translate-x-1/2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-full bg-slate-300/50 opacity-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.2)_50%,transparent_100%)] animate-[shimmer_1s_infinite]" />
                </div>
            </div>

            <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-slate-500">Loading Data</span>
                <span className="animate-bounce text-sm text-primary-500">.</span>
                <span className="animate-bounce text-sm text-primary-500 delay-100">.</span>
                <span className="animate-bounce text-sm text-primary-500 delay-200">.</span>
            </div>
        </div>
    );
}
