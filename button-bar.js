document.addEventListener('DOMContentLoaded', function () {
    // Existing code for credits and save/load popups
    const creditsButton = document.querySelector('.button-bar button[title="Credits"]');
    const creditsPopup = document.getElementById('creditsPopup');
    const closeCreditsPopup = document.getElementById('closeCreditsPopup');
    const saveButton = document.querySelector('.button-bar button[title="Save"]');
    const saveLoadPopup = document.getElementById('saveLoadPopup');
    const closeSaveLoadPopup = document.getElementById('closePopup');

    // New code for settings popup
    const settingsButton = document.querySelector('.button-bar button[title="Settings"]');
    const settingsPopup = document.getElementById('settingsPopup');
    const closeSettingsPopup = document.getElementById('closeSettingsPopup');
    const bgmVolumeSlider = document.getElementById('bgmVolume');
    const sfxVolumeSlider = document.getElementById('sfxVolume');

    // Function to show popup
    function showPopup(popup) {
        popup.style.display = 'block';
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
    }

    // Function to hide popup
    function hidePopup(popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
    }

    // Event listeners for credits popup
    creditsButton.addEventListener('click', () => showPopup(creditsPopup));
    closeCreditsPopup.addEventListener('click', () => hidePopup(creditsPopup));

    // Event listeners for save/load popup
    saveButton.addEventListener('click', () => showPopup(saveLoadPopup));
    closeSaveLoadPopup.addEventListener('click', () => hidePopup(saveLoadPopup));

    // Event listeners for settings popup
    settingsButton.addEventListener('click', () => showPopup(settingsPopup));
    closeSettingsPopup.addEventListener('click', () => hidePopup(settingsPopup));

    // Audio volume control
    bgmVolumeSlider.addEventListener('input', (e) => {
        if (engine && engine.audioManager) {
            engine.audioManager.setBackgroundMusicVolume(parseFloat(e.target.value));
        }
    });

    sfxVolumeSlider.addEventListener('input', (e) => {
        if (engine && engine.audioManager) {
            engine.audioManager.setSoundEffectsVolume(parseFloat(e.target.value));
        }
    });

    // Close popups when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target === creditsPopup) {
            hidePopup(creditsPopup);
        }
        if (event.target === saveLoadPopup) {
            hidePopup(saveLoadPopup);
        }
        if (event.target === settingsPopup) {
            hidePopup(settingsPopup);
        }
    });



    const themeButton = document.querySelector('.button-bar button[title="Theme"]');
    const themes = ['default', 'solar', 'dark', 'colorful', 'clear'];
    let currentThemeIndex = 0;

    // Create theme notification element
    const themeNotification = document.createElement('div');
    themeNotification.id = 'themeNotification';
    document.body.appendChild(themeNotification);

    function showThemeNotification(themeName) {
        themeNotification.textContent = `Theme: ${themeName}`;
        themeNotification.classList.add('show');
        setTimeout(() => {
            themeNotification.classList.remove('show');
        }, 3000);
    }

    // Function to get base HSL values for each theme
    function getThemeBaseHSL(theme) {
        switch (theme) {
            case 'default': return [195, 50, 95]; // Light blue
            case 'solar': return [48, 100, 95];   // Light yellow
            case 'dark': return [0, 0, 10];       // Nearly black
            case 'colorful': return [280, 50, 95]; // Light purple
            case 'clear': return [0, 0, 90];      // White
            default: return [0, 0, 95];            // Light grey
        }
    }

    // Animate background color change
    let hueOffset = 0;
    function animateBackground() {
        const [baseH, baseS, baseL] = getThemeBaseHSL(themes[currentThemeIndex]);
        hueOffset = (hueOffset + 1) % 360;
        const newHue = (baseH + hueOffset) % 360;
        document.body.style.backgroundColor = `hsl(${newHue}, ${baseS}%, ${baseL}%)`;
        setTimeout(() => requestAnimationFrame(animateBackground), 200); // Match the original 200ms interval
    }

    function cycleTheme() {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const newTheme = themes[currentThemeIndex];
        document.body.className = newTheme;
        localStorage.setItem('theme', newTheme);
        showThemeNotification(newTheme.charAt(0).toUpperCase() + newTheme.slice(1));
        // Reset hue offset when theme changes
        hueOffset = 0;
    }

    // Set initial theme from localStorage or default
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        currentThemeIndex = themes.indexOf(savedTheme);
    }

    themeButton.addEventListener('click', cycleTheme);

    // Start the background animation
    animateBackground();
});