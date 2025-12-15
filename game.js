class Game {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.maxLevel = 20;
        this.levelRequirements = this.calculateLevelRequirements();
        this.leaderboard = [];
        this.backgrounds = GAME_CONFIG.backgrounds;
        this.currentBackground = 0;
        this.isSoundEnabled = true;
        this.currentBackground = 0;
        this.isSoundEnabled = true;
        this.allBackgroundsUnlocked = false;
        this.tg = window.Telegram?.WebApp;
        this.username = this.tg?.initDataUnsafe?.user?.username || 'Снюсоед';
        this.tg?.expand(); // Expand to full height

        // DOM элементы
        this.mainMenu = document.getElementById('main-menu');
        this.gameScreen = document.getElementById('game-screen');
        this.leaderboardScreen = document.getElementById('leaderboard');
        this.inviteModal = document.getElementById('invite-modal');
        this.backgroundModal = document.getElementById('background-modal');

        // Кнопки
        this.startBtn = document.getElementById('start-btn');
        this.leaderboardBtn = document.getElementById('leaderboard-btn');
        this.inviteBtn = document.getElementById('invite-btn');
        this.backToMenuBtn = document.getElementById('back-to-menu');
        this.closeInviteBtn = document.getElementById('close-invite');
        this.copyLinkBtn = document.getElementById('copy-link');
        this.backgroundBtn = document.getElementById('background-btn');
        this.closeBackgroundBtn = document.getElementById('close-background');
        this.promoBtn = document.getElementById('promo-btn');
        this.backToMenuFromGameBtn = document.getElementById('back-to-menu-from-game');
        this.soundToggleBtn = document.getElementById('sound-toggle');

        // Игровые элементы
        this.snus = document.getElementById('snus');
        this.currentScoreElement = document.getElementById('current-score');
        this.currentLevelElement = document.getElementById('current-level');
        this.levelRequirementElement = document.getElementById('level-requirement');
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.inviteLink = document.getElementById('invite-link');
        this.progressBar = document.getElementById('progress-bar');
        this.backgroundGrid = document.getElementById('background-grid');
        this.promoInput = document.getElementById('promo-input');

        // Аудио
        this.clickSound = document.getElementById('click-sound');
        this.levelUpSound = document.getElementById('level-up-sound');
        this.menuSound = document.getElementById('menu-sound');

        // Настройка громкости звуков
        this.clickSound.volume = 1.0;
        this.levelUpSound.volume = 1.0;
        this.menuSound.volume = 0.4; // Уменьшаем громкость звуков меню до 40%

        this.initializeEventListeners();
        this.loadLeaderboard();
        this.initializeBackgrounds();
    }

    calculateLevelRequirements() {
        const requirements = [];
        let base = 10; // Начинаем с 10 кликов
        for (let i = 1; i <= this.maxLevel; i++) {
            requirements.push(base);
            base = base + 20; // Каждый следующий уровень требует на 20 кликов больше
        }
        return requirements;
    }


    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        this.inviteBtn.addEventListener('click', () => this.showInviteModal());
        this.backToMenuBtn.addEventListener('click', () => this.showMainMenu());
        this.closeInviteBtn.addEventListener('click', () => this.hideInviteModal());
        this.copyLinkBtn.addEventListener('click', () => this.copyInviteLink());
        this.snus.addEventListener('click', () => this.handleSnusClick());
        this.backgroundBtn.addEventListener('click', () => this.showBackgroundModal());
        this.closeBackgroundBtn.addEventListener('click', () => this.hideBackgroundModal());
        this.promoBtn.addEventListener('click', () => this.checkPromoCode());
        this.backToMenuFromGameBtn.addEventListener('click', () => this.showMainMenu());
        this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
    }

    initializeBackgrounds() {
        this.backgroundGrid.innerHTML = '';
        this.backgrounds.forEach((bg, index) => {
            const item = document.createElement('div');
            item.className = `background-item ${this.isBackgroundLocked(index) ? 'locked' : ''}`;
            item.style.background = bg.css;
            if (!this.isBackgroundLocked(index)) {
                item.addEventListener('click', () => this.changeBackground(index));
            }
            this.backgroundGrid.appendChild(item);
        });
    }

    showBackgroundModal() {
        this.playAudio(this.menuSound);
        this.backgroundModal.classList.add('active');
        this.initializeBackgrounds();
    }

    hideBackgroundModal() {
        this.playAudio(this.menuSound);
        this.backgroundModal.classList.remove('active');
    }

    changeBackground(index) {
        this.currentBackground = index;
        const background = this.backgrounds[index];

        // Определяем контрастный цвет для волн
        const gradientColors = background.css.match(/linear-gradient\([^,]+,([^,]+),([^)]+)\)/);
        if (gradientColors) {
            const color1 = this.hexToRgb(gradientColors[1].trim());
            const color2 = this.hexToRgb(gradientColors[2].trim());

            // Находим средний цвет
            const avgColor = {
                r: Math.floor((color1.r + color2.r) / 2),
                g: Math.floor((color1.g + color2.g) / 2),
                b: Math.floor((color1.b + color2.b) / 2)
            };

            // Инвертируем цвет и добавляем прозрачность
            const invertedColor = {
                r: 255 - avgColor.r,
                g: 255 - avgColor.g,
                b: 255 - avgColor.b
            };

            // Увеличиваем контрастность
            const contrastColor = {
                r: Math.max(0, Math.min(255, invertedColor.r * 2.5)),
                g: Math.max(0, Math.min(255, invertedColor.g * 2.5)),
                b: Math.max(0, Math.min(255, invertedColor.b * 2.5))
            };

            document.documentElement.style.setProperty('--ripple-color',
                `rgba(${contrastColor.r}, ${contrastColor.g}, ${contrastColor.b}, 1)`);
        }

        // Плавно меняем фон
        document.body.style.background = background.css;

        this.hideBackgroundModal();
    }

    hexToRgb(hex) {
        // Удаляем # если он есть
        hex = hex.replace('#', '');

        // Если это короткая запись цвета, расширяем её
        if (hex.length === 3) {
            hex = hex.split('').map(h => h + h).join('');
        }

        // Преобразуем в RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return { r, g, b };
    }

    startGame() {
        this.playAudio(this.menuSound);
        this.mainMenu.classList.remove('active');
        this.gameScreen.classList.add('active');
        this.updateUI();
    }

    showLeaderboard() {
        this.playAudio(this.menuSound);
        this.mainMenu.classList.remove('active');
        this.leaderboardScreen.classList.add('active');
        this.updateLeaderboard();
    }

    showMainMenu() {
        this.playAudio(this.menuSound);
        this.gameScreen.classList.remove('active');
        this.leaderboardScreen.classList.remove('active');
        this.mainMenu.classList.add('active');
    }

    showInviteModal() {
        this.playAudio(this.menuSound);
        this.inviteModal.classList.add('active');
        this.inviteLink.value = window.location.href;
    }

    hideInviteModal() {
        this.playAudio(this.menuSound);
        this.inviteModal.classList.remove('active');
    }

    copyInviteLink() {
        this.inviteLink.select();
        document.execCommand('copy');
        this.copyLinkBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            this.copyLinkBtn.textContent = 'Копировать';
        }, 2000);
    }

    handleSnusClick() {
        this.playAudio(this.clickSound);

        this.score++;

        // Активируем анимацию волн
        const clickEffect = document.querySelector('.click-effect');
        clickEffect.classList.remove('active');
        // Принудительно перезапускаем анимацию
        void clickEffect.offsetWidth;
        clickEffect.classList.add('active');

        // Проверяем, достигли ли мы требования для следующего уровня
        if (this.score >= this.levelRequirements[this.level - 1]) {
            this.levelUp();
            // Сбрасываем счетчик очков при переходе на новый уровень
            this.score = 0;
        }

        this.updateUI();
    }

    levelUp() {
        if (this.level < this.maxLevel) {
            this.playAudio(this.levelUpSound);

            // Добавляем класс для анимации
            document.body.classList.add('level-up');

            // Удаляем класс после завершения анимации
            setTimeout(() => {
                document.body.classList.remove('level-up');
            }, 1000);

            this.level++;

            // Автоматически меняем фон на следующий доступный
            if (this.level <= this.backgrounds.length) {
                this.changeBackground(this.level - 1);
            }

            this.updateUI();
            this.initializeBackgrounds();
        } else {
            this.handleMaxLevel();
        }
    }

    handleMaxLevel() {
        // Здесь можно добавить специальную анимацию или эффект
        this.saveToLeaderboard();
    }

    updateUI() {
        this.currentScoreElement.textContent = Math.floor(this.score);
        this.currentLevelElement.textContent = this.level;
        this.levelRequirementElement.textContent = this.levelRequirements[this.level - 1];

        // Обновляем прогресс-бар
        const progress = (this.score / this.levelRequirements[this.level - 1]) * 100;
        this.progressBar.style.width = `${Math.min(progress, 100)}%`;

        // Update rank display
        const rankNames = ['Новичок', 'Любитель', 'Бывалый', 'Профи', 'Мастер', 'Легенда', 'Бог Снюса'];
        const rankIndex = Math.min(Math.floor((this.level - 1) / 3), rankNames.length - 1);
        document.getElementById('current-rank').textContent = rankNames[rankIndex];

        // Update header greeting if menu is active
        const menuHeader = document.querySelector('.menu h1');
        if (menuHeader && this.username !== 'Снюсоед') {
            menuHeader.textContent = `Привет, @${this.username}`;
        }
    }

    updateLeaderboard() {
        this.leaderboardList.innerHTML = '';
        this.leaderboard.sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .forEach((player, index) => {
                const rank = this.getRank(player.level);
                const playerElement = document.createElement('div');
                playerElement.className = 'leaderboard-item';
                playerElement.innerHTML = `
                    <span class="rank">${rank}</span>
                    <span class="name">${player.name}</span>
                    <span class="score">${player.score}</span>
                `;
                this.leaderboardList.appendChild(playerElement);
            });
    }

    getRank(level) {
        if (level >= 2 && level < 5) {
            return 'Снюсоед базовый';
        } else if (level >= 5 && level <= 10) {
            return 'Кидала никотиновый';
        } else if (level > 10) {
            return 'Снюсоед продвинутый';
        } else {
            return 'Новичок';
        }
    }

    saveToLeaderboard() {
        const player = {
            name: 'Игрок', // Здесь можно добавить ввод имени
            score: this.score,
            level: this.level
        };
        this.leaderboard.push(player);
        localStorage.setItem('snusClickerLeaderboard', JSON.stringify(this.leaderboard));
    }

    loadLeaderboard() {
        const savedLeaderboard = localStorage.getItem('snusClickerLeaderboard');
        if (savedLeaderboard) {
            this.leaderboard = JSON.parse(savedLeaderboard);
        }
    }

    toggleSound() {
        this.isSoundEnabled = !this.isSoundEnabled;
        this.soundToggleBtn.classList.toggle('muted', !this.isSoundEnabled);

        // Обновляем иконку
        const icon = this.soundToggleBtn.querySelector('.icon');
        icon.textContent = this.isSoundEnabled ? '🔊' : '🔇';

        // Обновляем подсказку
        const tooltip = this.soundToggleBtn.querySelector('.tooltip');
        tooltip.textContent = this.isSoundEnabled ? 'Звук' : 'Включить звук';
    }

    playClickSound() {
        this.playAudio(this.clickSound);
    }

    playLevelUpSound() {
        this.playAudio(this.levelUpSound);
    }

    playMenuSound() {
        this.playAudio(this.menuSound);
    }

    async playAudio(audio) {
        if (this.isSoundEnabled && audio) {
            try {
                audio.currentTime = 0;
                await audio.play();
            } catch (error) {
                console.warn('Audio play failed:', error);
            }
        }
    }

    isBackgroundLocked(index) {
        if (this.allBackgroundsUnlocked) return false;
        return index > this.level - 1;
    }

    checkPromoCode() {
        this.playAudio(this.clickSound);
        const code = this.promoInput.value.trim().toUpperCase();
        if (code === 'SIBERIA') {
            this.allBackgroundsUnlocked = true;
            this.playAudio(this.levelUpSound); // Success sound
            this.promoInput.value = '';
            this.promoInput.placeholder = 'Код активирован!';
            this.initializeBackgrounds(); // Refresh grid

            // Visual feedback
            const btn = this.promoBtn;
            const originalText = btn.textContent;
            btn.textContent = '✓';
            btn.style.background = '#22c55e'; // Green
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        } else {
            // Error feedback
            this.promoInput.classList.add('error');
            setTimeout(() => this.promoInput.classList.remove('error'), 500);
        }
    }
}

// Инициализация игры
window.addEventListener('load', () => {
    new Game();
}); 