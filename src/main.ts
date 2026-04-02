import './scss/main.scss';

// ============================================================
// TYPES
// ============================================================

type Theme = 'coding' | 'gaming';
type Player = 'blue' | 'orange';
type BoardSize = 16 | 24 | 36;

interface GameSettings {
    theme: Theme | null;
    player: Player | null;
    size: BoardSize | null;
}

interface CardData {
    id: number;
    name: string;
    imagePath: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface GameState {
    settings: GameSettings;
    cards: CardData[];
    flippedCards: CardData[];
    scores: { blue: number; orange: number };
    currentPlayer: Player;
    isLocked: boolean;
}

// ============================================================
// CARD LISTS
// ============================================================

const codingCards: string[] = [
    'coding-angular', 'coding-bootstrap', 'coding-css',
    'coding-database', 'coding-django', 'coding-firebase',
    'coding-git', 'coding-github', 'coding-html',
    'coding-javascript', 'coding-nodejs', 'coding-python',
    'coding-react', 'coding-sass', 'coding-terminal',
    'coding-typescript', 'coding-vscode', 'coding-vue'
];

const gamingCards: string[] = [
    'gaming-banana', 'gaming-card', 'gaming-coin',
    'gaming-controller', 'gaming-dices', 'gaming-gameboy',
    'gaming-labyrint', 'gaming-levelup', 'gaming-minecraft',
    'gaming-mushroom', 'gaming-pacman', 'gaming-pacmanattack',
    'gaming-playbutton', 'gaming-puzzle', 'gaming-snake',
    'gaming-squidround', 'gaming-squidsquare', 'gaming-squidtri'
];

// ============================================================
// STATE
// ============================================================

const state: GameState = {
    settings: { theme: null, player: null, size: null },
    cards: [],
    flippedCards: [],
    scores: { blue: 0, orange: 0 },
    currentPlayer: 'blue',
    isLocked: false
};

// ============================================================
// DOM REFS
// ============================================================

const views = {
    home:     document.getElementById('view-home')!,
    settings: document.getElementById('view-settings')!,
    game:     document.getElementById('view-game')!,
    gameover: document.getElementById('view-gameover')!,
    winner:   document.getElementById('view-winner')!,
};

const popup         = document.getElementById('popup')!;
const board         = document.getElementById('board')!;
const btnStart      = document.getElementById('btn-start') as HTMLButtonElement;
const barTheme      = document.getElementById('bar-theme')!;
const barPlayer     = document.getElementById('bar-player')!;
const barSize       = document.getElementById('bar-size')!;
const settingsPreview = document.getElementById('settings-preview')!;

const scoreBlueEl   = document.getElementById('score-blue-value')!;
const scoreOrangeEl = document.getElementById('score-orange-value')!;
const currentPlayerIcon = document.getElementById('current-player-icon') as HTMLImageElement;

const finalScoreBlue   = document.getElementById('final-score-blue')!;
const finalScoreOrange = document.getElementById('final-score-orange')!;
const winnerName       = document.getElementById('winner-name')!;
const winnerIcon       = document.getElementById('winner-icon') as HTMLImageElement;

// ============================================================
// VIEW NAVIGATION
// ============================================================

function showView(viewName: keyof typeof views): void {
    Object.values(views).forEach(v => v.classList.remove('is-active'));
    views[viewName].classList.add('is-active');
}

// ============================================================
// THEME
// ============================================================

function applyTheme(theme: Theme): void {
    document.body.classList.remove('theme-coding', 'theme-gaming');
    document.body.classList.add(`theme-${theme}`);
}

function updateSettingsPreview(theme: Theme): void {
    settingsPreview.innerHTML = `
        <img src="/projects/banana/src/assets/previews/${theme}-preview.svg" alt="${theme} preview" />
    `;
}

// ============================================================
// SETTINGS
// ============================================================

function checkSettingsComplete(): void {
    const { theme, player, size } = state.settings;
    btnStart.disabled = !(theme && player && size);
}

function updateSettingsBar(): void {
    const { theme, player, size } = state.settings;
    barTheme.textContent  = theme  ? theme              : 'Theme';
    barPlayer.textContent = player ? `${player} Player` : 'Player';
    barSize.textContent   = size   ? `Board-${size} Cards` : 'Board size';
}

function initSettingsListeners(): void {
    // Theme radios
    document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', () => {
            state.settings.theme = radio.value as Theme;
            applyTheme(state.settings.theme);
            updateSettingsPreview(state.settings.theme);
            updateSettingsBar();
            checkSettingsComplete();
        });
    });

    // Player radios
    document.querySelectorAll<HTMLInputElement>('input[name="player"]').forEach(radio => {
        radio.addEventListener('change', () => {
            state.settings.player = radio.value as Player;
            updateSettingsBar();
            checkSettingsComplete();
        });
    });

    // Size radios
    document.querySelectorAll<HTMLInputElement>('input[name="size"]').forEach(radio => {
        radio.addEventListener('change', () => {
            state.settings.size = Number(radio.value) as BoardSize;
            updateSettingsBar();
            checkSettingsComplete();
        });
    });
}

// ============================================================
// CARDS
// ============================================================

function getCardList(theme: Theme): string[] {
    return theme === 'coding' ? codingCards : gamingCards;
}

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

function createCards(theme: Theme, size: BoardSize): CardData[] {
    const pairsNeeded = size / 2;
    const cardList    = getCardList(theme);
    const selected    = shuffle(cardList).slice(0, pairsNeeded);
    const paired      = shuffle([...selected, ...selected]);

    return paired.map((name, index) => ({
        id: index,
        name,
        imagePath: `/src/assets/cards/${name}.svg`,
        isFlipped: false,
        isMatched: false
    }));
}

function renderBoard(): void {
    const { theme, size } = state.settings;
    if (!theme || !size) return;

    board.className = `board board--${size}`;
    board.innerHTML = '';

    state.cards.forEach(card => {
        const coverPath = `/src/assets/cards/${theme}-cover.svg`;

        const btn = document.createElement('button');
        btn.classList.add('card');
        btn.dataset.id = String(card.id);
        btn.innerHTML = `
            <div class="card__inner">
                <div class="card__face card__face--front">
                    <img src="${coverPath}" alt="card cover" />
                </div>
                <div class="card__face card__face--back">
                    <img src="${card.imagePath}" alt="${card.name}" />
                </div>
            </div>
        `;
        board.appendChild(btn);
    });
}

// ============================================================
// GAME LOGIC
// ============================================================

function updateScoreDisplay(): void {
    scoreBlueEl.textContent   = String(state.scores.blue);
    scoreOrangeEl.textContent = String(state.scores.orange);
}

function updateCurrentPlayerDisplay(): void {
    const color = state.currentPlayer;
    currentPlayerIcon.src = `/icons/player-${color}.svg`;
}

function switchPlayer(): void {
    state.currentPlayer = state.currentPlayer === 'blue' ? 'orange' : 'blue';
    updateCurrentPlayerDisplay();
}

function checkForMatch(): void {
    const [first, second] = state.flippedCards;

    if (first.name === second.name) {
        // Match!
        state.cards = state.cards.map(c =>
            c.name === first.name ? { ...c, isMatched: true } : c
        );

        const matchedEls = board.querySelectorAll<HTMLButtonElement>(
            `[data-id="${first.id}"], [data-id="${second.id}"]`
        );
        matchedEls.forEach(el => el.classList.add('is-matched'));

        state.scores[state.currentPlayer]++;
        updateScoreDisplay();
        state.flippedCards = [];
        state.isLocked = false;

        checkGameOver();
    } else {
        // Kein Match – nach kurzer Zeit wieder zuklappen
        setTimeout(() => {
            const flippedEls = board.querySelectorAll<HTMLButtonElement>(
                `[data-id="${first.id}"], [data-id="${second.id}"]`
            );
            flippedEls.forEach(el => el.classList.remove('is-flipped'));

            state.cards = state.cards.map(c =>
                c.id === first.id || c.id === second.id
                    ? { ...c, isFlipped: false }
                    : c
            );

            state.flippedCards = [];
            state.isLocked = false;
            switchPlayer();
        }, 1000);
    }
}

function handleCardClick(e: MouseEvent): void {
    if (state.isLocked) return;

    const cardEl = (e.target as HTMLElement).closest('.card') as HTMLButtonElement;
    if (!cardEl) return;

    const id = Number(cardEl.dataset.id);
    const card = state.cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    // Karte aufdecken
    cardEl.classList.add('is-flipped');
    state.cards = state.cards.map(c =>
        c.id === id ? { ...c, isFlipped: true } : c
    );
    state.flippedCards.push(card);

    if (state.flippedCards.length === 2) {
        state.isLocked = true;
        checkForMatch();
    }
}

function checkGameOver(): void {
    const allMatched = state.cards.every(c => c.isMatched);
    if (!allMatched) return;

    setTimeout(() => {
        finalScoreBlue.textContent   = String(state.scores.blue);
        finalScoreOrange.textContent = String(state.scores.orange);
        showView('gameover');

        setTimeout(() => {
            showWinner();
        }, 2000);
    }, 500);
}

function showWinner(): void {
    const { blue, orange } = state.scores;

    if (blue === orange) {
        winnerName.textContent = "It's a draw!";
        winnerName.className   = 'winner__name';
    } else {
        const winner = blue > orange ? 'blue' : 'orange';
        winnerName.textContent = `${winner.charAt(0).toUpperCase() + winner.slice(1)} Player`;
        winnerName.className   = `winner__name winner__name--${winner}`;
        winnerIcon.src         = `/icons/player-${winner}.svg`;
    }

    showView('winner');
}

// ============================================================
// GAME START / RESET
// ============================================================

function startGame(): void {
    const { theme, player, size } = state.settings;
    if (!theme || !player || !size) return;

    state.currentPlayer = player;
    state.scores        = { blue: 0, orange: 0 };
    state.flippedCards  = [];
    state.isLocked      = false;
    state.cards         = createCards(theme, size);

    updateScoreDisplay();
    updateCurrentPlayerDisplay();
    renderBoard();
    showView('game');
}

function resetToHome(): void {
    state.settings = { theme: null, player: null, size: null };
    state.cards    = [];
    state.scores   = { blue: 0, orange: 0 };

    document.querySelectorAll<HTMLInputElement>('input[type="radio"]')
        .forEach(r => r.checked = false);

    updateSettingsBar();
    btnStart.disabled = true;
    document.body.classList.remove('theme-coding', 'theme-gaming');

    showView('home');
}

// ============================================================
// POPUP
// ============================================================

function showPopup(): void {
    popup.classList.add('is-active');
}

function hidePopup(): void {
    popup.classList.remove('is-active');
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function initEventListeners(): void {
    // Home → Settings
    document.getElementById('btn-go-to-settings')!
        .addEventListener('click', () => showView('settings'));

    // Settings → Game
    document.getElementById('btn-start')!
        .addEventListener('click', startGame);

    // Game → Popup
    document.getElementById('btn-exit')!
        .addEventListener('click', showPopup);

    // Popup: zurück
    document.getElementById('btn-popup-no')!
        .addEventListener('click', hidePopup);

    // Popup: beenden
    document.getElementById('btn-popup-yes')!
        .addEventListener('click', () => {
            hidePopup();
            resetToHome();
        });

    // Winner → Home
    document.getElementById('btn-back-to-start')!
        .addEventListener('click', resetToHome);

    // Board click (Event Delegation)
    board.addEventListener('click', handleCardClick);
}

// ============================================================
// INIT
// ============================================================

function init(): void {
    initSettingsListeners();
    initEventListeners();
    showView('home');
}

init();