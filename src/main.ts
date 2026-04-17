import './scss/main.scss';

// ============================================================
// TYPES
// ============================================================

type Theme = 'coding' | 'gaming';
type Player = 'blue' | 'orange';
type BoardSize = 16 | 24 | 36;
type Winner = 'blue' | 'orange' | 'draw';

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
// CONSTANTS
// ============================================================

const ICON_PATH = '/projects/memory_game/src/assets/icons/';
const CARD_PATH = '/projects/memory_game/src/assets/cards/';
const PREVIEW_PATH = '/projects/memory_game/src/assets/previews/';

const PLAYER_COLORS: Record<Player, string> = {
    blue: '#2BB1FF',
    orange: '#F58E39'
};

const THEME_LABELS: Record<Theme, string> = {
    coding: 'Code Theme',
    gaming: 'Game Theme'
};

const CODING_CARDS: string[] = [
    'coding-angular', 'coding-bootstrap', 'coding-css',
    'coding-database', 'coding-django', 'coding-firebase',
    'coding-git', 'coding-github', 'coding-html',
    'coding-javascript', 'coding-nodejs', 'coding-python',
    'coding-react', 'coding-sass', 'coding-terminal',
    'coding-typescript', 'coding-vscode', 'coding-vue'
];

const GAMING_CARDS: string[] = [
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

const popup             = document.getElementById('popup')!;
const board             = document.getElementById('board')!;
const btnStart          = document.getElementById('btn-start') as HTMLButtonElement;
const barTheme          = document.getElementById('bar-theme')!;
const barPlayer         = document.getElementById('bar-player')!;
const barSize           = document.getElementById('bar-size')!;
const settingsPreview   = document.getElementById('settings-preview')!;
const scoreBlueEl       = document.getElementById('score-blue-value')!;
const scoreOrangeEl     = document.getElementById('score-orange-value')!;
const finalScoreBlue    = document.getElementById('final-score-blue')!;
const finalScoreOrange  = document.getElementById('final-score-orange')!;
const winnerName        = document.getElementById('winner-name')!;
const winnerIcon        = document.getElementById('winner-icon') as HTMLImageElement;

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
        <img src="${PREVIEW_PATH}${theme}-preview.svg" alt="${theme} preview" />
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
    barTheme.textContent  = theme  ? THEME_LABELS[theme] : 'Theme';
    barPlayer.textContent = player ? `${capitalize(player)} Player` : 'Player';
    barSize.textContent   = size   ? `Board-${size} Cards` : 'Board size';
}

function initSettingsListeners(): void {
    addRadioListener('theme', val => {
        state.settings.theme = val as Theme;
        applyTheme(state.settings.theme);
        updateSettingsPreview(state.settings.theme);
    });

    addRadioListener('player', val => {
        state.settings.player = val as Player;
    });

    addRadioListener('size', val => {
        state.settings.size = Number(val) as BoardSize;
    });
}

function addRadioListener(name: string, callback: (val: string) => void): void {
    document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach(radio => {
        radio.addEventListener('change', () => {
            callback(radio.value);
            updateSettingsBar();
            checkSettingsComplete();
        });
    });
}

// ============================================================
// CARDS
// ============================================================

function getCardList(theme: Theme): string[] {
    return theme === 'coding' ? CODING_CARDS : GAMING_CARDS;
}

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

function createCards(theme: Theme, size: BoardSize): CardData[] {
    const selected = shuffle(getCardList(theme)).slice(0, size / 2);
    const paired   = shuffle([...selected, ...selected]);

    return paired.map((name, index) => ({
        id: index,
        name,
        imagePath: `${CARD_PATH}${name}.svg`,
        isFlipped: false,
        isMatched: false
    }));
}

function renderBoard(): void {
    const { theme, size } = state.settings;
    if (!theme || !size) return;

    board.className = `board board--${size}`;
    board.innerHTML = '';
    state.cards.forEach(card => appendCard(card, theme));
}

function appendCard(card: CardData, theme: Theme): void {
    const btn = document.createElement('button');
    btn.classList.add('card');
    btn.dataset.id = String(card.id);
    btn.innerHTML = `
        <div class="card__inner">
            <div class="card__face card__face--front">
                <img src="${CARD_PATH}${theme}-cover.svg" alt="card cover" />
            </div>
            <div class="card__face card__face--back">
                <img src="${card.imagePath}" alt="${card.name}" />
            </div>
        </div>
    `;
    board.appendChild(btn);
}

// ============================================================
// SCORE & PLAYER DISPLAY
// ============================================================

function updateScoreDisplay(): void {
    scoreBlueEl.textContent   = String(state.scores.blue);
    scoreOrangeEl.textContent = String(state.scores.orange);
}

function updateCurrentPlayerDisplay(): void {
    if (state.settings.theme === 'gaming') {
        updateGamingPlayerDisplay();
    } else {
        updateCodingPlayerDisplay();
    }
}

function updateGamingPlayerDisplay(): void {
    const icon    = document.getElementById('current-player-icon') as HTMLImageElement;
    const wrapper = document.getElementById('current-player-wrapper');
    icon.src = `${ICON_PATH}chess_pawn_white.svg`;
    if (wrapper) {
        wrapper.style.backgroundColor = PLAYER_COLORS[state.currentPlayer];
    }
}

function updateCodingPlayerDisplay(): void {
    const icon    = document.getElementById('current-player-icon') as HTMLImageElement;
    const wrapper = document.getElementById('current-player-wrapper');
    icon.src = `${ICON_PATH}player-${state.currentPlayer}.svg`;
    if (wrapper) {
        wrapper.style.backgroundColor = 'transparent';
        wrapper.style.padding = '0';
    }
}

function setScoreLabelsVisible(visible: boolean): void {
    const blueLabel   = document.getElementById('score-blue-label');
    const orangeLabel = document.getElementById('score-orange-label');
    if (blueLabel)   blueLabel.style.display   = visible ? 'inline' : 'none';
    if (orangeLabel) orangeLabel.style.display = visible ? 'inline' : 'none';
}

function setScoreIcons(theme: Theme): void {
    const blueIcon  = document.querySelector('#score-blue img') as HTMLImageElement;
    const orangeIcon = document.querySelector('#score-orange img') as HTMLImageElement;
    const prefix = theme === 'gaming' ? 'chess_pawn' : 'player-';
    const sep    = theme === 'gaming' ? '_' : '';
    if (blueIcon)   blueIcon.src   = `${ICON_PATH}${prefix}${sep}blue.svg`;
    if (orangeIcon) orangeIcon.src = `${ICON_PATH}${prefix}${sep}orange.svg`;
}

function applyScoreLayout(theme: Theme): void {
    setScoreLabelsVisible(theme !== 'gaming');
    setScoreIcons(theme);
}

function switchPlayer(): void {
    state.currentPlayer = state.currentPlayer === 'blue' ? 'orange' : 'blue';
    updateCurrentPlayerDisplay();
}

// ============================================================
// GAME LOGIC
// ============================================================

function handleCardClick(e: MouseEvent): void {
    if (state.isLocked) return;

    const cardEl = (e.target as HTMLElement).closest('.card') as HTMLButtonElement;
    if (!cardEl) return;

    const id   = Number(cardEl.dataset.id);
    const card = state.cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    flipCard(cardEl, id);

    if (state.flippedCards.length === 2) {
        state.isLocked = true;
        checkForMatch();
    }
}

function flipCard(cardEl: HTMLButtonElement, id: number): void {
    cardEl.classList.add('is-flipped');
    const card = state.cards.find(c => c.id === id)!;
    card.isFlipped = true;
    state.flippedCards.push(card);
}

function checkForMatch(): void {
    const [first, second] = state.flippedCards;
    first.name === second.name ? handleMatch(first, second) : handleNoMatch(first, second);
}

function handleMatch(first: CardData, second: CardData): void {
    state.cards.forEach(c => {
        if (c.name === first.name) c.isMatched = true;
    });

    markCardsMatched(first.id, second.id);
    state.scores[state.currentPlayer]++;
    updateScoreDisplay();
    state.flippedCards = [];
    state.isLocked = false;
    checkGameOver();
}

function markCardsMatched(id1: number, id2: number): void {
    board.querySelectorAll<HTMLButtonElement>(
        `[data-id="${id1}"], [data-id="${id2}"]`
    ).forEach(el => el.classList.add('is-matched'));
}

function handleNoMatch(first: CardData, second: CardData): void {
    setTimeout(() => {
        unflipCards(first.id, second.id);
        state.flippedCards = [];
        state.isLocked = false;
        switchPlayer();
    }, 1000);
}

function unflipCards(id1: number, id2: number): void {
    board.querySelectorAll<HTMLButtonElement>(
        `[data-id="${id1}"], [data-id="${id2}"]`
    ).forEach(el => el.classList.remove('is-flipped'));

    state.cards.forEach(c => {
        if (c.id === id1 || c.id === id2) c.isFlipped = false;
    });
}

// ============================================================
// GAME OVER & WINNER
// ============================================================

function checkGameOver(): void {
    if (!state.cards.every(c => c.isMatched)) return;

    setTimeout(() => {
        finalScoreBlue.textContent   = String(state.scores.blue);
        finalScoreOrange.textContent = String(state.scores.orange);
        showView('gameover');
        setTimeout(() => showWinner(), 2000);
    }, 500);
}

function getWinner(): Winner {
    const { blue, orange } = state.scores;
    if (blue === orange) return 'draw';
    return blue > orange ? 'blue' : 'orange';
}

function getWinnerIcon(winner: Winner): string {
    if (state.settings.theme === 'gaming') return `${ICON_PATH}pokal.svg`;
    return winner === 'draw' 
        ? `${ICON_PATH}chess_pawn_white.svg` 
        : `${ICON_PATH}chess_pawn_${winner}.svg`;
}

function showWinner(): void {
    const winner = getWinner();

    if (winner === 'draw') {
        winnerName.textContent = "It's a draw!";
        winnerName.className   = 'winner__name';
    } else {
        winnerName.textContent = `${capitalize(winner)} Player`;
        winnerName.className   = `winner__name winner__name--${winner}`;
    }

    winnerIcon.src = getWinnerIcon(winner);
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
    applyScoreLayout(theme);
}

function resetToHome(): void {
    state.settings = { theme: 'coding', player: 'blue', size: 16 };
    state.cards    = [];
    state.scores   = { blue: 0, orange: 0 };

    resetRadioButtons();
    applyTheme('coding');
    updateSettingsPreview('coding'); 
    updateSettingsBar();
    checkSettingsComplete();
    showView('home');
}

function resetRadioButtons(): void {
    const firstTheme  = document.querySelector<HTMLInputElement>('input[name="theme"]');
    const firstPlayer = document.querySelector<HTMLInputElement>('input[name="player"]');
    const firstSize   = document.querySelector<HTMLInputElement>('input[name="size"]');

    if (firstTheme)  firstTheme.checked  = true;
    if (firstPlayer) firstPlayer.checked = true;
    if (firstSize)   firstSize.checked   = true;
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
    document.getElementById('btn-go-to-settings')!
        .addEventListener('click', () => showView('settings'));

    document.getElementById('btn-start')!
        .addEventListener('click', startGame);

    document.getElementById('btn-exit')!
        .addEventListener('click', showPopup);

    document.getElementById('btn-popup-no')!
        .addEventListener('click', hidePopup);

    document.getElementById('btn-popup-yes')!
        .addEventListener('click', () => { hidePopup(); resetToHome(); });

    document.getElementById('btn-back-to-start')!
        .addEventListener('click', resetToHome);

    board.addEventListener('click', handleCardClick);
}

// ============================================================
// HELPERS
// ============================================================

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// INIT
// ============================================================

function init(): void {
    initSettingsListeners();
    initEventListeners();

    state.settings.theme  = 'coding';
    state.settings.player = 'blue';
    state.settings.size   = 16;
    applyTheme('coding');
    updateSettingsBar();
    checkSettingsComplete();

    showView('home');
}

init();