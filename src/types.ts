// ============================================================
// TYPES
// ============================================================

export type Theme = 'coding' | 'gaming';
export type Player = 'blue' | 'orange';
export type BoardSize = 16 | 24 | 36;
export type Winner = 'blue' | 'orange' | 'draw';

export interface GameSettings {
  theme: Theme | null;
  player: Player | null;
  size: BoardSize | null;
}

export interface CardData {
  id: number;
  name: string;
  imagePath: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameState {
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

export const ICON_PATH = '/projects/memory_game/assets/icons/';
export const CARD_PATH = '/projects/memory_game/assets/cards/';
export const PREVIEW_PATH = '/projects/memory_game/assets/previews/';

export const FLIP_DELAY_MS = 1000;
export const GAMEOVER_DELAY_MS = 500;
export const WINNER_DELAY_MS = 2000;

export const PLAYER_COLORS: Record<Player, string> = {
  blue: '#2BB1FF',
  orange: '#F58E39'
};

export const THEME_LABELS: Record<Theme, string> = {
  coding: 'Code Theme',
  gaming: 'Game Theme'
};

export const CODING_CARDS: string[] = [
  'coding-angular', 'coding-bootstrap', 'coding-css',
  'coding-database', 'coding-django', 'coding-firebase',
  'coding-git', 'coding-github', 'coding-html',
  'coding-javascript', 'coding-nodejs', 'coding-python',
  'coding-react', 'coding-sass', 'coding-terminal',
  'coding-typescript', 'coding-vscode', 'coding-vue'
];

export const GAMING_CARDS: string[] = [
  'gaming-banana', 'gaming-card', 'gaming-coin',
  'gaming-controller', 'gaming-dices', 'gaming-gameboy',
  'gaming-labyrint', 'gaming-levelup', 'gaming-minecraft',
  'gaming-mushroom', 'gaming-pacman', 'gaming-pacmanattack',
  'gaming-playbutton', 'gaming-puzzle', 'gaming-snake',
  'gaming-squidround', 'gaming-squidsquare', 'gaming-squidtri'
];