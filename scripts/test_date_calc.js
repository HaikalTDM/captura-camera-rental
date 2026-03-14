
const calculateDays = (startStr, endStr) => {
    console.log(`--- Testing ${startStr} to ${endStr} ---`);

    // Method 1: new Date(string)
    const start1 = new Date(startStr);
    const end1 = new Date(endStr);
    const diffTime1 = end1.getTime() - start1.getTime();
    const days1 = Math.ceil(diffTime1 / (1000 * 60 * 60 * 24)) + 1;
    console.log(`Method 1 (new Date(str)): ${days1} days`);
    console.log(`  Start: ${start1.toISOString()}`);
    console.log(`  End:   ${end1.toISOString()}`);

    // Method 2: Manual Parse
    const [y1, m1, d1] = startStr.split('-').map(Number);
    const [y2, m2, d2] = endStr.split('-').map(Number);
    const start2 = new Date(y1, m1 - 1, d1);
    const end2 = new Date(y2, m2 - 1, d2);
    const diffTime2 = end2.getTime() - start2.getTime();
    const days2 = Math.ceil(diffTime2 / (1000 * 60 * 60 * 24)) + 1;
    console.log(`Method 2 (Manual Parse): ${days2} days`);
    console.log(`  Start: ${start2.toString()}`);
    console.log(`  End:   ${end2.toString()}`);
};

calculateDays('2025-11-26', '2025-11-27');
calculateDays('2025-11-26T10:00:00', '2025-11-27T10:00:00'); // With time
calculateDays('2025-11-26T09:00:00', '2025-11-27T10:00:00'); // With different time
