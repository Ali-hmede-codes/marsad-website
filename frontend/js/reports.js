// Reports management
let allReports = [];
let categories = [];

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json();
        categories = data;

        // Populate filter dropdown
        const filterSelect = document.getElementById('categoryFilter');
        const reportCategorySelect = document.getElementById('reportCategory');

        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">جميع الفئات</option>';
            data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.catg_id;
                option.textContent = cat.catg_name;
                filterSelect.appendChild(option);
            });
        }

        if (reportCategorySelect) {
            reportCategorySelect.innerHTML = '<option value="">اختر الفئة</option>';
            data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.catg_id;
                option.textContent = cat.catg_name;
                reportCategorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load reports
async function loadReports(categoryFilter = '') {
    try {
        let url = `${API_URL}/reports?limit=500`;
        if (categoryFilter) {
            url += `&category=${categoryFilter}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        allReports = data;

        // Update map markers
        if (window.updateMapMarkers) {
            window.updateMapMarkers(allReports);
        }

        return allReports;
    } catch (error) {
        console.error('Error loading reports:', error);
        return [];
    }
}

// Create new report
async function createReport(reportData) {
    try {
        const response = await fetchWithAuth(`${API_URL}/reports`, {
            method: 'POST',
            body: JSON.stringify(reportData)
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
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

    detailsDiv.innerHTML = `
        <div class="report-detail">
            <h3>${report.category_name || getCategoryName(report.categorie)}</h3>
            <p><strong>الموقع:</strong> ${report.report_address}</p>
            <p><strong>التاريخ والوقت:</strong> ${formattedDate}</p>
            <p><strong>الإحداثيات:</strong> ${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}</p>
            ${report.description ? `<p><strong>الوصف:</strong> ${report.description}</p>` : ''}
            ${report.reporter_name ? `<p><strong>المبلغ:</strong> ${report.reporter_name}</p>` : ''}
        </div>
    `;

    modal.style.display = 'block';
}

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

    // Report form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!isPublisher()) {
                alert('يجب أن تكون ناشراً لإنشاء تقرير');
                return;
            }

            const reportData = {
                latitude: document.getElementById('reportLat').value,
                longitude: document.getElementById('reportLng').value,
                category: document.getElementById('reportCategory').value,
                description: document.getElementById('reportDescription').value,
                report_address: document.getElementById('reportAddress').value
            };

            const result = await createReport(reportData);

            if (result.success) {
                alert('تم إنشاء التقرير بنجاح');
                document.getElementById('reportModal').style.display = 'none';
                reportForm.reset();
                loadReports();
            } else {
                alert(result.error || 'حدث خطأ في إنشاء التقرير');
            }
        });
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('reportModal').style.display = 'none';
        });
    }

    // Close modals
    const closeButtons = document.querySelectorAll('.close, .close-details');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const reportModal = document.getElementById('reportModal');
        const detailsModal = document.getElementById('detailsModal');

        if (e.target === reportModal) {
            reportModal.style.display = 'none';
        }
        if (e.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });
});
