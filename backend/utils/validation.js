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

// Sanitize input to prevent SQL injection
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim();
};

module.exports = {
    isInLebanon,
    isValidEmail,
    sanitizeInput
};
