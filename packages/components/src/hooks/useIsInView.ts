// packages/components/src/hooks/useIsInView.ts
"use client"

import { useEffect, useRef, useState } from "react";

export const useIsInView = (threshold = 0.2) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry) {
                    setIsInView(entry.isIntersecting)
                }
            },
            { threshold }
        );

        observer.observe(ref.current);

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [threshold]);

    return { ref, isInView };
};