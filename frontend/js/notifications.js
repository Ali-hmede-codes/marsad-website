// Custom Notification System

// Create container if it doesn't exist
function getNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Show a custom notification message
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', or 'info' (default)
 * @param {number} duration - Duration in ms (default 3000)
 */
function showNotification(message, type = 'info', duration = 4000) {
    const container = getNotificationContainer();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    let icon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="8"></line>
            <line x1="12" y1="12" x2="12" y2="16"></line>
        </svg>
    `;
    if (type === 'success') {
        icon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9 12l2 2 4-4"></path>
            </svg>
        `;
    }
    if (type === 'error') {
        icon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        `;
    }

    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;

    // Add to container
    container.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Close function
    const close = () => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => {
            if (notification.parentElement) {
                notification.remove();
            }
        });
    };

    // Close button click
    notification.querySelector('.notification-close').addEventListener('click', close);

    // Auto close
    if (duration > 0) {
        setTimeout(close, duration);
    }
}

// Expose globally
window.showNotification = showNotification;
