/**
 * Test script for the local booking parser
 * Run with: npx tsx src/lib/__tests__/bookingParser.test.ts
 */

import { parseBookingText } from '../bookingParser';

// Mock cameras (similar to what's in the database)
const mockCameras = [
    { id: '1', name: 'DJI Osmo Pocket 3', brand: 'DJI', model: 'Osmo Pocket 3' },
    { id: '2', name: 'DJI Osmo Pocket 3 (ii)', brand: 'DJI', model: 'Osmo Pocket 3' },
    { id: '3', name: 'DJI Action 5 Pro', brand: 'DJI', model: 'Action 5 Pro' },
    { id: '4', name: 'GoPro Hero 13', brand: 'GoPro', model: 'Hero 13' },
    { id: '5', name: 'Canon R50 - Mother', brand: 'Canon', model: 'R50' },
];

// Helper to get a date string for testing (today + offset)
function getDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
}

// Test cases
const testCases = [
    {
        name: 'Complete booking message',
        input: `Hi, saya Ahmad bin Abdullah (012-345-6789, ahmad@gmail.com). 
Nak sewa DJI Osmo Pocket 3 dari 25-28 Dec 2025.
Delivery to: No. 123, Jalan Merdeka, Kuala Lumpur.`,
        checks: {
            customer_name: (v: string | null) => v?.includes('Ahmad'),
            customer_phone: (v: string | null) => v === '+60123456789',
            customer_email: (v: string | null) => v === 'ahmad@gmail.com',
            camera_name: (v: string | null) => v === 'DJI Osmo Pocket 3',
            start_date: (v: string | null) => v === '2025-12-25',
            end_date: (v: string | null) => v === '2025-12-28',
            pickup_method: (v: string | null) => v === 'delivery'
        }
    },
    {
        name: 'Simple WhatsApp format',
        input: `Name: Sarah Lee
Phone: 0123456789
Email: sarah@email.com
Camera: GoPro Hero 13
Dates: 14/12 to 16/12`,
        checks: {
            customer_name: (v: string | null) => v === 'Sarah Lee',
            customer_phone: (v: string | null) => v === '+60123456789',
            customer_email: (v: string | null) => v === 'sarah@email.com',
            camera_name: (v: string | null) => v === 'GoPro Hero 13',
            start_date: (v: string | null) => v !== null && v.endsWith('-12-14'),
            end_date: (v: string | null) => v !== null && v.endsWith('-12-16'),
        }
    },
    {
        name: 'Mother booking detection',
        input: 'Hi, nak book canon r50 untuk mother dari 20-22 Dec 2025',
        checks: {
            is_mother_booking: (v: boolean) => v === true,
            camera_name: (v: string | null) => v === 'Canon R50 - Mother',
            start_date: (v: string | null) => v === '2025-12-20',
            end_date: (v: string | null) => v === '2025-12-22',
        }
    },
    {
        name: 'Single date booking (DD/MM format)',
        input: 'Saya John 0198765432 nak sewa pocket 3 pada 25/12',
        checks: {
            customer_phone: (v: string | null) => v === '+60198765432',
            camera_name: (v: string | null) => v?.includes('Pocket 3'),
            start_date: (v: string | null) => v !== null && v.endsWith('-12-25'),
            end_date: (v: string | null) => v !== null && v.endsWith('-12-25'), // Same date for single-day
        }
    },
    {
        name: 'Date with month name and year',
        input: 'Booking for Action 5 Pro on Jan 15 2025 to Jan 20 2025',
        checks: {
            camera_name: (v: string | null) => v === 'DJI Action 5 Pro',
            start_date: (v: string | null) => v === '2025-01-15',
            end_date: (v: string | null) => v === '2025-01-20',
        }
    },
    {
        name: 'Phone with +60 format',
        input: 'Contact: +60123456789, email test@test.com',
        checks: {
            customer_phone: (v: string | null) => v === '+60123456789',
            customer_email: (v: string | null) => v === 'test@test.com',
        }
    },
    {
        name: 'Address detection',
        input: `Hi nak sewa gopro
Delivery to: No. 45, Jalan Bukit Bintang, 55100 Kuala Lumpur`,
        checks: {
            pickup_method: (v: string | null) => v === 'delivery',
            pickup_address: (v: string | null) => v !== null && v.includes('Bukit Bintang'),
        }
    },
];

// Run tests
console.log('🧪 Testing Local Booking Parser\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log('-'.repeat(40));
    console.log('Input:', testCase.input.substring(0, 80) + (testCase.input.length > 80 ? '...' : ''));

    const result = parseBookingText(testCase.input, mockCameras);

    console.log('\n📊 Results:');
    console.log('  Name:', result.customer_name, `(${result.confidence.customer_name})`);
    console.log('  Phone:', result.customer_phone, `(${result.confidence.customer_phone})`);
    console.log('  Email:', result.customer_email, `(${result.confidence.customer_email})`);
    console.log('  Camera:', result.camera_name, `(${result.confidence.camera_name})`);
    console.log('  Dates:', result.start_date, 'to', result.end_date, `(${result.confidence.dates})`);
    console.log('  Pickup:', result.pickup_method);
    console.log('  Address:', result.pickup_address);
    console.log('  Mother booking:', result.is_mother_booking);

    // Check expectations using function checks
    let testPassed = true;
    for (const [key, checkFn] of Object.entries(testCase.checks)) {
        const actualValue = (result as any)[key];
        const checkPassed = (checkFn as Function)(actualValue);
        if (!checkPassed) {
            console.log(`  ❌ ${key}: Check failed for value "${actualValue}"`);
            testPassed = false;
        }
    }

    if (testPassed) {
        console.log('  ✅ All checks passed!');
        passed++;
    } else {
        failed++;
    }
}

console.log('\n' + '='.repeat(60));
console.log(`\n📈 Summary: ${passed} passed, ${failed} failed out of ${testCases.length} tests\n`);

if (failed > 0) {
    process.exit(1);
} else {
    console.log('🎉 All tests passed! Parser is working correctly.\n');
}
