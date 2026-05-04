// import { getGalleryImagesLightweight } from '@/lib/api/gallery';
import { getPublicCameras } from '@/lib/api/bookings';
import RentalHomeClient from '@/components/RentalHomeClient';
import { getExtendedDailyRate } from '@/lib/cameraPricing';

// Enable ISR caching - revalidate every 60 seconds
export const revalidate = 60;

// Helper to get static images based on camera name
// TODO: In the future, store image URLs directly in the database
function getStaticImages(cameraName: string) {
  const name = cameraName.toLowerCase();

  if (name.includes('insta360') && name.includes('x5')) {
    return { main: '/images/Insta360-X5.webp', variant: '/images/Insta360-X5-1.webp' };
  } else if ((name.includes('canon') && name.includes('r50')) || name.includes('r50 (ii)')) {
    return { main: '/images/R50.png', variant: '/images/R50-1.png' };
  } else if (name.includes('osmo') && name.includes('pocket')) {
    return { main: '/images/osmo-pocket-31.jpg', variant: '/images/osmo_pocket_3_creator_combo.jpg' };
  } else if (name.includes('action') && name.includes('5')) {
    return { main: '/images/dji-action-5-pro1.jpg', variant: '/images/osmo_action_5_pro_adventure_combo.jpg' };
  } else if (name.includes('action')) {
    return { main: '/images/dji-action-5-pro1.jpg', variant: '/images/osmo_action_5_pro_adventure_combo.jpg' };
  } else if (name.includes('osmo')) {
    return { main: '/images/osmo-pocket-31.jpg', variant: '/images/osmo_pocket_3_creator_combo.jpg' };
  } else if (name.includes('fujifilm') || name.includes('fuji')) {
    return { main: '/images/fujifilm_xt30.png', variant: '/images/fujifilm_xt30.png' };
  }
  return { main: '/images/osmo-pocket-31.jpg', variant: '/images/osmo_pocket_3_creator_combo.jpg' };
}

export default async function RentalHome() {
  // Fetch data on the server - ONLY cameras, not gallery images (too large for ISR)
  const dbCameras = await getPublicCameras();

  // Process cameras: filter available, sort, and transform
  const availableCameras = dbCameras.filter(cam => cam.is_available);
  const sortedCameras = [...availableCameras].sort((a, b) => {
    const orderA = a.display_order ?? 999;
    const orderB = b.display_order ?? 999;
    return orderA - orderB;
  });

  const cameras = sortedCameras.map(dbCamera => {
    const cameraImages = getStaticImages(dbCamera.name);
    const primaryImage = dbCamera.image_url || cameraImages.main;
    const imageFallbacks = [primaryImage, cameraImages.main, cameraImages.variant].filter(
      (image, index, images) => Boolean(image) && images.indexOf(image) === index
    );

    // Generate features based on camera type
    const features = [
      `${dbCamera.type.charAt(0).toUpperCase() + dbCamera.type.slice(1)} Camera`,
      `RM${dbCamera.daily_rate}/day rental`,
      'Professional grade equipment',
      'Includes basic accessories',
      'Full insurance coverage',
      'Technical support included'
    ];

    return {
      id: dbCamera.id,
      name: dbCamera.name,
      description: dbCamera.description || 'Professional camera equipment.',
      image: primaryImage,
      images: imageFallbacks,
      dailyRate: dbCamera.daily_rate,
      discountRate: getExtendedDailyRate(dbCamera),
      features,
      specifications: typeof dbCamera.specifications === 'object' ? dbCamera.specifications as Record<string, unknown> : {},
    };
  });

  // Pass pre-fetched data to Client Component
  // Pass empty array for galleryImages to trigger client-side fetch
  return <RentalHomeClient cameras={cameras} galleryImages={[]} />;
}
