class AudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.soundEffects = {};
        this.isBackgroundMusicReady = false;
        this.backgroundMusicVolume = 1;
        this.soundEffectsVolume = 1;
    }

    loadBackgroundMusic(src) {
        this.backgroundMusic = new Audio(src);
        this.backgroundMusic.loop = true;
        this.isBackgroundMusicReady = true;
        this.setBackgroundMusicVolume(this.backgroundMusicVolume);
    }

    loadSoundEffect(name, src) {
        this.soundEffects[name] = new Audio(src);
        this.setSoundEffectVolume(name, this.soundEffectsVolume);
    }

    playBackgroundMusic() {
        if (this.isBackgroundMusicReady && this.backgroundMusic) {
            this.backgroundMusic.play().catch(error => {
                console.log("Autoplay prevented. Music will start on user interaction.");
            });
        }
    }

    playSoundEffect(name) {
        if (this.soundEffects[name]) {
            const sound = this.soundEffects[name].cloneNode();
            this.setSoundEffectVolume(name, this.soundEffectsVolume);
            sound.play().catch(error => {
                console.log(`Error playing sound effect ${name}:`, error);
            });
        }
    }

    setBackgroundMusicVolume(volume) {
        this.backgroundMusicVolume = this.clampVolume(volume);
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.backgroundMusicVolume;
        }
    }

    setSoundEffectsVolume(volume) {
        this.soundEffectsVolume = this.clampVolume(volume);
        Object.keys(this.soundEffects).forEach(name => {
            this.setSoundEffectVolume(name, this.soundEffectsVolume);
        });
    }

    setSoundEffectVolume(name, volume) {
        if (this.soundEffects[name]) {
            this.soundEffects[name].volume = this.clampVolume(volume);
        }
    }

    clampVolume(volume) {
        return Math.max(0, Math.min(1, Number(volume) || 0));
    }
}