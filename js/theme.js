// Theme Management - Indian Festival Theme

const themes = [
    { id: 'earthy-terracotta', name: 'Indian Festival', icon: '🪔' }
];

const ThemeManager = {
    currentTheme: 'earthy-terracotta',

    init() {
        // Always use Indian Festival theme
        this.setTheme('earthy-terracotta');
    },

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('kondappaliTheme', theme);
    }
};

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});
