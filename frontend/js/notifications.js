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

    // Icon based on type
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

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
