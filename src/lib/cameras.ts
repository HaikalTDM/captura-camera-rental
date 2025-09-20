import { Camera } from '@/types';

export const cameras: Camera[] = [
  {
    id: 'osmo-pocket-3',
    name: 'Osmo Pocket 3',
    description: 'Ultra-compact handheld camera with 4K recording and advanced stabilization. Perfect for content creators and travel photography.',
    image: '/images/osmo-pocket-31.jpg',
    images: [
      '/images/osmo-pocket-31.jpg'
    ],
    dailyRate: 50,
    discountRate: 45,
    features: [
      '4K/120fps recording',
      '3-axis mechanical gimbal',
      '1-inch CMOS sensor',
      'ActiveTrack 6.0',
      'Compact and portable',
      '2-hour battery life'
    ],
    specifications: {
      'Sensor': '1-inch CMOS',
      'Video Resolution': '4K/120fps, 1080p/240fps',
      'Photo Resolution': '9.4MP',
      'Stabilization': '3-axis mechanical gimbal',
      'Battery Life': '2 hours',
      'Weight': '116g'
    },
    tidyCalPath: 'haikaltdm46/osmo-pocket-3'
  },
  {
    id: 'action-5-pro',
    name: 'Action 5 Pro',
    description: 'Rugged action camera built for extreme adventures. Waterproof design with superior image quality and stabilization.',
    image: '/images/dji-action-5-pro1.jpg',
    images: [
      '/images/dji-action-5-pro1.jpg'
    ],
    dailyRate: 50,
    discountRate: 45,
    features: [
      '4K/120fps recording',
      'Waterproof to 10m',
      'Superior low-light performance',
      'HorizonSteady stabilization',
      'Dual touchscreens',
      '4-hour battery life'
    ],
    specifications: {
      'Sensor': '1/1.3-inch CMOS',
      'Video Resolution': '4K/120fps, 1080p/240fps',
      'Photo Resolution': '40MP',
      'Waterproof': '10m without housing',
      'Battery Life': '4 hours',
      'Weight': '145g'
    },
    tidyCalPath: 'haikaltdm46/action-5-pro' // Update with your actual TidyCal path
  }
];
