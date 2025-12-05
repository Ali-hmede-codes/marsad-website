// Validate if coordinates are within Lebanon boundaries
const isInLebanon = (latitude, longitude) => {
    // Lebanon approximate boundaries
    const LEBANON_BOUNDS = {
        north: 34.69,
        south: 33.05,
        east: 36.62,
        west: 35.10
    };

    return (
        latitude >= LEBANON_BOUNDS.south &&
        latitude <= LEBANON_BOUNDS.north &&
        longitude >= LEBANON_BOUNDS.west &&
        longitude <= LEBANON_BOUNDS.east
    );
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const badArabic = /(مستشفى|مشفى|طريق|شارع|أوتوستراد|جسر|نفق|مطار|جامعة|محطة|قصر|مرفأ|ميناء|دوار|مستديرة|مدرسة|سوق|مول|صيدلية|مطعم|فندق|معمل|مصنع|لبنان|محافظة|قضاء)/u;
const badEnglish = /(pharmacy|pharmacie|hospital|hopital|clinic|clinique|shop|store|market|supermarket|mall|restaurant|hotel|bank|atm|station|bridge|tunnel|airport|university|school|college|center|centre|lebanon|liban|street|road|avenue)/i;

const isValidCityName = (name) => {
    const s = String(name || '').trim();
    if (!s) return false;
    if (/\d/.test(s)) return false;
    if (badArabic.test(s) || badEnglish.test(s)) return false;
    return true;
};

const extractCityName = (address) => {
    if (!address) return '';
    const parts = String(address).split(',').map(s => s.trim()).filter(Boolean);
    const isBad = (p) => badArabic.test(p) || badEnglish.test(p);
    const hasDigits = (p) => /\d/.test(p);
    const adminRx = /(قضاء|محافظة|لبنان|lebanon|liban)/i;
    const isArabic = (p) => /[\u0600-\u06FF]/.test(p);
    const adminIndex = parts.findIndex(p => adminRx.test(p));
    const pool = adminIndex > 0
        ? parts.slice(0, adminIndex).filter(p => !isBad(p) && !hasDigits(p))
        : parts.filter(p => !isBad(p) && !hasDigits(p));
    if (pool.length === 0) return String(address).trim();
    const arabicPool = pool.filter(isArabic);
    const candidate = arabicPool.length ? arabicPool[arabicPool.length - 1] : pool[pool.length - 1];
    return candidate;
};

// Sanitize input to prevent SQL injection
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim();
};

module.exports = {
    isInLebanon,
    isValidEmail,
    sanitizeInput,
    isValidCityName,
    extractCityName
};
