import { useEffect, useState } from "react";

// Module-level cache: only one fetch per page load regardless of how many components call useCity
let _cache: string | null = null;
let _promise: Promise<string> | null = null;

async function fetchCityFromIP(): Promise<string> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) return "";
        const data = (await res.json()) as { city?: string };
        return data.city?.trim() ?? "";
    } catch {
        return "";
    }
}

function getCityAsync(): Promise<string> {
    if (_cache !== null) return Promise.resolve(_cache);
    if (!_promise) {
        _promise = fetchCityFromIP().then((c) => {
            _cache = c;
            return c;
        });
    }
    return _promise;
}

export function useCity(): string {
    const [city, setCity] = useState<string>(_cache ?? "");

    useEffect(() => {
        if (_cache !== null) {
            setCity(_cache);
            return;
        }
        getCityAsync().then(setCity);
    }, []);

    return city;
}
