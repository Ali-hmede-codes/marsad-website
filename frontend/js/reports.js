// Reports management
let allReports = [];
let categories = [];

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
        const response = await fetch(`${window.API_URL}/categories`);
        const data = await response.json();
        categories = data;

        // Populate filter dropdown
        const filterSelect = document.getElementById('categoryFilter');
        const reportCategorySelect = document.getElementById('reportCategory');

        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">جميع الفئات</option>';
            data.forEach(parent => {
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
            data.forEach(parent => {
                const option = document.createElement('option');
                option.value = parent.catg_id;
                option.textContent = parent.catg_name;
                mainFilterSelect.appendChild(option);
            });

            const populateFilterChildren = (parentId) => {
                if (!filterSelect) return;
                if (!parentId) {
                    filterSelect.innerHTML = '<option value="">جميع الفئات</option>';
                    data.forEach(parent => {
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
                const parent = data.find(p => String(p.catg_id) === String(parentId));
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
            data.forEach(parent => {
                const option = document.createElement('option');
                option.value = parent.catg_id;
                option.textContent = parent.catg_name;
                reportMainCategorySelect.appendChild(option);
            });

            const populateChildren = (parentId) => {
                reportCategorySelect.innerHTML = '<option value="">اختر الفئة</option>';
                const parent = data.find(p => String(p.catg_id) === String(parentId));
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

        const response = await fetch(url);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'فشل تحميل التقارير');
        }
        const data = await response.json();
        allReports = Array.isArray(data) ? data : [];

        if (window.updateMapMarkers) {
            try {
                window.updateMapMarkers(allReports);
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
    const category = categories.find(cat => cat.catg_id == categoryId);
    return category ? category.catg_name : 'غير معروف';
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
            <p><strong>الموقع:</strong> ${report.report_address}</p>
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
    const parts = address.split(',');
    return parts[0] ? parts[0].trim() : address;
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
    const filtered = allReports.filter(r => {
        const d = new Date(r.date_and_time);
        return formatDateISO(d) === dateStr;
    });
    filtered.forEach(r => {
        const tr = document.createElement('tr');
        const time = new Date(r.date_and_time).toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit' });
        const typeName = r.category_name || getCategoryName(r.categorie);
        const city = extractCity(r.report_address);
        tr.innerHTML = `<td>${time}</td><td><span style="display:inline-flex;align-items:center;gap:6px;">\
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\
                <path d="M12 2c4 0 7 3 7 7 0 6-7 13-7 13s-7-7-7-13c0-4 3-7 7-7z"></path>\
                <circle cx="12" cy="9" r="2" fill="currentColor"></circle>\
            </svg> ${typeName}</span></td><td>${city}</td>`;
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
    if (latManualElInit) latManualElInit.addEventListener('input', syncAddressRequirement);
    if (lngManualElInit) lngManualElInit.addEventListener('input', syncAddressRequirement);
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

            const reportData = {
                latitude,
                longitude,
                category: document.getElementById('reportCategory').value,
                report_address: document.getElementById('reportAddress').value,
                is_manual_location: isManual
            };

            const result = await createReport(reportData);

            if (result.success) {
                showNotification('تم إنشاء التقرير بنجاح', 'success');
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
            let city = addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || addr.county || '';
            if (!city) {
                const name = data && data.display_name ? data.display_name : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                city = extractCity(name);
            }
            if (addressInput) addressInput.value = city || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (e) {}
    }, 600, true);

    if (latManualElInit) latManualElInit.addEventListener('input', () => { syncAddressRequirement(); if (locationMode === 'manual') updateFromManualDebounced(); });
    if (lngManualElInit) lngManualElInit.addEventListener('input', () => { syncAddressRequirement(); if (locationMode === 'manual') updateFromManualDebounced(); });

    if (tabs) {
        const autoBtn = tabs.querySelector('[data-mode="auto"]');
        const manualBtn = tabs.querySelector('[data-mode="manual"]');
        const setMode = (mode) => {
            if (mode === 'manual' && !(isAdmin && isAdmin())) {
                if (window.showNotification) window.showNotification('الوضع اليدوي للمدراء فقط', 'error');
                return;
            }
            locationMode = mode;
            if (autoBtn) autoBtn.classList.toggle('active', mode === 'auto');
            if (manualBtn) manualBtn.classList.toggle('active', mode === 'manual');
            const admin = (isAdmin && isAdmin());
            if (autoGroup) autoGroup.classList.toggle('hidden', mode !== 'auto');
            if (manualGroup) manualGroup.classList.toggle('hidden', !(mode === 'manual' && admin));
            const searchBtn = document.getElementById('searchAddressBtn');
            const latManualEl = document.getElementById('reportLatManual');
            const lngManualEl = document.getElementById('reportLngManual');
            if (addressInput) {
                addressInput.readOnly = mode === 'manual';
                addressInput.placeholder = mode === 'manual' ? 'اسم المدينة (يُحدد تلقائياً)' : 'ابحث عن موقع أو أدخل العنوان يدوياً';
                addressInput.required = mode === 'auto';
                if (mode === 'manual' && addressInput.value) {
                    addressInput.value = extractCity(addressInput.value);
                }
            }
            if (searchBtn) {
                searchBtn.style.display = mode === 'manual' ? 'none' : '';
                searchBtn.disabled = mode === 'manual';
            }
            if (latManualEl) latManualEl.required = (mode === 'manual' && admin);
            if (lngManualEl) lngManualEl.required = (mode === 'manual' && admin);
            syncAddressRequirement();
            if (mode === 'manual') updateFromManualDebounced();
        };
        if (autoBtn) autoBtn.addEventListener('click', () => setMode('auto'));
        if (manualBtn) manualBtn.addEventListener('click', () => setMode('manual'));
        if (tabs) {
            tabs.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-mode]');
                if (!btn) return;
                const mode = btn.getAttribute('data-mode');
                setMode(mode === 'manual' ? 'manual' : 'auto');
            });
        }
        if (manualBtn && !(isAdmin && isAdmin())) {
            manualBtn.disabled = true;
            manualBtn.title = 'للمدراء فقط';
        }
        setMode('auto');
        window.setReportLocationMode = setMode;
    }
