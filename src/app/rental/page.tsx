import { getGalleryImagesLightweight } from '@/lib/api/gallery';
import { getAllCameras } from '@/lib/api/bookings';
import RentalHomeClient from '@/components/RentalHomeClient';

// Force dynamic rendering - don't pre-render at build time
// This avoids the ISR oversized page error
export const dynamic = 'force-dynamic';

// Helper to get static images based on camera name
// TODO: In the future, store image URLs directly in the database
function getStaticImages(cameraName: string) {
  const name = cameraName.toLowerCase();

  if (name.includes('insta360') && name.includes('x5')) {
    return { main: '/images/Insta360-X5.webp', variant: '/images/Insta360-X5-1.webp' };
  } else if (name.includes('canon') && name.includes('r50')) {
    return { main: '/images/R50.png', variant: '/images/R50-1.png' };
  } else if (name.includes('osmo') && name.includes('pocket')) {
    return { main: '/images/osmo-pocket-31.jpg', variant: '/images/osmo_pocket_3_creator_combo.jpg' };
  } else if (name.includes('action') && name.includes('5')) {
    return { main: '/images/dji-action-5-pro1.jpg', variant: '/images/osmo_action_5_pro_adventure_combo.jpg' };
  } else if (name.includes('action')) {
    return { main: '/images/dji-action-5-pro1.jpg', variant: '/images/osmo_action_5_pro_adventure_combo.jpg' };
  } else if (name.includes('osmo')) {
    return { main: '/images/osmo-pocket-31.jpg', variant: '/images/osmo_pocket_3_creator_combo.jpg' };
  }
  return { main: '/images/osmo-pocket-31.jpg', variant: '/images/osmo_pocket_3_creator_combo.jpg' };
}

export default async function RentalHome() {
  // Fetch data on the server
  const [galleryImages, dbCameras] = await Promise.all([
    getGalleryImagesLightweight(), // Use lightweight version
    getAllCameras()
  ]);

  // Process cameras: filter available, sort, and transform
  const availableCameras = dbCameras.filter(cam => cam.is_available);
  const sortedCameras = [...availableCameras].sort((a, b) => {
    const orderA = a.display_order ?? 999;
    const orderB = b.display_order ?? 999;
    return orderA - orderB;
  });

  const cameras = sortedCameras.map(dbCamera => {
    const cameraImages = getStaticImages(dbCamera.name);
    return {
      id: dbCamera.id,
      name: dbCamera.name,
      description: dbCamera.description || 'Professional camera equipment.',
      image: cameraImages.main,
      images: [cameraImages.variant],
      dailyRate: dbCamera.daily_rate,
      discountRate: dbCamera.weekly_rate ? Math.round(dbCamera.weekly_rate / 7) : dbCamera.daily_rate * 0.9,
      features: [] as string[],
      specifications: typeof dbCamera.specifications === 'object' ? dbCamera.specifications as Record<string, unknown> : {},
    };
  });

  // Pass pre-fetched data to Client Component
  return <RentalHomeClient cameras={cameras} galleryImages={galleryImages} />;
}
