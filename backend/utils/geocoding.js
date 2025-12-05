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

            let city = null;
            if (result.address_components) {
                for (const component of result.address_components) {
                    if (component.types.includes('locality') || component.types.includes('sublocality') || component.types.includes('administrative_area_level_3')) {
                        city = component.long_name;
                        break;
                    }
                }
                if (!city) {
                    for (const component of result.address_components) {
                        if (component.types.includes('administrative_area_level_2')) {
                            city = component.long_name;
                            break;
                        }
                    }
                }
                if (!city) {
                    for (const component of result.address_components) {
                        if (component.types.includes('administrative_area_level_1')) {
                            city = component.long_name;
                            break;
                        }
                    }
                }
            }

            if (city) {
                return city;
            }

            const first = String(result.formatted_address || '').split(',')[0].trim();
            return first || null;
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
};
