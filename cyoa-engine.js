class CYOAEngine {
    constructor() {
        this.story = null;
        this.saveData = {};
        this.currentPage = null;
        this.userId = this.getUserId();
        this.audioManager = new AudioManager();
        this.history = [];
        this.backButton = document.getElementById('backButton');
        this.setupBackButton();
        this.setupSaveLoadButton();
        this.setupAudioStartButton();
        console.log('CYOAEngine initialized');
    }

    getUserId() {
        let id = localStorage.getItem('cyoa_user_id');
        if (!id) {
            id = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cyoa_user_id', id);
        }
        return id;
    }

    async loadStory(storyFile) {
        const response = await fetch(storyFile);
        this.story = await response.json();
        this.loadSaveData();
        this.currentPage = this.saveData.currentPage || this.story.startPage;
        this.renderPage();

        // Load audio assets
        if (this.story.audio) {
            if (this.story.audio.backgroundMusic) {
                this.audioManager.loadBackgroundMusic(this.story.audio.backgroundMusic);
                this.audioManager.playBackgroundMusic();
            }
            if (this.story.audio.soundEffects) {
                Object.entries(this.story.audio.soundEffects).forEach(([name, src]) => {
                    this.audioManager.loadSoundEffect(name, src);
                });
            }
        }
    }

    setupSaveLoadButton() {
        const saveLoadButton = document.querySelector('.button-bar button[title="Save"]');
        const popup = document.getElementById('saveLoadPopup');
        const closePopup = document.getElementById('closePopup');
        const saveButton = document.getElementById('saveButton');
        const loadButton = document.getElementById('loadButton');
        const downloadButton = document.getElementById('downloadSaveButton');
        const uploadInput = document.getElementById('uploadSaveInput');

        saveLoadButton.addEventListener('click', () => {
            popup.style.display = 'block';
        });

        closePopup.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        saveButton.addEventListener('click', () => {
            this.saveGame();
            alert('Game saved successfully!');
        });

        loadButton.addEventListener('click', () => {
            this.loadGame();
            popup.style.display = 'none';
        });

        downloadButton.addEventListener('click', () => {
            this.downloadSaveFile();
        });

        uploadInput.addEventListener('change', (event) => {
            this.uploadSaveFile(event.target.files[0]);
        });
    }

    saveGame() {
        const saveData = {
            currentPage: this.currentPage,
            history: this.history,
            customData: this.saveData
        };
        localStorage.setItem(`cyoa_save_${this.userId}`, JSON.stringify(saveData));
    }

    loadGame() {
        this.loadSaveData();
        this.renderPage();
    }

    loadSaveData() {
        const savedData = localStorage.getItem(`cyoa_save_${this.userId}`);
        if (savedData) {
            this.loadSaveDataFromJSON(savedData);
        } else {
            this.resetToInitialState();
        }
    }

    loadSaveDataFromJSON(jsonData) {
        const parsedData = JSON.parse(jsonData);
        this.saveData = parsedData.customData || {};
        this.history = parsedData.history || [];
        this.currentPage = parsedData.currentPage || this.story.startPage;
    }

    resetToInitialState() {
        this.saveData = {};
        this.history = [];
        this.currentPage = this.story.startPage;
    }

    downloadSaveFile() {
        const saveData = {
            currentPage: this.currentPage,
            history: this.history,
            customData: this.saveData
        };
        const dataStr = JSON.stringify(saveData);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'cyoa_save.json';

        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    uploadSaveFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = e.target.result;
                this.loadSaveDataFromJSON(jsonData);
                this.renderPage();
                alert('Game loaded successfully!');
            } catch (error) {
                console.error('Error loading save file:', error);
                alert('Error loading save file. Please ensure it\'s a valid save file.');
            }
        };
        reader.readAsText(file);
    }

    setupBackButton() {
        (this.backButton)
        this.backButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.goBack();
        });
    }

    updateBackButtonState() {
        if (this.backButton) {
            if (this.history.length > 0) {
                this.backButton.removeAttribute('disabled');
            } else {
                this.backButton.setAttribute('disabled', 'disabled');
            }
        }
    }

    setupAudioStartButton() {
        const startButton = document.createElement('button');
        startButton.textContent = 'Start Background Music';
        startButton.style.position = 'fixed';
        startButton.style.bottom = '20px';
        startButton.style.right = '20px';
        startButton.style.zIndex = '1000';

        startButton.addEventListener('click', () => {
            this.audioManager.playBackgroundMusic();
            startButton.remove();
        });

        document.body.appendChild(startButton);
    }

    renderPage() {
        const page = this.story.pages[this.currentPage];
        const container = document.getElementById('cyoa-container');
        container.innerHTML = '';

        // Render text
        const textDiv = document.createElement('div');
        textDiv.className = 'story-text';
        textDiv.innerHTML = this.parseText(page.text);
        container.appendChild(textDiv);

        // Render speech boxes
        if (page.speechBoxes) {
            page.speechBoxes.forEach(speechBox => {
                const speechBoxElement = this.createSpeechBox(speechBox);
                container.appendChild(speechBoxElement);
            });
        }

        // Render images
        if (page.images) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            page.images.forEach(image => {
                if (this.checkCondition(image.condition)) {
                    const img = document.createElement('img');
                    img.src = image.src;
                    img.alt = image.alt || '';
                    img.className = 'story-image';
                    imageContainer.appendChild(img);
                }
            });
            container.appendChild(imageContainer);
        }

        // Render buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        if (page.buttons) {
            page.buttons.forEach(button => {
                // Skip rendering the back button
                if (button.text.toLowerCase() !== 'back' && this.checkCondition(button.condition)) {
                    const btn = document.createElement('button');
                    btn.textContent = button.text;
                    btn.onclick = () => this.handleChoice(button.nextPage, button.effect);
                    buttonContainer.appendChild(btn);
                }
            });
        }
        container.appendChild(buttonContainer);

        // Render text inputs
        if (page.inputs) {
            const inputContainer = document.createElement('div');
            inputContainer.className = 'input-container';
            page.inputs.forEach(input => {
                if (this.checkCondition(input.condition)) {
                    const inputElement = document.createElement('input');
                    inputElement.type = 'text';
                    inputElement.placeholder = input.placeholder;
                    inputElement.value = this.saveData[input.variable] || '';
                    inputElement.onchange = (e) => this.handleInput(input.variable, e.target.value);
                    inputContainer.appendChild(inputElement);
                }
            });
            container.appendChild(inputContainer);
        }

        this.saveGame();
        this.updateBackButtonState();

        // Play sound effect if specified
        if (page.audio && this.audioManager) {
            try {
                this.audioManager.playSoundEffect(page.audio);
            } catch (error) {
                console.error('Error playing sound effect:', error);
            }
        }
    }



    parseText(text) {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    createSpeechBox(speechBox) {
        const character = this.story.characters[speechBox.character];
        const speechBoxElement = document.createElement('div');
        speechBoxElement.className = 'speech-box';
        speechBoxElement.style.borderColor = character.color;

        const characterImage = document.createElement('img');
        characterImage.src = character.imageSrc;
        characterImage.alt = character.name;
        characterImage.className = 'character-image';

        const textContent = document.createElement('div');
        textContent.className = 'speech-content';
        textContent.innerHTML = `<strong>${character.name}:</strong> ${this.parseText(speechBox.text)}`;

        speechBoxElement.appendChild(characterImage);
        speechBoxElement.appendChild(textContent);

        return speechBoxElement;
    }

    checkCondition(condition) {
        if (!condition) return true;

        const operators = {
            '==': (a, b) => a == b,
            '!=': (a, b) => a != b,
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            'AND': (a, b) => a && b,
            'OR': (a, b) => a || b
        };

        const parseCondition = (cond) => {
            for (let op in operators) {
                if (cond.includes(op)) {
                    const [left, right] = cond.split(op).map(s => s.trim());
                    const leftValue = left.startsWith('$') ? this.saveData[left.slice(1)] : left;
                    const rightValue = right.startsWith('$') ? this.saveData[right.slice(1)] : right;
                    return operators[op](leftValue, rightValue);
                }
            }
            return cond.startsWith('$') ? Boolean(this.saveData[cond.slice(1)]) : Boolean(cond);
        };

        return condition.split(' AND ').every(subCond =>
            subCond.split(' OR ').some(parseCondition)
        );
    }

    handleChoice(nextPage, effect) {

        this.history.push({
            page: this.currentPage,
            saveData: JSON.parse(JSON.stringify(this.saveData))
        });

        if (effect) {
            try {
                eval(effect.replace(/\$(\w+)/g, 'this.saveData.$1'));
            } catch (error) {
                console.error('Error evaluating effect:', error);
            }
        }
        this.currentPage = nextPage;
        this.renderPage();
        this.updateBackButtonState();
    }

    goBack() {
        if (this.history.length > 0) {
            const previousState = this.history.pop();
            this.currentPage = previousState.page;
            this.saveData = previousState.saveData;
            this.renderPage();
            this.updateBackButtonState();
        }
    }

    handleInput(variable, value) {
        this.saveData[variable] = value;
    }

    handleInput(variable, value) {
        this.saveData[variable] = value;
        this.saveGame();
    }

    parseText(text) {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    checkCondition(condition) {
        if (!condition) return true;
        return eval(condition.replace(/\$(\w+)/g, 'this.saveData.$1'));
    }

    animatePageTransition() {
        const container = document.getElementById('cyoa-container');
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        setTimeout(() => {
            //container.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Usage
const engine = new CYOAEngine();

window.onload = async () => {
    console.log('Window loaded, initializing story');
    await engine.loadStory('story.json');
};
