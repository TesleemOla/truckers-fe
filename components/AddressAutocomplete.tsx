"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddressAutocompleteProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSelect: (data: { address: string; lat: string; lon: string }) => void;
    required?: boolean;
}

interface Suggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

export default function AddressAutocomplete({
    label,
    value,
    onChange,
    onSelect,
    required = false,
}: AddressAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (value && value.length > 2 && showSuggestions) {
                fetchSuggestions(value);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [value, showSuggestions]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (query: string) => {
        setLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );
            if (!res.ok) throw new Error("Failed to fetch suggestions");
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error(err);
            // Silent error for autocomplete usually better, or small indicator
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (suggestion: Suggestion) => {
        onChange(suggestion.display_name);
        onSelect({
            address: suggestion.display_name,
            lat: suggestion.lat,
            lon: suggestion.lon,
        });
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div className="relative space-y-1.5" ref={wrapperRef}>
            <label className="text-xs font-medium text-slate-700">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    required={required}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Search for an address..."
                    autoComplete="off"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                </div>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <ul className="max-h-60 overflow-auto py-1">
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion.place_id}
                                onClick={() => handleSelect(suggestion)}
                                className="flex cursor-pointer items-start gap-2 px-4 py-2.5 hover:bg-slate-50"
                            >
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span className="text-xs text-slate-700">{suggestion.display_name}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-slate-100 px-2 py-1 text-right">
                        <span className="text-[10px] text-slate-400">Powered by OpenStreetMap</span>
                    </div>
                </div>
            )}
        </div>
    );
}
