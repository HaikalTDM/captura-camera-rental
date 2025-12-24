'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is mobile-sized
 * @param breakpoint - Width threshold in pixels (default: 768)
 * @returns boolean - true if viewport is below breakpoint
 */
export function useIsMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check initial state
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Set initial value
        checkMobile();

        // Listen for resize events
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
}

export default useIsMobile;
