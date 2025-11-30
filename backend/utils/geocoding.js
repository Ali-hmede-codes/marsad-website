const axios = require('axios');

exports.getAddressFromCoordinates = async (latitude, longitude) => {
    try {
        if (!process.env.GOOGLE_MAPS_API_KEY) {
            console.warn('Google Maps API Key is missing');
            return null;
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=ar&key=${process.env.GOOGLE_MAPS_API_KEY}`;

        const response = await axios.get(url);

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            // Try to find a compound code or locality
            const result = response.data.results[0];
            return result.formatted_address;
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
};
