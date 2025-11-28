// Location management for Lebanon locations
let governorates = [];
let districts = [];
let villages = [];

// Load locations on page load
async function loadLocations() {
    try {
        const response = await fetch(`${API_URL}/locations`);
        const allLocations = await response.json();

        // Separate by type
        governorates = allLocations.filter(loc => loc.loc_type === 'governorate');
        districts = allLocations.filter(loc => loc.loc_type === 'district');
        villages = allLocations.filter(loc => loc.loc_type === 'village');

        // Populate governorate dropdown
        populateGovernorateDropdown();
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

// Populate governorate dropdown
function populateGovernorateDropdown() {
    const governorateSelect = document.getElementById('governorate');
    if (!governorateSelect) return;

    governorateSelect.innerHTML = '<option value="">اختر المحافظة</option>';

    governorates.forEach(gov => {
        const option = document.createElement('option');
        option.value = gov.loc_id;
        option.textContent = gov.loc_name;
        governorateSelect.appendChild(option);
    });
}

// Handle governorate change
function handleGovernorateChange(governorateId) {
    const districtSelect = document.getElementById('district');
    const villageSelect = document.getElementById('village');

    if (!governorateId) {
        districtSelect.disabled = true;
        villageSelect.disabled = true;
        districtSelect.innerHTML = '<option value="">اختر القضاء</option>';
        villageSelect.innerHTML = '<option value="">اختر المدينة/القرية (اختياري)</option>';
        return;
    }

    // Filter districts for selected governorate
    const governorateDistricts = districts.filter(d => d.parent_id == governorateId);

    districtSelect.innerHTML = '<option value="">اختر القضاء</option>';
    governorateDistricts.forEach(district => {
        const option = document.createElement('option');
        option.value = district.loc_id;
        option.textContent = district.loc_name;
        districtSelect.appendChild(option);
    });

    districtSelect.disabled = false;
    villageSelect.disabled = true;
    villageSelect.innerHTML = '<option value="">اختر المدينة/القرية (اختياري)</option>';
}

// Handle district change
function handleDistrictChange(districtId) {
    const villageSelect = document.getElementById('village');

    if (!districtId) {
        villageSelect.disabled = true;
        villageSelect.innerHTML = '<option value="">اختر المدينة/القرية (اختياري)</option>';
        return;
    }

    // Filter villages for selected district
    const districtVillages = villages.filter(v => v.parent_id == districtId);

    villageSelect.innerHTML = '<option value="">اختر المدينة/القرية (اختياري)</option>';
    districtVillages.forEach(village => {
        const option = document.createElement('option');
        option.value = village.loc_id;
        option.textContent = village.loc_name;
        villageSelect.appendChild(option);
    });

    villageSelect.disabled = false;
}

// Setup location dropdown listeners
function setupLocationListeners() {
    const governorateSelect = document.getElementById('governorate');
    const districtSelect = document.getElementById('district');

    if (governorateSelect) {
        governorateSelect.addEventListener('change', (e) => {
            handleGovernorateChange(e.target.value);
        });
    }

    if (districtSelect) {
        districtSelect.addEventListener('change', (e) => {
            handleDistrictChange(e.target.value);
        });
    }
}

// Get selected location name for display
function getSelectedLocationName() {
    const governorateSelect = document.getElementById('governorate');
    const districtSelect = document.getElementById('district');
    const villageSelect = document.getElementById('village');

    let locationName = '';

    if (villageSelect && villageSelect.value) {
        locationName = villageSelect.options[villageSelect.selectedIndex].text;
    } else if (districtSelect && districtSelect.value) {
        locationName = districtSelect.options[districtSelect.selectedIndex].text;
    } else if (governorateSelect && governorateSelect.value) {
        locationName = governorateSelect.options[governorateSelect.selectedIndex].text;
    }

    return locationName;
}

// Initialize locations when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadLocations();
        setupLocationListeners();
    });
} else {
    loadLocations();
    setupLocationListeners();
}
