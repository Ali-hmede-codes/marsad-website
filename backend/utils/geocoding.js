const axios = require('axios');

/**
 * Get address from coordinates using Google Maps Geocoding API
 * Focuses on extracting Lebanon-specific location information
 */
exports.getAddressFromCoordinates = async (latitude, longitude) => {
    try {
        if (!process.env.GOOGLE_MAPS_API_KEY) {
            console.warn('Google Maps API Key is missing');
            return null;
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=ar&key=${process.env.GOOGLE_MAPS_API_KEY}`;

        const response = await axios.get(url);

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];

            // Try to extract specific location components for Lebanon
            let locationParts = [];

            if (result.address_components) {
                for (const component of result.address_components) {
                    // Extract locality (city/village), administrative areas (governorate/district)
                    if (component.types.includes('locality') ||
                        component.types.includes('administrative_area_level_1') ||
                        component.types.includes('administrative_area_level_2')) {
                        locationParts.push(component.long_name);
                    }
                }
            }

            // Return specific location if found, otherwise use formatted address
            if (locationParts.length > 0) {
                return locationParts.join(', ');
            }

            return result.formatted_address;
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
};
