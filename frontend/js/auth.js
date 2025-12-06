// Authentication utilities


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
    return !!getCurrentUser() || localStorage.getItem('logged_in') === '1';
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
async function logout() {
    try { await fetch(API_URL + '/auth/logout', { method: 'POST', credentials: 'include' }); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('logged_in');
    window.location.href = '/';
}

function sanitizeStoredUser() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined') return;
        const u = JSON.parse(userStr);
        if (!u || typeof u !== 'object') { localStorage.removeItem('user'); return; }
        const compact = { is_admin: !!u.is_admin, is_publisher: !!u.is_publisher };
        localStorage.setItem('user', JSON.stringify(compact));
    } catch (_) { localStorage.removeItem('user'); }
}

async function updateAuthUI() {
    const userInfo = document.getElementById('userInfo');
    const authButtons = document.getElementById('authButtons');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminBtn = document.getElementById('adminBtn');

    try {
        const resp = await fetch(API_URL + '/auth/me', { credentials: 'include' });
        if (resp && resp.ok) {
            const user = await resp.json();
            if (userInfo && authButtons) {
                userInfo.classList.remove('hidden');
                authButtons.classList.add('hidden');
            }
            if (logoutBtn) {
                logoutBtn.addEventListener('click', logout);
            }
            if (userName) {
                userName.textContent = user && user.name ? String(user.name) : '';
            }
            const compact = { is_admin: !!(user && user.is_admin), is_publisher: !!(user && user.is_publisher) };
            localStorage.setItem('user', JSON.stringify(compact));
            localStorage.setItem('logged_in', '1');
            if (adminBtn) {
                adminBtn.style.display = compact.is_admin ? 'inline-flex' : 'none';
                const img = adminBtn.querySelector('img');
                if (img) img.style.filter = compact.is_admin ? 'invert(1)' : '';
            }
            return;
        }
    } catch (_) {}
    if (userInfo && authButtons) {
        userInfo.classList.add('hidden');
        authButtons.classList.remove('hidden');
    }
    if (adminBtn) {
        adminBtn.style.display = 'none';
    }
    if (userName) {
        userName.textContent = '';
    }
    localStorage.removeItem('logged_in');
}

function toggleAdminButton(){
    const btn = document.getElementById('adminBtn');
    if(!btn) return;
    fetch(API_URL + '/auth/me', { credentials: 'include' })
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
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers, credentials: 'include' });
    return response;
}

// Initialize auth on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ sanitizeStoredUser(); updateAuthUI(); });
} else {
    sanitizeStoredUser();
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
