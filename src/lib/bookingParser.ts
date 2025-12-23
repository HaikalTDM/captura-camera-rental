/**
 * Local Booking Text Parser
 * Parses customer messages to extract booking information using regex and pattern matching.
 * NO AI/LLM required - completely free and instant!
 * 
 * Handles Malaysian formats for:
 * - Phone numbers (012-345-6789, +60123456789, etc.)
 * - Dates (25/12, 25-28 Dec, Dec 25th, etc.)
 * - Email addresses
 * - Camera name matching
 * - Address extraction
 */

interface Camera {
    id: string;
    name: string;
    brand?: string;
    model?: string;
}

interface ParsedBookingData {
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    customer_whatsapp: string | null;
    camera_name: string | null;
    camera_id: string | null;
    start_date: string | null;
    end_date: string | null;
    pickup_method: 'pickup' | 'delivery' | null;
    pickup_address: string | null;
    notes: string | null;
    is_mother_booking: boolean;
    confidence: {
        customer_name: 'high' | 'medium' | 'low' | 'none';
        customer_phone: 'high' | 'medium' | 'low' | 'none';
        customer_email: 'high' | 'medium' | 'low' | 'none';
        camera_name: 'high' | 'medium' | 'low' | 'none';
        dates: 'high' | 'medium' | 'low' | 'none';
    };
}

/**
 * Main parser function - extracts booking data from customer message text
 */
export function parseBookingText(text: string, cameras: Camera[]): ParsedBookingData {
    const lowerText = text.toLowerCase();

    // Initialize result
    const result: ParsedBookingData = {
        customer_name: null,
        customer_phone: null,
        customer_email: null,
        customer_whatsapp: null,
        camera_name: null,
        camera_id: null,
        start_date: null,
        end_date: null,
        pickup_method: null,
        pickup_address: null,
        notes: null,
        is_mother_booking: false,
        confidence: {
            customer_name: 'none',
            customer_phone: 'none',
            customer_email: 'none',
            camera_name: 'none',
            dates: 'none'
        }
    };

    // Check for Mother booking
    result.is_mother_booking = lowerText.includes('mother') &&
        (lowerText.includes('r50') || lowerText.includes('canon'));

    // Extract phone number
    const phoneResult = extractPhone(text);
    if (phoneResult) {
        result.customer_phone = phoneResult.phone;
        result.customer_whatsapp = phoneResult.phone;
        result.confidence.customer_phone = phoneResult.confidence;
    }

    // Extract email
    const emailResult = extractEmail(text);
    if (emailResult) {
        result.customer_email = emailResult.email;
        result.confidence.customer_email = emailResult.confidence;
    }

    // Extract name
    const nameResult = extractName(text);
    if (nameResult) {
        result.customer_name = nameResult.name;
        result.confidence.customer_name = nameResult.confidence;
    }

    // Extract camera
    const cameraResult = extractCamera(text, cameras);
    if (cameraResult) {
        result.camera_name = cameraResult.name;
        result.camera_id = cameraResult.id;
        result.confidence.camera_name = cameraResult.confidence;
    }

    // Override for Mother booking
    if (result.is_mother_booking) {
        result.camera_name = 'Canon R50 - Mother';
        result.confidence.camera_name = 'high';
    }

    // Extract dates
    const dateResult = extractDates(text);
    if (dateResult) {
        result.start_date = dateResult.start_date;
        result.end_date = dateResult.end_date;
        result.confidence.dates = dateResult.confidence;
    }

    // Extract pickup method and address
    const pickupResult = extractPickupInfo(text);
    if (pickupResult) {
        result.pickup_method = pickupResult.method;
        result.pickup_address = pickupResult.address;
    }

    // Extract notes (anything that looks like special requests)
    result.notes = extractNotes(text);

    return result;
}

// ============================================
// PHONE NUMBER EXTRACTION
// ============================================

function extractPhone(text: string): { phone: string; confidence: 'high' | 'medium' | 'low' } | null {
    // Malaysian phone patterns
    const patterns = [
        // +60 format with optional spaces/dashes
        /\+60\s*1[0-9]\s*[- ]?\s*[0-9]{3,4}\s*[- ]?\s*[0-9]{4}/g,
        // 60 without plus
        /(?<![0-9])60\s*1[0-9]\s*[- ]?\s*[0-9]{3,4}\s*[- ]?\s*[0-9]{4}/g,
        // 01x format
        /(?<![0-9])01[0-9]\s*[- ]?\s*[0-9]{3,4}\s*[- ]?\s*[0-9]{4}/g,
        // Just digits: 01xxxxxxxx
        /(?<![0-9])01[0-9]{8,9}(?![0-9])/g,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[0]) {
            const phone = formatMalaysianPhone(match[0]);
            if (phone) {
                return { phone, confidence: 'high' };
            }
        }
    }

    // Try more lenient patterns
    const lenientPattern = /(?:phone|hp|tel|no\.?|number|whatsapp|wa)[:\s]*([0-9\s\-\+]+)/i;
    const lenientMatch = text.match(lenientPattern);
    if (lenientMatch && lenientMatch[1]) {
        const digits = lenientMatch[1].replace(/\D/g, '');
        if (digits.length >= 10) {
            const phone = formatMalaysianPhone(digits);
            if (phone) {
                return { phone, confidence: 'medium' };
            }
        }
    }

    return null;
}

function formatMalaysianPhone(raw: string): string | null {
    // Remove all non-digits
    let digits = raw.replace(/\D/g, '');

    // Handle different formats
    if (digits.startsWith('60')) {
        digits = digits; // Already has country code
    } else if (digits.startsWith('0')) {
        digits = '6' + digits; // Add country code
    } else if (digits.startsWith('1') && digits.length >= 9) {
        digits = '60' + digits; // Add country code
    }

    // Validate Malaysian mobile format (60 + 1X + 7-8 digits)
    if (digits.match(/^601[0-9][0-9]{7,8}$/)) {
        return '+' + digits;
    }

    return null;
}

// ============================================
// EMAIL EXTRACTION
// ============================================

function extractEmail(text: string): { email: string; confidence: 'high' | 'medium' } | null {
    // Standard email pattern
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const match = text.match(emailPattern);

    if (match && match[0]) {
        // Validate it's not a file extension or random pattern
        if (match[0].includes('.') && match[0].length > 5) {
            return { email: match[0].toLowerCase(), confidence: 'high' };
        }
    }

    return null;
}

// ============================================
// NAME EXTRACTION
// ============================================

function extractName(text: string): { name: string; confidence: 'high' | 'medium' | 'low' } | null {
    // Pattern 1: Explicit name label (Name: John Doe, Nama: Ahmad)
    const explicitPatterns = [
        /(?:name|nama)[:\s]+([A-Za-z][A-Za-z\s'.-]+?)(?:\s*[,\n]|\s+(?:phone|hp|email|tel|012|01|@|\d{3}))/i,
        /(?:name|nama)[:\s]+([A-Za-z][A-Za-z\s'.-]+)$/im,
        /(?:i am|i'm|saya|my name is)[:\s]*([A-Za-z][A-Za-z\s'.-]+?)(?:\s*[,\n.(]|\s+(?:phone|hp|email|tel|012|01|@|\d{3}))/i,
    ];

    for (const pattern of explicitPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const name = cleanName(match[1]);
            if (name && name.length >= 2) {
                return { name, confidence: 'high' };
            }
        }
    }

    // Pattern 2: "Hi, saya [Name]" format common in Malaysian WhatsApp
    const salutationPatterns = [
        /(?:hi|hello|hai|hey)[,\s]+(?:saya|i'm|im|i am)\s+([A-Za-z][A-Za-z\s'.-]+?)(?:\s*[,\n.(\[]|\s+(?:nak|want|from|phone|012|01|\())/i,
        /(?:hi|hello|hai|hey)[,\s]+saya\s+([A-Za-z][A-Za-z\s]+)\s+\(/i, // "Hi, saya Ahmad (phone)"
    ];

    for (const pattern of salutationPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const name = cleanName(match[1]);
            if (name && name.length >= 2 && name.split(' ').length <= 5) {
                return { name, confidence: 'medium' };
            }
        }
    }

    // Pattern 3: Name in parentheses at start "(Name, phone, email)" or "saya Name (phone)"
    const parenPatterns = [
        /\(([A-Za-z][A-Za-z\s]+?)[,\s]+(?:0\d{2}|\+60)/i, // "(Ahmad, 012-xxx)"
        /saya\s+([A-Za-z][A-Za-z\s]+?)\s*\((?:0\d{2}|\+60)/i, // "saya Ahmad (012-xxx)"
    ];

    for (const pattern of parenPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const name = cleanName(match[1]);
            if (name && name.length >= 2 && name.split(' ').length <= 5) {
                return { name, confidence: 'medium' };
            }
        }
    }

    // Pattern 4: Look for capitalized words that look like names in a line (less reliable)
    const lines = text.split('\n');
    for (const line of lines) {
        // Skip lines that look like camera names or dates
        if (line.match(/gopro|canon|sony|dji|osmo|action|pocket|hero|\d{1,2}[\/\-]\d{1,2}/i)) {
            continue;
        }

        // Look for proper name pattern (2-4 capitalized words)
        const namePattern = /^([A-Z][a-z]+(?:\s+(?:bin|binti|a\/l|a\/p|s\/o|d\/o|@)?\s*[A-Z][a-z]+){1,3})$/;
        const match = line.trim().match(namePattern);
        if (match && match[1]) {
            const name = cleanName(match[1]);
            if (name && name.length >= 4 && !name.match(/^(hi|hello|hey|dear)/i)) {
                return { name, confidence: 'low' };
            }
        }
    }

    // Pattern 5: Look for "Saya [Name]" anywhere (common in Malay messages)
    const sayaPattern = /saya\s+([A-Z][a-zA-Z]+(?:\s+[A-Za-z]+)*)/i;
    const sayaMatch = text.match(sayaPattern);
    if (sayaMatch && sayaMatch[1]) {
        // Filter out common words that follow "saya"
        const skipWords = ['nak', 'want', 'mahu', 'ingin', 'perlu', 'need', 'dari', 'from', 'john'];
        const potentialName = sayaMatch[1].split(/\s+/)[0];
        if (potentialName && !skipWords.includes(potentialName.toLowerCase()) && potentialName.length >= 2) {
            // Try to get more words if they look like name parts
            const words = sayaMatch[1].split(/\s+/);
            const nameWords = [];
            for (const word of words) {
                if (skipWords.includes(word.toLowerCase()) || word.match(/^\d/) || word.match(/^(nak|want|mahu|dari|from|0\d)/i)) {
                    break;
                }
                nameWords.push(word);
                if (nameWords.length >= 4) break; // Max 4 words for name
            }
            if (nameWords.length > 0) {
                const name = cleanName(nameWords.join(' '));
                if (name && name.length >= 2) {
                    return { name, confidence: 'low' };
                }
            }
        }
    }

    return null;
}

function cleanName(raw: string): string {
    return raw
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[,.\n]/g, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// ============================================
// CAMERA EXTRACTION
// ============================================

function extractCamera(text: string, cameras: Camera[]): { name: string; id: string; confidence: 'high' | 'medium' | 'low' } | null {
    const lowerText = text.toLowerCase();

    // Common camera name aliases
    const aliases: Record<string, string[]> = {
        'gopro': ['gopro', 'go pro', 'gp'],
        'hero 11': ['hero 11', 'hero11', 'h11'],
        'hero 13': ['hero 13', 'hero13', 'h13'],
        'osmo pocket 3': ['osmo pocket 3', 'pocket 3', 'osmo pocket3', 'op3', 'pocket3'],
        'osmo pocket': ['osmo pocket', 'pocket', 'osmo'],
        'action 5': ['action 5', 'action5', 'action 5 pro', 'action5pro', 'a5p'],
        'action 4': ['action 4', 'action4', 'osmo action 4', 'oa4'],
        'canon r50': ['canon r50', 'r50', 'eos r50'],
        'canon r6': ['canon r6', 'r6', 'eos r6'],
        'sony a7': ['sony a7', 'a7iii', 'a7 iii', 'a7 3', 'a73'],
    };

    // Direct match against camera names
    for (const camera of cameras) {
        const cameraNameLower = camera.name.toLowerCase();
        const modelLower = camera.model?.toLowerCase() || '';

        // Exact match
        if (lowerText.includes(cameraNameLower)) {
            return { name: camera.name, id: camera.id, confidence: 'high' };
        }

        // Model match
        if (modelLower && lowerText.includes(modelLower)) {
            return { name: camera.name, id: camera.id, confidence: 'high' };
        }
    }

    // Alias matching
    for (const camera of cameras) {
        const cameraNameLower = camera.name.toLowerCase();

        for (const [key, aliasGroup] of Object.entries(aliases)) {
            // Check if camera name contains this alias key
            if (cameraNameLower.includes(key)) {
                // Check if any alias is in the text
                for (const alias of aliasGroup) {
                    if (lowerText.includes(alias)) {
                        return { name: camera.name, id: camera.id, confidence: 'medium' };
                    }
                }
            }
        }
    }

    // Fuzzy match - check for brand + partial model
    const brands = ['gopro', 'dji', 'canon', 'sony', 'osmo'];
    for (const brand of brands) {
        if (lowerText.includes(brand)) {
            // Find cameras of this brand
            const brandCameras = cameras.filter(c =>
                c.name.toLowerCase().includes(brand) ||
                c.brand?.toLowerCase().includes(brand)
            );
            if (brandCameras.length === 1) {
                return { name: brandCameras[0].name, id: brandCameras[0].id, confidence: 'low' };
            }
        }
    }

    return null;
}

// ============================================
// DATE EXTRACTION
// ============================================

function extractDates(text: string): { start_date: string; end_date: string; confidence: 'high' | 'medium' | 'low' } | null {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Month name mapping
    const months: Record<string, number> = {
        'jan': 0, 'january': 0, 'januari': 0,
        'feb': 1, 'february': 1, 'februari': 1,
        'mar': 2, 'march': 2, 'mac': 2,
        'apr': 3, 'april': 3,
        'may': 4, 'mei': 4,
        'jun': 5, 'june': 5,
        'jul': 6, 'july': 6, 'julai': 6,
        'aug': 7, 'august': 7, 'ogos': 7,
        'sep': 8, 'sept': 8, 'september': 8,
        'oct': 9, 'october': 9, 'oktober': 9,
        'nov': 10, 'november': 10,
        'dec': 11, 'december': 11, 'disember': 11
    };

    // Pattern 1: "DD-DD Month" or "DD to DD Month" (e.g., "25-28 Dec", "25 to 28 December")
    const rangePattern1 = /(\d{1,2})\s*[-–to]+\s*(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|januari|februari|mac|mei|julai|ogos|oktober|disember)(?:\s+(\d{4}))?/i;
    const rangeMatch1 = text.match(rangePattern1);
    if (rangeMatch1) {
        const startDay = parseInt(rangeMatch1[1]);
        const endDay = parseInt(rangeMatch1[2]);
        const monthStr = rangeMatch1[3].toLowerCase();
        const year = rangeMatch1[4] ? parseInt(rangeMatch1[4]) : guessYear(months[monthStr.substring(0, 3)], now);
        const month = months[monthStr.substring(0, 3)];

        if (month !== undefined) {
            return {
                start_date: formatDate(year, month, startDay),
                end_date: formatDate(year, month, endDay),
                confidence: 'high'
            };
        }
    }

    // Pattern 2: "DD/MM - DD/MM" or "DD/MM/YYYY - DD/MM/YYYY"
    const rangePattern2 = /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\s*[-–to]+\s*(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/;
    const rangeMatch2 = text.match(rangePattern2);
    if (rangeMatch2) {
        const startDay = parseInt(rangeMatch2[1]);
        const startMonth = parseInt(rangeMatch2[2]) - 1;
        const startYear = rangeMatch2[3] ? normalizeYear(parseInt(rangeMatch2[3])) : guessYear(startMonth, now);
        const endDay = parseInt(rangeMatch2[4]);
        const endMonth = parseInt(rangeMatch2[5]) - 1;
        const endYear = rangeMatch2[6] ? normalizeYear(parseInt(rangeMatch2[6])) : guessYear(endMonth, now);

        return {
            start_date: formatDate(startYear, startMonth, startDay),
            end_date: formatDate(endYear, endMonth, endDay),
            confidence: 'high'
        };
    }

    // Pattern 3: "DD Month YYYY" or "DD Month" for single date or two separate dates
    const singleDatePattern = /(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|januari|februari|mac|mei|julai|ogos|oktober|disember)(?:\s+(\d{4}))?/gi;
    const singleMatches = [...text.matchAll(singleDatePattern)];
    if (singleMatches.length >= 2) {
        const first = singleMatches[0];
        const second = singleMatches[1];
        const month1 = months[first[2].toLowerCase().substring(0, 3)];
        const month2 = months[second[2].toLowerCase().substring(0, 3)];
        const year1 = first[3] ? parseInt(first[3]) : guessYear(month1, now);
        const year2 = second[3] ? parseInt(second[3]) : guessYear(month2, now);

        return {
            start_date: formatDate(year1, month1, parseInt(first[1])),
            end_date: formatDate(year2, month2, parseInt(second[1])),
            confidence: 'high'
        };
    } else if (singleMatches.length === 1) {
        const match = singleMatches[0];
        const month = months[match[2].toLowerCase().substring(0, 3)];
        const year = match[3] ? parseInt(match[3]) : guessYear(month, now);
        const date = formatDate(year, month, parseInt(match[1]));
        return {
            start_date: date,
            end_date: date, // Single day booking
            confidence: 'medium'
        };
    }

    // Pattern 4: DD/MM or DD/MM/YYYY (single date - assume single day booking)
    const simpleDatePattern = /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/g;
    const simpleMatches = [...text.matchAll(simpleDatePattern)];
    if (simpleMatches.length >= 2) {
        const first = simpleMatches[0];
        const second = simpleMatches[1];
        const startYear = first[3] ? normalizeYear(parseInt(first[3])) : guessYear(parseInt(first[2]) - 1, now);
        const endYear = second[3] ? normalizeYear(parseInt(second[3])) : guessYear(parseInt(second[2]) - 1, now);

        return {
            start_date: formatDate(startYear, parseInt(first[2]) - 1, parseInt(first[1])),
            end_date: formatDate(endYear, parseInt(second[2]) - 1, parseInt(second[1])),
            confidence: 'medium'
        };
    } else if (simpleMatches.length === 1) {
        const match = simpleMatches[0];
        const year = match[3] ? normalizeYear(parseInt(match[3])) : guessYear(parseInt(match[2]) - 1, now);
        const date = formatDate(year, parseInt(match[2]) - 1, parseInt(match[1]));
        return {
            start_date: date,
            end_date: date, // Single day booking
            confidence: 'medium'
        };
    }

    // Pattern 5: Relative dates (today, tomorrow, next week, etc.)
    const relativeDates = parseRelativeDates(text, now);
    if (relativeDates) {
        return relativeDates;
    }

    return null;
}

function normalizeYear(year: number): number {
    if (year < 100) {
        return year + 2000;
    }
    return year;
}

function guessYear(month: number, now: Date): number {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // If the month is in the past this year, assume next year
    if (month < currentMonth - 1) {
        return currentYear + 1;
    }
    return currentYear;
}

function formatDate(year: number, month: number, day: number): string {
    const d = new Date(year, month, day);
    return d.toISOString().split('T')[0];
}

function parseRelativeDates(text: string, now: Date): { start_date: string; end_date: string; confidence: 'low' } | null {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('today') || lowerText.includes('hari ini')) {
        const date = now.toISOString().split('T')[0];
        return { start_date: date, end_date: date, confidence: 'low' };
    }

    if (lowerText.includes('tomorrow') || lowerText.includes('esok')) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const date = tomorrow.toISOString().split('T')[0];
        return { start_date: date, end_date: date, confidence: 'low' };
    }

    // "this weekend", "hujung minggu"
    if (lowerText.includes('weekend') || lowerText.includes('hujung minggu')) {
        const saturday = new Date(now);
        saturday.setDate(now.getDate() + (6 - now.getDay()));
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        return {
            start_date: saturday.toISOString().split('T')[0],
            end_date: sunday.toISOString().split('T')[0],
            confidence: 'low'
        };
    }

    return null;
}

// ============================================
// PICKUP/DELIVERY EXTRACTION
// ============================================

function extractPickupInfo(text: string): { method: 'pickup' | 'delivery'; address: string | null } | null {
    const lowerText = text.toLowerCase();

    // Check for delivery keywords
    const deliveryKeywords = ['delivery', 'deliver', 'hantar', 'send', 'pos', 'ship', 'courier'];
    const pickupKeywords = ['pickup', 'pick up', 'ambil', 'collect', 'self collect'];

    let method: 'pickup' | 'delivery' = 'pickup'; // Default
    let address: string | null = null;

    // Check for explicit delivery
    for (const keyword of deliveryKeywords) {
        if (lowerText.includes(keyword)) {
            method = 'delivery';
            break;
        }
    }

    // Check for explicit pickup (overrides delivery if both present)
    for (const keyword of pickupKeywords) {
        if (lowerText.includes(keyword)) {
            method = 'pickup';
            break;
        }
    }

    // Extract address if delivery
    if (method === 'delivery' || lowerText.includes('address') || lowerText.includes('alamat')) {
        const addressPatterns = [
            /(?:address|alamat)[:\s]+(.+?)(?:\n|$)/i,
            /(?:delivery to|hantar ke|send to)[:\s]+(.+?)(?:\n|$)/i,
            /(?:to|ke)[:\s]+(\d+[,\s].+?)(?:\n|$)/i, // Address starting with number
        ];

        for (const pattern of addressPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                address = match[1].trim();
                method = 'delivery';
                break;
            }
        }

        // Look for common Malaysian address patterns
        if (!address) {
            const malaysianAddressPattern = /(?:no\.?\s*\d+|lot\s*\d+|blok\s*[a-z0-9]+|unit\s*\d+)[,\s]+.{10,100}/i;
            const match = text.match(malaysianAddressPattern);
            if (match) {
                address = match[0].trim();
                method = 'delivery';
            }
        }
    }

    return { method, address };
}

// ============================================
// NOTES EXTRACTION
// ============================================

function extractNotes(text: string): string | null {
    const lowerText = text.toLowerCase();
    const notes: string[] = [];

    // Look for explicit notes
    const notesPattern = /(?:notes?|catatan|remarks?)[:\s]+(.+?)(?:\n|$)/i;
    const notesMatch = text.match(notesPattern);
    if (notesMatch && notesMatch[1]) {
        notes.push(notesMatch[1].trim());
    }

    // Look for special requests
    const requestKeywords = [
        'extra battery', 'bateri tambahan',
        'memory card', 'sd card', 'kad memori',
        'tripod',
        'mic', 'microphone', 'mikrofon',
        'gimbal', 'stabilizer',
        'urgent', 'segera',
        'for wedding', 'untuk kahwin', 'majlis kahwin',
        'for travel', 'untuk travel', 'untuk jalan',
        'for event', 'untuk event', 'untuk acara'
    ];

    for (const keyword of requestKeywords) {
        if (lowerText.includes(keyword)) {
            // Find the sentence containing this keyword
            const sentences = text.split(/[.\n]/);
            for (const sentence of sentences) {
                if (sentence.toLowerCase().includes(keyword)) {
                    const trimmed = sentence.trim();
                    if (trimmed && !notes.includes(trimmed)) {
                        notes.push(trimmed);
                    }
                    break;
                }
            }
        }
    }

    return notes.length > 0 ? notes.join('. ') : null;
}

export default parseBookingText;
