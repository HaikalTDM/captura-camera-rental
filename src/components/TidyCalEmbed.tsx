'use client';

import { useEffect } from 'react';

interface TidyCalEmbedProps {
  dataPath: string; // e.g., "your-username/camera-pickup"
  cameraId: string; // Unique ID for this camera's calendar
  cameraName: string; // Display name for the camera
  className?: string;
}

export default function TidyCalEmbed({ dataPath, cameraId, cameraName, className = "" }: TidyCalEmbedProps) {
  useEffect(() => {
    // Load TidyCal script if not already loaded
    if (!document.querySelector('script[src*="tidycal"]')) {
      const script = document.createElement('script');
      script.src = 'https://asset-tidycal.b-cdn.net/js/embed.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className={`tidycal-container ${className}`}>
      <div
        className="tidycal-embed"
        data-path={dataPath}
        style={{ minHeight: '400px' }}
      ></div>
    </div>
  );
}

/* 
USAGE EXAMPLE:

1. Import the component:
import TidyCalEmbed from '@/components/TidyCalEmbed';

2. Use in your component:
<TidyCalEmbed 
  dataPath="your-username/camera-pickup" 
  className="min-h-[600px]"
/>

3. Replace "your-username/camera-pickup" with your actual TidyCal path

TIDYCAL SETUP STEPS:

1. Create a TidyCal account at https://tidycal.com
2. Create a new Booking Type (e.g., "Camera Pickup")
3. Configure your availability and settings
4. Get the embed code from Dashboard → Booking Type → "Embed on your website"
5. Extract the data-path value from the embed code
6. Use that value in the TidyCalEmbed component

EXAMPLE BOOKING TYPES FOR CAMERA RENTAL:

- camera-pickup: For scheduling equipment pickup
- camera-return: For scheduling equipment returns  
- equipment-demo: For product demonstrations
- consultation: For rental consultations

FULL EMBED CODE EXAMPLE:
<script src="https://asset-tidycal.b-cdn.net//js/embed.js"></script>
<div id="tidycal-embed" data-path="your-username/camera-pickup"></div>

The data-path value "your-username/camera-pickup" is what you pass to this component.
*/
