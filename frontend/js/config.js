// Configuration and Constants
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

// Category emoji icons mapping
const CATEGORY_ICONS = {
    'طائرات مسيرة': '🛸',
    'طائرات حربية': '✈️',
    'صواريخ': '🚀',
    'انفجارات': '💥',
    'اشتباكات مسلحة': '⚔️',
    'قصف مدفعي': '💣',
    'حركة عسكرية': '🎖️',
    'أخرى': '📍'
};
