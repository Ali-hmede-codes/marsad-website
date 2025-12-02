// Reports management
let allReports = [];
let categories = [];


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
        const data = await response.json();
        allReports = data;

        // Update map markers
        if (window.updateMapMarkers) {
            window.updateMapMarkers(allReports);
        }

        const dailyInputEl = document.getElementById('dailyDate');
        const dateStr = dailyInputEl ? dailyInputEl.value : formatDateISO(new Date());
        renderDailyReportsForDate(dateStr);

        return allReports;
    } catch (error) {
        console.error('Error loading reports:', error);
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
        refreshBtn.addEventListener('click', () => {
            const filter = categoryFilter ? categoryFilter.value : '';
            loadReports(filter);
        });
    }

    const refreshDailyBtn = document.getElementById('refreshDailyBtn');
    if (refreshDailyBtn) {
        refreshDailyBtn.addEventListener('click', () => {
            const filter = categoryFilter ? categoryFilter.value : '';
            loadReports(filter);
        });
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

            const reportData = {
                latitude: document.getElementById('reportLat').value,
                longitude: document.getElementById('reportLng').value,
                category: document.getElementById('reportCategory').value,
                report_address: document.getElementById('reportAddress').value
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
    setTimeout(() => {
        const filterSelect = document.getElementById('categoryFilter');
        const filter = filterSelect ? filterSelect.value : '';
        loadReports(filter);
        scheduleMidnightRefresh();
    }, ms);
}

document.addEventListener('DOMContentLoaded', () => {
    scheduleMidnightRefresh();
});
});
