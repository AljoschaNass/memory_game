import {
  Theme, Player, BoardSize, Winner, CardData, GameState,
  CODING_CARDS, GAMING_CARDS, CARD_PATH, ICON_PATH
} from './types';

// ============================================================
// CARDS
// ============================================================

/** Returns the card list for the given theme. */
function getCardList(theme: Theme): string[] {
  return theme === 'coding' ? CODING_CARDS : GAMING_CARDS;
}

/** Returns a shuffled copy of the given array. */
export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/** Creates an array of card pairs based on theme and board size. */
export function createCards(theme: Theme, size: BoardSize): CardData[] {
  const selected = shuffle(getCardList(theme)).slice(0, size / 2);
  const paired = shuffle([...selected, ...selected]);

  return paired.map((name, index) => ({
    id: index,
    name,
    imagePath: `${CARD_PATH}${name}.svg`,
    isFlipped: false,
    isMatched: false
  }));
}

/** Creates a card button element and appends it to the board. */
export function appendCard(card: CardData, theme: Theme, board: HTMLElement): void {
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
// MATCH LOGIC
// ============================================================

/** Adds the matched class to the given card elements. */
export function markCardsMatched(board: HTMLElement, id1: number, id2: number): void {
  board.querySelectorAll<HTMLButtonElement>(
    `[data-id="${id1}"], [data-id="${id2}"]`
  ).forEach(el => el.classList.add('is-matched'));
}

/** Removes the flipped state from the given cards. */
export function unflipCards(board: HTMLElement, state: GameState, id1: number, id2: number): void {
  board.querySelectorAll<HTMLButtonElement>(
    `[data-id="${id1}"], [data-id="${id2}"]`
  ).forEach(el => el.classList.remove('is-flipped'));

  state.cards.forEach(c => {
    if (c.id === id1 || c.id === id2) c.isFlipped = false;
  });
}

// ============================================================
// WINNER
// ============================================================

/** Returns the winner based on current scores. */
export function getWinner(state: GameState): Winner {
  const { blue, orange } = state.scores;
  if (blue === orange) return 'draw';
  return blue > orange ? 'blue' : 'orange';
}

/** Returns the icon path for the winner based on the active theme. */
export function getWinnerIcon(state: GameState, winner: Winner): string {
  if (state.settings.theme === 'gaming') return `${ICON_PATH}pokal.svg`;
  return winner === 'draw'
    ? `${ICON_PATH}chess_pawn_white.svg`
    : `${ICON_PATH}chess_pawn_${winner}.svg`;
}

// ============================================================
// HELPERS
// ============================================================

/** Returns the given string with the first letter in uppercase. */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}