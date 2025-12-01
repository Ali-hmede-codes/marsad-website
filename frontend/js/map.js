// Leaflet.js Map Integration with OpenStreetMap
let map;
let markers = [];
let selectedLocation = null;

// Lebanon center coordinates
const LEBANON_CENTER = [33.8547, 35.8623];


// Initialize Leaflet Map
function initMap() {
    // Create map centered on Lebanon
    map = L.map('map').setView(LEBANON_CENTER, 9);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 7
    }).addTo(map);

    // Add click listener for creating new reports (logged in users only)
    map.on('click', (e) => {
        // Check if user is logged in
        if (!isLoggedIn()) {
            showLoginPrompt();
            return;
        }

        // Check if user is publisher
        if (isPublisher()) {
            openReportModal(e.latlng);
        } else {
            showNotification('يجب أن تكون ناشراً لإنشاء التقارير', 'error');
        }
    });

    // Load initial reports
    if (window.loadReports) {
        window.loadReports();
    }
}

// Show login prompt for non-authenticated users
// Show login prompt for non-authenticated users
function showLoginPrompt() {
    const modal = document.getElementById('loginPromptModal');
    const confirmBtn = document.getElementById('confirmLoginBtn');
    const cancelBtn = document.getElementById('cancelLoginBtn');
    const closeBtn = modal.querySelector('.close-login-prompt');

    if (!modal) return;

    modal.style.display = 'block';

    // Handle confirm
    const handleConfirm = () => {
        window.location.href = 'login.html';
    };

    // Handle close/cancel
    const handleClose = () => {
        modal.style.display = 'none';
        cleanup();
    };

    // Cleanup event listeners to avoid duplicates
    const cleanup = () => {
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleClose);
        closeBtn.removeEventListener('click', handleClose);
        window.removeEventListener('click', outsideClick);
    };

    // Close on outside click
    const outsideClick = (e) => {
        if (e.target === modal) {
            handleClose();
        }
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleClose);
    closeBtn.addEventListener('click', handleClose);
    window.addEventListener('click', outsideClick);
}

// Open report modal with location
async function openReportModal(latlng) {
    selectedLocation = latlng;

    const modal = document.getElementById('reportModal');
    const latInput = document.getElementById('reportLat');
    const lngInput = document.getElementById('reportLng');
    const addressInput = document.getElementById('reportAddress');

    if (!modal || !latInput || !lngInput || !addressInput) return;

    latInput.value = latlng.lat;
    lngInput.value = latlng.lng;

    // Get address from coordinates using Nominatim (OpenStreetMap)
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&accept-language=ar`
        );
        const data = await response.json();

        // Check if location is in Lebanon
        if (data && data.address) {
            const country = data.address.country;
            const countryCode = data.address.country_code;

            // Check if country is Lebanon (country name or country code)
            if (country !== 'لبنان' && country !== 'Lebanon' && countryCode !== 'lb') {
                showNotification('يمكن إنشاء التقارير في لبنان فقط', 'error');
                return;
            }
        }

        if (data && data.display_name) {
            addressInput.value = data.display_name;
        } else {
            addressInput.value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        addressInput.value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
    }

    modal.style.display = 'block';
}

// Create custom marker icon with category color and picture
function createCategoryIcon(category) {
    const colorR = category.catg_color_r || category.category_color_r || 100;
    const colorG = category.catg_color_g || category.category_color_g || 100;
    const colorB = category.catg_color_b || category.category_color_b || 100;
    const color = `rgb(${colorR}, ${colorG}, ${colorB})`;

    const categoryName = category.catg_name || category.category_name || '';
    const emoji = CATEGORY_ICONS[categoryName] || '📍';

    // Create custom HTML icon
    const iconHtml = `
        <div style="
            background-color: ${color};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
            ${emoji}
        </div>
    `;

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
}

// Update map markers
function updateMapMarkers(reports) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Add new markers
    reports.forEach(report => {
        const position = [parseFloat(report.latitude), parseFloat(report.longitude)];

        // Create custom icon with category color
        const icon = createCategoryIcon(report);

        // Create marker
        const marker = L.marker(position, {
            icon: icon,
            title: report.category_name || 'تقرير'
        }).addTo(map);

        // Add popup with report info
        const popupContent = `
            <div style="text-align: right; direction: rtl;">
                <h3 style="margin: 0 0 10px 0; color: rgb(${report.category_color_r || 100}, ${report.category_color_g || 100}, ${report.category_color_b || 100});">
                    ${report.category_name || 'تقرير'}
                </h3>
                <p style="margin: 5px 0;"><strong>الموقع:</strong> ${report.report_address || 'غير محدد'}</p>
                <p style="margin: 5px 0;"><strong>التاريخ:</strong> ${new Date(report.date_and_time).toLocaleString('ar-LB')}</p>
                <button onclick="showReportDetails(${report.rep_id})" style="
                    margin-top: 10px;
                    padding: 5px 15px;
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">عرض التفاصيل</button>
            </div>
        `;

        marker.bindPopup(popupContent);

        // Add click listener to show report details
        marker.on('click', () => {
            if (window.showReportDetails) {
                window.showReportDetails(report);
            }
        });

        markers.push(marker);
    });

    // Fit map to show all markers if there are any
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Helper function to get category name (for backward compatibility)
function getCategoryName(categoryId) {
    // This will be populated by reports.js when categories are loaded
    return '';
}

// Initialize map when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
} else {
    initMap();
}

// Make functions globally available
window.initMap = initMap;
window.updateMapMarkers = updateMapMarkers;
window.openReportModal = openReportModal;
