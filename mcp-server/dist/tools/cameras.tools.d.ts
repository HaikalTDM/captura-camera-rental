import type { Camera } from '../supabase/types.js';
export declare function listCameras(filter: 'available_only' | 'all', sortBy: string): Promise<Camera[]>;
export declare function getCamera(cameraId: string): Promise<Camera>;
export declare function checkAvailability(cameraId: string, startDate: string, endDate: string): Promise<{
    available: boolean;
    conflictingBookings: {
        id: string;
        start_date: string;
        end_date: string;
    }[];
}>;
export declare function createCamera(fields: Record<string, unknown>): Promise<Camera>;
export declare function updateCamera(cameraId: string, fields: Record<string, unknown>): Promise<Camera>;
export declare function setCameraAvailability(cameraId: string, isAvailable: boolean, notes?: string): Promise<Camera>;
//# sourceMappingURL=cameras.tools.d.ts.map