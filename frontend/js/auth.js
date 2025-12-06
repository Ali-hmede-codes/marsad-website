// Authentication utilities


// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined') return null;
    try { return JSON.parse(userStr); } catch (_) { return null; }
}

// Check if user is logged in
function isLoggedIn() {
    return !!getToken();
}

// Check if user is publisher
function isPublisher() {
    const user = getCurrentUser();
    return user && (user.is_publisher || user.is_admin);
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.is_admin;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Update UI based on auth status
function updateAuthUI() {
    const userInfo = document.getElementById('userInfo');
    const authButtons = document.getElementById('authButtons');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (userInfo && authButtons && userName) {
            userInfo.classList.remove('hidden');
            authButtons.classList.add('hidden');
            userName.textContent = `${user.name}`;

            if (logoutBtn) {
                logoutBtn.addEventListener('click', logout);
            }
        }
    } else {
        if (userInfo && authButtons) {
            userInfo.classList.add('hidden');
            authButtons.classList.remove('hidden');
        }
    }
}

// Make authenticated API request
async function fetchWithAuth(url, options = {}) {
    const token = getToken();

    if (!token) {
        throw new Error('لم تسجل الدخول');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
    }

    return response;
}

// Initialize auth on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
    updateAuthUI();
}

window.getToken = getToken;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.isPublisher = isPublisher;
window.isAdmin = isAdmin;
window.logout = logout;
window.updateAuthUI = updateAuthUI;
window.fetchWithAuth = fetchWithAuth;
