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
    const adminBtn = document.getElementById('adminBtn');

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
        toggleAdminButton();
    } else {
        if (userInfo && authButtons) {
            userInfo.classList.add('hidden');
            authButtons.classList.remove('hidden');
        }
        if (adminBtn) {
            adminBtn.style.display = 'none';
        }
    }
}

function toggleAdminButton(){
    const btn = document.getElementById('adminBtn');
    if(!btn) return;
    const token = getToken();
    if(!token){ btn.style.display = 'none'; return; }
    fetchWithAuth(API_URL + '/auth/me')
        .then(function(resp){ return resp.ok ? resp.json() : Promise.reject(); })
        .then(function(user){
            const isAdminNow = !!(user && user.is_admin);
            btn.style.display = isAdminNow ? 'inline-flex' : 'none';
            const img = btn.querySelector('img');
            if(img) img.style.filter = isAdminNow ? 'invert(1)' : '';
        })
        .catch(function(){ btn.style.display = 'none'; });
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
window.toggleAdminButton = toggleAdminButton;
