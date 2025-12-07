// Reports management
let allReports = [];
let categories = [];
let cityQuery = '';

function debounce(fn, delay = 500, immediate = true) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) fn.apply(context, args);
        }, delay);
        if (callNow) fn.apply(context, args);
    };
}


// Load categories
async function loadCategories() {
    try {
        const response = await fetchWithAuth(`${window.API_URL}/categories`);
        const data = await response.json();
        let isAdminNow = false, isPublisherNow = false;
        try {
            const meResp = await fetchWithAuth(`${window.API_URL}/auth/me`);
            if (meResp && meResp.ok) {
                const me = await meResp.json();
                isAdminNow = !!(me && me.is_admin);
                isPublisherNow = !!(me && me.is_publisher);
            }
        } catch (_) {}
        const allowRole = (r) => {
            const role = String(r || '').toLowerCase();
            if (isAdminNow) return true;
            return role === 'user' || role === 'publisher';
        };
        const filterTree = (arr) => {
            return (Array.isArray(arr) ? arr : []).map(p => {
                const children = Array.isArray(p.children) ? p.children.filter(ch => allowRole(ch.required_role)) : [];
                const includeParent = isAdminNow || allowRole(p.required_role) || children.length > 0;
                if (!includeParent) return null;
                const copy = { ...p };
                copy.children = children;
                return copy;
            }).filter(Boolean);
        };
        categories = filterTree(data);

        // Populate filter dropdown
        const filterSelect = document.getElementById('categoryFilter');
        const reportCategorySelect = document.getElementById('reportCategory');

        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">جميع الفئات</option>'; 
            categories.forEach(parent => {
                const hasChildren = parent.children && parent.children.length > 0;
                if (hasChildren) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = parent.catg_name;
                    parent.children.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.catg_id;
                        const color = `rgb(${cat.catg_color_r || 100}, ${cat.catg_color_g || 100}, ${cat.catg_color_b || 100})`;
                        option.textContent = cat.catg_name;
                        option.style.color = color;
                        option.style.fontWeight = 'bold';
                        optgroup.appendChild(option);
                    });
                    filterSelect.appendChild(optgroup);
                }
            });
        }

        const mainFilterSelect = document.getElementById('mainCategoryFilter');
        if (mainFilterSelect) {
            mainFilterSelect.innerHTML = '<option value="">جميع الفئات الرئيسية</option>';
            categories.forEach(parent => {
                const option = document.createElement('option');
                option.value = parent.catg_id;
                option.textContent = parent.catg_name;
                mainFilterSelect.appendChild(option);
            });

            const populateFilterChildren = (parentId) => {
                if (!filterSelect) return;
                if (!parentId) {
                    filterSelect.innerHTML = '<option value="">جميع الفئات</option>';
                    categories.forEach(parent => {
                        const hasChildren = parent.children && parent.children.length > 0;
                        if (hasChildren) {
                            const optgroup = document.createElement('optgroup');
                            optgroup.label = parent.catg_name;
                            parent.children.forEach(cat => {
                                const option = document.createElement('option');
                                option.value = cat.catg_id;
                                const color = `rgb(${cat.catg_color_r || 100}, ${cat.catg_color_g || 100}, ${cat.catg_color_b || 100})`;
                                option.textContent = cat.catg_name;
                                option.style.color = color;
                                option.style.fontWeight = 'bold';
                                optgroup.appendChild(option);
                            });
                            filterSelect.appendChild(optgroup);
                        }
                    });
                    return;
                }

                filterSelect.innerHTML = '<option value="">جميع الفئات</option>';
                const parent = categories.find(p => String(p.catg_id) === String(parentId));
                const children = parent && parent.children ? parent.children : [];
                children.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.catg_id;
                    const color = `rgb(${cat.catg_color_r || 100}, ${cat.catg_color_g || 100}, ${cat.catg_color_b || 100})`;
                    option.textContent = cat.catg_name;
                    option.style.color = color;
                    option.style.fontWeight = 'bold';
                    filterSelect.appendChild(option);
                });
            };

            mainFilterSelect.addEventListener('change', (e) => {
                populateFilterChildren(e.target.value);
                if (filterSelect) filterSelect.value = '';
                loadReports('');
            });
        }

        const reportMainCategorySelect = document.getElementById('reportMainCategory');
        if (reportMainCategorySelect && reportCategorySelect) {
            reportMainCategorySelect.innerHTML = '<option value="">اختر الفئة الرئيسية</option>';
            categories.forEach(parent => {
                const option = document.createElement('option');
                option.value = parent.catg_id;
                option.textContent = parent.catg_name;
                reportMainCategorySelect.appendChild(option);
            });

            const populateChildren = (parentId) => {
                reportCategorySelect.innerHTML = '<option value="">اختر الفئة</option>';
                const parent = categories.find(p => String(p.catg_id) === String(parentId));
                const children = parent && parent.children ? parent.children : [];
                children.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.catg_id;
                    const color = `rgb(${cat.catg_color_r || 100}, ${cat.catg_color_g || 100}, ${cat.catg_color_b || 100})`;
                    option.textContent = cat.catg_name;
                    option.style.color = color;
                    option.style.fontWeight = 'bold';
                    reportCategorySelect.appendChild(option);
                });
            };

            reportMainCategorySelect.addEventListener('change', (e) => {
                populateChildren(e.target.value);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load reports
async function loadReports(categoryFilter = '') {
    try {
        let url = `${window.API_URL}/reports/today`;
        if (categoryFilter) {
            url += `?category=${categoryFilter}`;
        }

        const response = await fetchWithAuth(url);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'فشل تحميل التقارير');
        }
        const data = await response.json();
        allReports = Array.isArray(data) ? data : [];

        if (window.updateMapMarkers) {
            try {
                const base = cityQuery ? allReports.filter(r => {
                    const city = extractCity(r.report_address || '');
                    return city.toLowerCase().includes(cityQuery.toLowerCase());
                }) : allReports;
                window.updateMapMarkers(base);
            } catch (e) {
                if (window.showNotification) window.showNotification('حدث خطأ في عرض العلامات', 'error');
            }
        }

        const dailyInputEl = document.getElementById('dailyDate');
        const dateStr = dailyInputEl ? dailyInputEl.value : formatDateISO(new Date());
        renderDailyReportsForDate(dateStr);

        return allReports;
    } catch (error) {
        console.error('Error loading reports:', error);
        if (!navigator.onLine) {
            if (window.showNotification) window.showNotification('لا يوجد اتصال بالشبكة', 'error');
        } else {
            if (window.showNotification) window.showNotification(error.message || 'فشل تحميل التقارير', 'error');
        }
        return [];
    }
}

// Create new report
async function createReport(reportData) {
    try {
        const response = await fetchWithAuth(`${window.API_URL}/reports`, {
            method: 'POST',
            body: JSON.stringify(reportData)
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            // Return the specific error message from backend
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get category name by ID
function getCategoryName(categoryId) {
    let name = 'غير معروف';
    const idStr = String(categoryId);
    (categories || []).forEach(p => {
        if (String(p.catg_id) === idStr) { name = p.catg_name; return; }
        (p.children || []).forEach(ch => { if (String(ch.catg_id) === idStr) name = ch.catg_name; });
    });
    return name;
}

// Show report details
function showReportDetails(report) {
    const modal = document.getElementById('detailsModal');
    const detailsDiv = document.getElementById('reportDetails');

    if (!modal || !detailsDiv) return;

    const date = new Date(report.date_and_time);
    const formattedDate = date.toLocaleDateString('ar-LB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const categoryName = report.category_name || getCategoryName(report.categorie);
    const colorR = report.category_color_r || 100;
    const colorG = report.category_color_g || 100;
    const colorB = report.category_color_b || 100;
    const color = `rgb(${colorR}, ${colorG}, ${colorB})`;

    detailsDiv.innerHTML = `
        <div class="report-detail">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <div style="
                    background-color: ${color};
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M12 2c4 0 7 3 7 7 0 6-7 13-7 13s-7-7-7-13c0-4 3-7 7-7z"></path>
                        <circle cx="12" cy="9" r="2" fill="white"></circle>
                    </svg>
                </div>
                <h3 style="margin: 0; color: ${color};">${categoryName}</h3>
            </div>
            <p><strong>الموقع:</strong> ${extractCity(report.report_address)}</p>
            <p><strong>التاريخ والوقت:</strong> ${formattedDate}</p>
            <p><strong>الإحداثيات:</strong> ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}</p>
            ${report.reporter_name ? `<p><strong>المبلغ:</strong> ${report.reporter_name}</p>` : ''}
        </div>
    `;

    modal.classList.add('active');
}
window.showReportDetails = showReportDetails;

function extractCity(address) {
    if (!address) return '';
    const parts = String(address).split(',').map(s => s.trim()).filter(Boolean);
    const bad = [
        /\b(?:مستشفى|مشفى|طريق|شارع|أوتوستراد|جسر|نفق|مطار|جامعة|محطة|قصر|مرفأ|ميناء|دوار|مستديرة|مدرسة|سوق|مول|صيدلية|مطعم|فندق|معمل|مصنع)\b/u,
        /\b(?:pharmacy|pharmacie|hospital|hopital|clinic|clinique|shop|store|market|supermarket|mall|restaurant|hotel|bank|atm|station|bridge|tunnel|airport|university|school|college|center|centre)\b/i
    ];
    const isBad = (p) => bad.some(rx => rx.test(p));
    const hasDigits = (p) => /\d/.test(p);
    const adminRx = /(قضاء|محافظة|لبنان|lebanon|liban)/i;
    const isArabic = (p) => /[\u0600-\u06FF]/.test(p);
    const adminIndex = parts.findIndex(p => adminRx.test(p));
    const pool = adminIndex > 0
        ? parts.slice(0, adminIndex).filter(p => !isBad(p) && !hasDigits(p))
        : parts.filter(p => !isBad(p) && !hasDigits(p));
    if (!pool.length) {
        const fallback = parts.find(p => !isBad(p)) || String(address).trim();
        return fallback;
    }
    const arabicPool = pool.filter(isArabic);
    return arabicPool.length ? arabicPool[arabicPool.length - 1] : pool[pool.length - 1];
}

function isValidCityName(name) {
    const s = String(name || '').trim();
    if (!s) return false;
    if (/\d/.test(s)) return false;
    const bad = [
        /\b(?:مستشفى|مشفى|طريق|شارع|أوتوستراد|جسر|نفق|مطار|جامعة|محطة|قصر|مرفأ|ميناء|دوار|مستديرة|مدرسة|سوق|مول|صيدلية|مطعم|فندق|معمل|مصنع)\b/u,
        /\b(?:pharmacy|pharmacie|hospital|hopital|clinic|clinique|shop|store|market|supermarket|mall|restaurant|hotel|bank|atm|station|bridge|tunnel|airport|university|school|college|center|centre)\b/i,
        /\b(?:lebanon|liban|لبنان|محافظة|قضاء)\b/i
    ];
    if (bad.some(rx => rx.test(s))) return false;
    return true;
}
window.extractCity = extractCity;
window.isValidCityName = isValidCityName;

function getCityFromAddr(addr) {
    const a = addr || {};
    const city = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || '';
    return String(city || '').trim();
}

function formatDateISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function renderDailyReportsForDate(dateStr) {
    const tbody = document.querySelector('#dailyReportsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const base = cityQuery ? allReports.filter(r => {
        const city = extractCity(r.report_address || '');
        return city.toLowerCase().includes(cityQuery.toLowerCase());
    }) : allReports;
    const filtered = base.filter(r => {
        const d = new Date(r.date_and_time);
        return formatDateISO(d) === dateStr;
    });
    filtered.forEach(r => {
        const tr = document.createElement('tr');
        const time = new Date(r.date_and_time).toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit' });
        const typeName = r.category_name || getCategoryName(r.categorie);
        const city = extractCity(r.report_address);
        const count = Number(r.confirmation_count || 1);
        tr.innerHTML = `<td>${time}</td><td>${typeName}</td><td><span style="display:inline-flex;align-items:center;gap:6px;">\
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                <path d="M12 2c4 0 7 3 7 7 0 6-7 13-7 13s-7-7-7-13c0-4 3-7 7-7z"></path>\
                <circle cx="12" cy="9" r="2" fill="currentColor"></circle>\
            </svg> ${city}</span></td><td><span class="badge" style="display:inline-block;padding:2px 8px;border-radius:12px;background:#eee;color:#333;font-weight:600;">${count}</span></td>`;
        tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const dailyInput = document.getElementById('dailyDate');
    if (dailyInput) {
        const today = formatDateISO(new Date());
        dailyInput.value = today;
        dailyInput.addEventListener('change', () => renderDailyReportsForDate(dailyInput.value));
        renderDailyReportsForDate(today);
    }
});

// Initialize reports functionality
document.addEventListener('DOMContentLoaded', () => {
    // Load categories and reports
    loadCategories();
    loadReports();

    const manualGroup = document.getElementById('manualLocationGroup');
    const addressInput = document.getElementById('reportAddress');
    const latManualElInit = document.getElementById('reportLatManual');
    const lngManualElInit = document.getElementById('reportLngManual');
    const autoGroup = document.getElementById('autoLocationGroup');
    const tabs = document.getElementById('locationModeTabs');
    let locationMode = 'auto';
    // اترك إظهار/إخفاء الحقول لمدير التبويبات فقط

    function syncAddressRequirement() {
        if (!addressInput) return;
        const latEl = document.getElementById('reportLatManual');
        const lngEl = document.getElementById('reportLngManual');
        const manualActive = locationMode === 'manual' && (isAdmin && isAdmin()) && latEl && lngEl && latEl.value && lngEl.value;
        addressInput.required = !manualActive;
    }
    const updateFromManualDebounced = debounce(async () => {
        const latStr = latManualElInit ? latManualElInit.value : '';
        const lngStr = lngManualElInit ? lngManualElInit.value : '';
        if (!latStr || !lngStr) return;
        const lat = parseDMS(latStr, false);
        const lng = parseDMS(lngStr, true);
        if (lat == null || lng == null) return;
        const latHiddenEl = document.getElementById('reportLat');
        const lngHiddenEl = document.getElementById('reportLng');
        if (latHiddenEl) latHiddenEl.value = lat;
        if (lngHiddenEl) lngHiddenEl.value = lng;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
            const data = await response.json();
            if (data && data.address) {
                const country = data.address.country_code;
                if (country && country.toLowerCase() !== 'lb') {
                    if (window.showNotification) window.showNotification('يمكن تحديد مواقع داخل لبنان فقط', 'error');
                    return;
                }
            }
            const addr = data && data.address ? data.address : {};
            let city = getCityFromAddr(addr);
            if (!city) {
                const name = data && data.display_name ? data.display_name : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                city = extractCity(name);
            }
            if (addressInput) addressInput.value = city || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (e) {}
    }, 600, true);

    if (latManualElInit) latManualElInit.addEventListener('input', () => { syncAddressRequirement(); if (locationMode === 'manual') updateFromManualDebounced(); });
    if (lngManualElInit) lngManualElInit.addEventListener('input', () => { syncAddressRequirement(); if (locationMode === 'manual') updateFromManualDebounced(); });
    syncAddressRequirement();

    

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            loadReports(e.target.value);
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', debounce(async () => {
            await refreshTodayReports(false);
        }, 800, true));
    }

    const locationSearchInput = document.getElementById('locationSearch');
    const searchCityBtn = document.getElementById('searchBtn');
    const suggestionsEl = document.getElementById('locationSuggestions');
    const applyCitySearch = debounce(() => {
        cityQuery = locationSearchInput ? String(locationSearchInput.value || '').trim() : '';
        const dailyInputEl2 = document.getElementById('dailyDate');
        const dateStr2 = dailyInputEl2 ? dailyInputEl2.value : formatDateISO(new Date());
        if (window.clearMarkers) window.clearMarkers();
        try {
            const base = cityQuery ? allReports.filter(r => {
                const city = extractCity(r.report_address || '');
                return city.toLowerCase().includes(cityQuery.toLowerCase());
            }) : allReports;
            if (window.updateMapMarkers) window.updateMapMarkers(base);
        } catch (_) {}
        renderDailyReportsForDate(dateStr2);
        if (window.showNotification) window.showNotification(cityQuery ? `تمت التصفية حسب المدينة: ${cityQuery}` : 'تم إلغاء التصفية حسب المدينة', 'info');
        if (suggestionsEl) suggestionsEl.style.display = 'none';
    }, 300, true);
    if (searchCityBtn) searchCityBtn.addEventListener('click', applyCitySearch);
    if (locationSearchInput) locationSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); applyCitySearch(); }
    });

    async function fetchCitySuggestions(q) {
        if (!suggestionsEl) return;
        const query = String(q || '').trim();
        if (!query || query.length < 2) {
            suggestionsEl.style.display = 'none';
            suggestionsEl.innerHTML = '';
            return;
        }
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=lb&limit=10&accept-language=ar&q=${encodeURIComponent(query)}`);
            const items = await resp.json();
            const filtered = (Array.isArray(items) ? items : []).filter(it => ['city','town','village','hamlet','municipality'].includes(it.type));
            const names = [];
            filtered.forEach(it => {
                const a = it.address || {};
                let city = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || '';
                if (!city) {
                    const name = it.display_name || '';
                    city = extractCity(name);
                }
                city = String(city || '').trim();
                if (city && !names.includes(city)) names.push(city);
            });
            const localSet = new Set();
            allReports.forEach(r => {
                const c = extractCity(r.report_address || '');
                if (c && c.toLowerCase().includes(query.toLowerCase())) localSet.add(c);
            });
            const merged = Array.from(new Set([...names, ...Array.from(localSet)]));
            if (merged.length) {
                suggestionsEl.innerHTML = merged.slice(0, 10).map(c => `<button type="button" class="suggestion-item" data-city="${c}">${c}</button>`).join('');
                suggestionsEl.style.display = 'block';
            } else {
                suggestionsEl.innerHTML = '';
                suggestionsEl.style.display = 'none';
            }
        } catch (_) {
            suggestionsEl.innerHTML = '';
            suggestionsEl.style.display = 'none';
        }
    }

    const debouncedFetchSuggestions = debounce(() => fetchCitySuggestions(locationSearchInput ? locationSearchInput.value : ''), 300, true);
    if (locationSearchInput) {
        locationSearchInput.addEventListener('input', debouncedFetchSuggestions);
        locationSearchInput.addEventListener('focus', debouncedFetchSuggestions);
    }
    if (suggestionsEl) {
        suggestionsEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.suggestion-item');
            if (!btn) return;
            if (locationSearchInput) locationSearchInput.value = btn.dataset.city || '';
            applyCitySearch();
            suggestionsEl.style.display = 'none';
        });
    }
    document.addEventListener('click', (e) => {
        if (!suggestionsEl) return;
        const inside = suggestionsEl.contains(e.target) || (locationSearchInput && locationSearchInput.contains && locationSearchInput.contains(e.target));
        if (!inside) suggestionsEl.style.display = 'none';
    });

    async function getBrowserLocation() {
        return new Promise((resolve, reject) => {
            if (!('geolocation' in navigator)) {
                reject(new Error('المتصفح لا يدعم تحديد الموقع'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve(pos.coords),
                (err) => reject(err),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            );
        });
    }

    async function setLocationFromGPS(mode) {
        const gpsBtn = mode === 'manual' ? document.getElementById('gpsManualBtn') : document.getElementById('gpsAutoBtn');
        try {
            if (gpsBtn) gpsBtn.disabled = true;
            if (window.setMapLoading) window.setMapLoading(true);
            if (window.showNotification) window.showNotification('جارٍ تحديد موقعك...', 'info');
            const coords = await getBrowserLocation();
            const lat = coords.latitude;
            const lng = coords.longitude;
            const latHiddenEl = document.getElementById('reportLat');
            const lngHiddenEl = document.getElementById('reportLng');
            if (latHiddenEl) latHiddenEl.value = lat;
            if (lngHiddenEl) lngHiddenEl.value = lng;

            if (mode === 'manual' && latManualElInit && lngManualElInit) {
                latManualElInit.value = lat.toFixed(6);
                lngManualElInit.value = lng.toFixed(6);
                updateFromManualDebounced();
            } else {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
                    const data = await response.json();
                    if (data && data.address) {
                        const country = data.address.country_code;
                        if (country && country.toLowerCase() !== 'lb') {
                            if (window.showNotification) window.showNotification('يمكن تحديد مواقع داخل لبنان فقط', 'error');
                        }
                    }
                    const addr = data && data.address ? data.address : {};
                    let city = getCityFromAddr(addr);
                    if (!city) {
                        const name = data && data.display_name ? data.display_name : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                        city = extractCity(name);
                    }
                    if (addressInput) addressInput.value = city || '';
                } catch (_) {}
            }
            if (window.showNotification) window.showNotification('تم تحديد الموقع بنجاح', 'success');
        } catch (e) {
            const msg = e && e.message ? e.message : 'تعذر تحديد موقعك';
            if (e && e.code === 1) {
                if (window.showNotification) window.showNotification('تم رفض الإذن للوصول إلى الموقع', 'error');
            } else if (e && e.code === 2) {
                if (window.showNotification) window.showNotification('إشارة GPS ضعيفة أو غير متاحة', 'error');
            } else if (e && e.code === 3) {
                if (window.showNotification) window.showNotification('انتهى الوقت دون استرجاع الموقع', 'error');
            } else {
                if (window.showNotification) window.showNotification(msg, 'error');
            }
        } finally {
            const gpsBtn2 = mode === 'manual' ? document.getElementById('gpsManualBtn') : document.getElementById('gpsAutoBtn');
            if (gpsBtn2) gpsBtn2.disabled = false;
            if (window.setMapLoading) window.setMapLoading(false);
        }
    }

    const gpsAutoBtn = document.getElementById('gpsAutoBtn');
    if (gpsAutoBtn) {
        gpsAutoBtn.addEventListener('click', () => setLocationFromGPS('auto'));
    }
    const gpsManualBtn = document.getElementById('gpsManualBtn');
    if (gpsManualBtn) {
        gpsManualBtn.addEventListener('click', () => setLocationFromGPS('manual'));
    }

    const refreshDailyBtn = document.getElementById('refreshDailyBtn');
    if (refreshDailyBtn) {
        refreshDailyBtn.addEventListener('click', debounce(async () => {
            await refreshTodayReports(false);
        }, 800, true));
    }

    // Report form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!isPublisher()) {
                showNotification('يجب أن تكون ناشراً لإنشاء تقرير', 'error');
                return;
            }

            const latHiddenEl = document.getElementById('reportLat');
            const lngHiddenEl = document.getElementById('reportLng');
            const latManualEl = document.getElementById('reportLatManual');
            const lngManualEl = document.getElementById('reportLngManual');
            let latitude = latHiddenEl ? latHiddenEl.value : '';
            let longitude = lngHiddenEl ? lngHiddenEl.value : '';
            let isManual = false;

            if (locationMode === 'manual' && (isAdmin && isAdmin()) && latManualEl && lngManualEl && latManualEl.value && lngManualEl.value) {
                const latM = parseDMS(latManualEl.value, false);
                const lngM = parseDMS(lngManualEl.value, true);
                if (latM == null || lngM == null) {
                    showNotification('صيغة الإحداثيات غير صحيحة', 'error');
                    return;
                }
                latitude = latM;
                longitude = lngM;
                isManual = true;
            }

            const rawAddress = document.getElementById('reportAddress').value;
            const cityOnly = extractCity(rawAddress);
            if (!isValidCityName(cityOnly)) {
                showNotification('يرجى اختيار مدينة أو بلدة فقط', 'error');
                return;
            }
            const reportData = {
                latitude,
                longitude,
                category: document.getElementById('reportCategory').value,
                report_address: cityOnly,
                is_manual_location: isManual
            };

            const result = await createReport(reportData);

            if (result.success) {
                const msg = (result.data && result.data.updated) ? 'تم تحديث عدد مرات التبليغ' : 'تم إنشاء التقرير بنجاح';
                showNotification(msg, 'success');
                document.getElementById('reportModal').classList.remove('active');
                reportForm.reset();
                loadReports();
            } else {
                showNotification(result.error || 'حدث خطأ في إنشاء التقرير', 'error');
            }
        });
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('reportModal').classList.remove('active');
        });
    }

    // Close modals
    const closeButtons = document.querySelectorAll('.close, .close-details');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const reportModal = document.getElementById('reportModal');
            const detailsModal = document.getElementById('detailsModal');

            if (e.target === reportModal) {
                reportModal.classList.remove('active');
            }
            if (e.target === detailsModal) {
                detailsModal.classList.remove('active');
            }
        });

    function scheduleMidnightRefresh() {
        const now = new Date();
        const next = new Date(now);
        next.setHours(24, 0, 0, 0);
        const ms = next.getTime() - now.getTime();
        setTimeout(async () => {
            await refreshTodayReports(true);
            scheduleMidnightRefresh();
        }, ms);
    }

    document.addEventListener('DOMContentLoaded', () => {
        scheduleMidnightRefresh();
    });

    if (tabs) {
        const autoBtn = tabs.querySelector('[data-mode="auto"]');
        const manualBtn = tabs.querySelector('[data-mode="manual"]');
        const isAdminNow = (isAdmin && isAdmin());
        const setMode = (mode) => {
            if (mode === 'manual' && !isAdminNow) {
                if (window.showNotification) window.showNotification('الوضع اليدوي للمدراء فقط', 'error');
                return;
            }
            locationMode = mode;
            if (autoBtn) autoBtn.classList.toggle('active', mode === 'auto');
            if (manualBtn) manualBtn.classList.toggle('active', mode === 'manual');
            if (autoGroup) autoGroup.classList.toggle('hidden', mode !== 'auto');
            if (manualGroup) manualGroup.classList.toggle('hidden', !(mode === 'manual' && isAdminNow));
            const searchBtn = document.getElementById('searchAddressBtn');
            const latManualEl = document.getElementById('reportLatManual');
            const lngManualEl = document.getElementById('reportLngManual');
            if (addressInput) {
                addressInput.readOnly = (mode === 'manual');
                addressInput.placeholder = mode === 'auto' ? 'ابحث عن مدينة في لبنان' : 'اسم المدينة (يُحدد تلقائياً)';
                addressInput.required = mode === 'auto';
                if (mode === 'manual' && addressInput.value) {
                    addressInput.value = extractCity(addressInput.value);
                }
            }
            if (searchBtn) {
                searchBtn.style.display = (mode === 'manual') ? 'none' : '';
                searchBtn.disabled = (mode === 'manual');
            }
            if (latManualEl) latManualEl.required = (mode === 'manual' && isAdminNow);
            if (lngManualEl) lngManualEl.required = (mode === 'manual' && isAdminNow);
            syncAddressRequirement();
            if (mode === 'manual') updateFromManualDebounced();
        };
        if (autoBtn) autoBtn.addEventListener('click', () => setMode('auto'));
        if (manualBtn && isAdminNow) manualBtn.addEventListener('click', () => setMode('manual'));
        if (tabs) {
            tabs.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-mode]');
                if (!btn) return;
                const mode = btn.getAttribute('data-mode');
                setMode(mode === 'manual' ? 'manual' : 'auto');
            });
        }
        if (manualBtn && !isAdminNow) {
            manualBtn.style.display = 'none';
        }
        setMode('auto');
        if (!isAdminNow && manualGroup) {
            manualGroup.classList.add('hidden');
        }
        window.setReportLocationMode = setMode;
    }
});

async function refreshTodayReports(isMidnight) {
    const filterSelect = document.getElementById('categoryFilter');
    const filter = filterSelect ? filterSelect.value : '';
    const refreshBtn = document.getElementById('refreshBtn');
    const refreshDailyBtn = document.getElementById('refreshDailyBtn');
    if (window.setMapLoading) window.setMapLoading(true);
    if (refreshBtn) {
        refreshBtn.disabled = true;
        const t = refreshBtn.innerHTML;
        refreshBtn.dataset.prev = t;
        refreshBtn.innerHTML = '<span class="loading" style="display:inline-flex;align-items:center;gap:6px;">\
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                <circle cx="12" cy="12" r="10" opacity="0.2"></circle>\
                <path d="M12 2a10 10 0 0 1 10 10" />\
            </svg>\
            جاري التحديث...\
        </span>';
    }
    if (refreshDailyBtn) {
        refreshDailyBtn.disabled = true;
    }
    try {
        if (window.clearMarkers) window.clearMarkers();
        await loadReports(filter);
        if (window.showNotification) window.showNotification(isMidnight ? 'تم تحديث تقارير اليوم لليوم الجديد' : 'تم تحديث تقارير اليوم', 'info');
    } catch (e) {
        if (window.showNotification) window.showNotification('حدث خطأ أثناء التحديث', 'error');
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            if (refreshBtn.dataset.prev) refreshBtn.innerHTML = refreshBtn.dataset.prev;
        }
        if (refreshDailyBtn) refreshDailyBtn.disabled = false;
        if (window.setMapLoading) window.setMapLoading(false);
    }
}
    function parseDMS(input, isLongitude) {
        if (!input) return null;
        const s = String(input).trim().replace(/\s+/g, ' ');
        let dir = 1;
        const dirm = s.match(/[NSEW]/i);
        if (dirm) {
            const ch = dirm[0].toUpperCase();
            if (ch === 'S' || ch === 'W') dir = -1;
        }
        const parts = s
            .replace(/°/g, ' ')
            .replace(/'/g, ' ')
            .replace(/"/g, ' ')
            .trim()
            .split(' ')
            .filter(Boolean);
        let deg = 0, min = 0, sec = 0;
        if (parts.length === 1) {
            const val = parseFloat(parts[0]);
            if (isNaN(val)) return null;
            return val * dir;
        }
        if (parts.length === 2) {
            deg = parseFloat(parts[0]);
            min = parseFloat(parts[1]);
            if (isNaN(deg) || isNaN(min)) return null;
        } else {
            deg = parseFloat(parts[0]);
            min = parseFloat(parts[1]);
            sec = parseFloat(parts[2]);
            if (isNaN(deg) || isNaN(min) || isNaN(sec)) return null;
        }
        const dec = Math.abs(deg) + (Math.abs(min) / 60) + (Math.abs(sec) / 3600);
        const signed = dec * (deg < 0 ? -1 : 1) * dir;
        if (isLongitude && Math.abs(signed) > 180) return null;
        if (!isLongitude && Math.abs(signed) > 90) return null;
        return signed;
    }

