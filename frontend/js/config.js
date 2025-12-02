var API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : '/api';
window.API_URL = API_URL;

var CATEGORY_ICONS = {
    'طائرات مسيرة': '🛸',
    'طائرات حربية': '✈️',
    'صواريخ': '🚀',
    'انفجارات': '💥',
    'اشتباكات مسلحة': '⚔️',
    'قصف مدفعي': '💣',
    'حركة عسكرية': '🎖️',
    'أخرى': '📍'
};
window.CATEGORY_ICONS = CATEGORY_ICONS;
