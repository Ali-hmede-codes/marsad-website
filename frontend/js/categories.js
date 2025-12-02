const API_URL = window.API_URL || 'http://localhost:3000/api';

// Check authentication - admin only
if (!isLoggedIn() || !isAdmin()) {
    alert('يجب أن تكون مديراً للوصول إلى هذه الصفحة');
    window.location.href = 'login.html';
}

let categories = [];
let editingCategoryId = null;

// Load categories on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', window.logout || logout);
    document.getElementById('addMainCategoryBtn').addEventListener('click', () => openCategoryModal());
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);

    // Color picker sync
    const colorPicker = document.getElementById('catg_color');
    const colorText = document.getElementById('catg_color_text');

    colorPicker.addEventListener('input', (e) => {
        colorText.value = e.target.value;
    });

    colorText.addEventListener('input', (e) => {
        if (/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(e.target.value)) {
            colorPicker.value = e.target.value.substring(0, 7); // Color input only supports 6-digit hex
        }
    });
}

// Load all categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to load categories');

        categories = await response.json();
        displayCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categoriesContainer').innerHTML = `
            <div class="text-center" style="color: var(--color-error); padding: 2rem;">
                حدث خطأ في تحميل الفئات
            </div>
        `;
    }
}

// Display categories in hierarchical format
function displayCategories() {
    const container = document.getElementById('categoriesContainer');

    if (categories.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted" style="padding: 2rem;">
                لا توجد فئات. ابدأ بإضافة فئة رئيسية.
            </div>
        `;
        return;
    }

    container.innerHTML = categories.map(category => renderCategory(category, 0)).join('');
}

// Render a single category and its children
function renderCategory(category, level) {
    const indent = level * 2;
    const hasChildren = category.children && category.children.length > 0;

    const roleText = {
        'user': 'مستخدم',
        'publisher': 'ناشر',
        'admin': 'مدير'
    };

    let html = `
        <div class="category-card" style="margin-right: ${indent}rem;">
            <div class="category-header">
                <div class="category-info">
                    <div class="category-color-badge" style="background-color: ${category.catg_color}"></div>
                    <div>
                        <h3 class="category-name">${category.catg_name}</h3>
                        ${category.categorie_desc ? `<p class="category-desc">${category.categorie_desc}</p>` : ''}
                        <div class="category-meta">
                            <span class="category-role-badge">${roleText[category.required_role] || category.required_role}</span>
                            ${level === 0 ? '<span class="category-type-badge">فئة رئيسية</span>' : '<span class="category-type-badge subcategory">فئة فرعية</span>'}
                        </div>
                    </div>
                </div>
                ${category.catg_picture ? `<img src="${category.catg_picture}" alt="${category.catg_name}" class="category-picture">` : ''}
            </div>
            <div class="category-actions">
                ${level === 0 ? `<button class="btn btn-sm btn-secondary" onclick="openCategoryModal(null, ${category.catg_id})">➕ إضافة فئة فرعية</button>` : ''}
                <button class="btn btn-sm btn-secondary" onclick="openCategoryModal(${category.catg_id})">✏️ تعديل</button>
                <button class="btn btn-sm btn-secondary" onclick="deleteCategory(${category.catg_id})" style="color: var(--color-error);">🗑️ حذف</button>
            </div>
        </div>
    `;

    // Render children
    if (hasChildren) {
        html += category.children.map(child => renderCategory(child, level + 1)).join('');
    }

    return html;
}

// Open modal for create/edit
function openCategoryModal(categoryId = null, parentId = null) {
    editingCategoryId = categoryId;
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const modalTitle = document.getElementById('modalTitle');

    // Reset form
    form.reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('parentId').value = '';
    document.getElementById('currentPicture').innerHTML = '';

    if (categoryId) {
        // Edit mode
        const category = findCategoryById(categoryId);
        if (!category) return;

        modalTitle.textContent = 'تعديل الفئة';
        document.getElementById('categoryId').value = category.catg_id;
        document.getElementById('catg_name').value = category.catg_name;
        document.getElementById('categorie_desc').value = category.categorie_desc || '';
        document.getElementById('catg_color').value = category.catg_color.substring(0, 7);
        document.getElementById('catg_color_text').value = category.catg_color;
        document.getElementById('required_role').value = category.required_role;

        if (category.catg_picture) {
            document.getElementById('currentPicture').innerHTML = `
                <img src="${category.catg_picture}" alt="Current" style="max-width: 200px; border-radius: 8px;">
            `;
        }
    } else if (parentId) {
        // Create subcategory mode
        modalTitle.textContent = 'إضافة فئة فرعية';
        document.getElementById('parentId').value = parentId;

        const parent = findCategoryById(parentId);
        if (parent) {
            document.getElementById('catg_color').value = parent.catg_color.substring(0, 7);
            document.getElementById('catg_color_text').value = parent.catg_color;
        }
    } else {
        // Create main category mode
        modalTitle.textContent = 'إضافة فئة رئيسية';
        document.getElementById('catg_color').value = '#000000';
        document.getElementById('catg_color_text').value = '#000000';
    }

    modal.classList.add('active');
}

// Close modal
function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
    editingCategoryId = null;
}

// Handle form submission
async function handleCategorySubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const categoryId = formData.get('categoryId');
    const parentId = formData.get('parentId');

    // Build request data
    const requestData = new FormData();
    requestData.append('catg_name', formData.get('catg_name'));
    requestData.append('categorie_desc', formData.get('categorie_desc'));
    requestData.append('catg_color', formData.get('catg_color_text'));
    requestData.append('required_role', formData.get('required_role'));

    if (parentId) {
        requestData.append('parent_id', parentId);
    }

    const pictureFile = formData.get('catg_picture');
    if (pictureFile && pictureFile.size > 0) {
        requestData.append('catg_picture', pictureFile);
    }

    try {
        let response;
        if (categoryId) {
            // Update existing category
            response = await fetchWithAuth(`${API_URL}/categories/${categoryId}`, {
                method: 'PUT',
                body: requestData
            });
        } else {
            // Create new category
            response = await fetchWithAuth(`${API_URL}/categories`, {
                method: 'POST',
                body: requestData
            });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'حدث خطأ');
        }

        const result = await response.json();
        alert(result.message || 'تم الحفظ بنجاح');
        closeCategoryModal();
        loadCategories();
    } catch (error) {
        console.error('Error saving category:', error);
        alert(error.message || 'حدث خطأ في حفظ الفئة');
    }
}

// Delete category
async function deleteCategory(categoryId) {
    const category = findCategoryById(categoryId);
    if (!category) return;

    if (!confirm(`هل أنت متأكد من حذف الفئة "${category.catg_name}"؟`)) {
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/categories/${categoryId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'حدث خطأ');
        }

        const result = await response.json();
        alert(result.message || 'تم الحذف بنجاح');
        loadCategories();
    } catch (error) {
        console.error('Error deleting category:', error);
        alert(error.message || 'حدث خطأ في حذف الفئة');
    }
}

// Helper function to find category by ID (recursive)
function findCategoryById(id, categoriesList = categories) {
    for (const category of categoriesList) {
        if (category.catg_id === id) {
            return category;
        }
        if (category.children && category.children.length > 0) {
            const found = findCategoryById(id, category.children);
            if (found) return found;
        }
    }
    return null;
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('categoryModal');
    if (event.target === modal) {
        closeCategoryModal();
    }
}
