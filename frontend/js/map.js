// Google Maps Integration
let map;
let markers = [];
let selectedLocation = null;

// Lebanon center coordinates
const LEBANON_CENTER = { lat: 33.8547, lng: 35.8623 };

// Category icons mapping (using emoji/unicode)
const CATEGORY_ICONS = {
    'طائرات مسيرة': '🛸',
    'طائرات حربية': '✈️',
    'صواريخ': '🚀',
    'انفجارات': '💥',
    'اشتباكات مسلحة': '⚔️',
    'قصف مدفعي': '💣',
    'حركة عسكرية': '🎖️',
    'أخرى': '📍'
};

// Initialize Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: LEBANON_CENTER,
        zoom: 9,
        mapTypeId: 'roadmap',
        styles: [
            {
                "elementType": "geometry",
                "stylers": [{ "color": "#1e293b" }]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{ "color": "#0f172a" }]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#cbd5e1" }]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#0ea5e9" }]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{ "color": "#334155" }]
            }
        ]
    });

    // Add click listener for creating new reports
    map.addListener('click', (e) => {
        if (isPublisher()) {
            openReportModal(e.latLng);
        }
    });

    // Load initial reports
    if (window.loadReports) {
        window.loadReports();
    }
}

// Open report modal with location
async function openReportModal(latLng) {
    selectedLocation = latLng;

    const modal = document.getElementById('reportModal');
    const latInput = document.getElementById('reportLat');
    const lngInput = document.getElementById('reportLng');
    const addressInput = document.getElementById('reportAddress');

    if (!modal || !latInput || !lngInput || !addressInput) return;

    latInput.value = latLng.lat();
    lngInput.value = latLng.lng();

    // Get address from coordinates using Geocoding
    try {
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({ location: latLng });

        if (response.results[0]) {
            addressInput.value = response.results[0].formatted_address;
        } else {
            addressInput.value = `${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`;
        }
    } catch (error) {
        addressInput.value = `${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`;
    }

    modal.style.display = 'block';
}

// Update map markers
function updateMapMarkers(reports) {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // Add new markers
    reports.forEach(report => {
        const position = { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) };

        // Get category icon
        const categoryName = report.category_name || getCategoryName(report.categorie);
        const icon = CATEGORY_ICONS[categoryName] || '📍';

        // Create custom marker with emoji
        const marker = new google.maps.Marker({
            position: position,
            map: map,
            title: categoryName,
            label: {
                text: icon,
                fontSize: '24px'
            },
            animation: google.maps.Animation.DROP
        });

        // Add click listener to show report details
        marker.addListener('click', () => {
            showReportDetails(report);
        });

        markers.push(marker);
    });
}

// Make functions globally available
window.initMap = initMap;
window.updateMapMarkers = updateMapMarkers;
window.openReportModal = openReportModal;
