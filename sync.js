// ================================================================
//  sync.js — Universal Time Synchronization Engine
//  Wanna Bet? by Zengine
//
//  All game outcomes are derived from Date.now().
//  Same timestamp = same result for every user on Earth.
//  No server. No accounts. No cheating.
//
//  Cascading intervals (10s apart):
//    Roulette:  60s
//    Lottery:   70s
//    Keno:      80s
//    Poker:     90s
//    Bluff:     100s
//    Coin:      110s
//    Dice:      120s
//    Emoji:     130s
// ================================================================

'use strict';

// ── Seeded PRNG (mulberry32) — given same seed, always same output ──
function prng(seed) {
  let s = seed >>> 0;
  return function() {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Random integer [min, max] inclusive, deterministic
function rInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

// Current round index for a given interval
function roundIdx(intervalMs) {
  return Math.floor(Date.now() / intervalMs);
}

// Seconds until next round
function secsLeft(intervalMs) {
  return Math.ceil((intervalMs - (Date.now() % intervalMs)) / 1000);
}

// Progress through current round [0, 1)
function roundProgress(intervalMs) {
  return (Date.now() % intervalMs) / intervalMs;
}

// ── GAME INTERVALS ──────────────────────────────────────────────
const WB = {
  ROULETTE: 60000,
  LOTTERY:  70000,
  KENO:     80000,
  POKER:    90000,
  BLUFF:    100000,
  COIN:     110000,
  DICE:     120000,
  EMOJI:    130000,
};

// ── ROULETTE ────────────────────────────────────────────────────
const ROUL_RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

function getRouletteResult(ri) {
  const r = prng(ri * 7777 + 1);
  return rInt(r, 0, 36);
}

function roulColor(n) {
  if (n === 0) return 'green';
  return ROUL_RED.has(n) ? 'red' : 'black';
}

// ── LOTTERY ─────────────────────────────────────────────────────
function getPick3(ri) {
  const r = prng(ri * 1001 + 3);
  return [rInt(r,0,9), rInt(r,0,9), rInt(r,0,9)];
}

function getPick5(ri) {
  const r = prng(ri * 1001 + 5);
  const pool = Array.from({length:39}, (_,i) => i+1);
  const drawn = [];
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(r() * pool.length);
    drawn.push(pool.splice(idx,1)[0]);
  }
  return drawn.sort((a,b) => a-b);
}

function getPowerball(ri) {
  const r = prng(ri * 1001 + 99);
  const pool = Array.from({length:69}, (_,i) => i+1);
  const white = [];
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(r() * pool.length);
    white.push(pool.splice(idx,1)[0]);
  }
  white.sort((a,b) => a-b);
  const pb = rInt(r, 1, 26);
  return { white, pb };
}

// ── KENO ─────────────────────────────────────────────────────────
function getKeno(ri) {
  // 10 numbers from 1-50
  const r = prng(ri * 4444 + 50);
  const pool = Array.from({length:50}, (_,i) => i+1);
  const drawn = [];
  for (let i = 0; i < 10; i++) {
    const idx = Math.floor(r() * pool.length);
    drawn.push(pool.splice(idx,1)[0]);
  }
  return drawn.sort((a,b) => a-b);
}

// ── POKER (single draw) ──────────────────────────────────────────
const RANKS = [1,2,3,4,5,6,7,8,9,10,11,12,13];
const RANK_NAMES = {1:'A',11:'J',12:'Q',13:'K'};
const SUITS = ['hearts','diamonds','clubs','spades'];
const SUIT_SYMS = { hearts:'♥', diamonds:'♦', clubs:'♣', spades:'♠' };
const RED_SUITS = new Set(['hearts','diamonds']);

function rankName(r) { return RANK_NAMES[r] || String(r); }

function getPokerCard(ri) {
  const r = prng(ri * 5252 + 13);
  const rank = RANKS[Math.floor(r() * 13)];
  const suit = SUITS[Math.floor(r() * 4)];
  return { rank, suit };
}

// ── BLIND MAN'S BLUFF ────────────────────────────────────────────
function getBluffHand(ri) {
  const r = prng(ri * 5555 + 52);
  const deck = [];
  RANKS.forEach(rank => SUITS.forEach(suit => deck.push({rank, suit})));
  const idx1 = Math.floor(r() * 52);
  let idx2 = Math.floor(r() * 51);
  if (idx2 >= idx1) idx2++;
  const player = deck[idx1];
  const house  = deck[idx2];
  const pRank  = player.rank === 1 ? 14 : player.rank;
  const hRank  = house.rank  === 1 ? 14 : house.rank;
  const winner = pRank > hRank ? 'player' : hRank > pRank ? 'house' : 'tie';
  return { player, house, winner };
}

// Phase within a bluff round: deal -> reveal player -> reveal house -> show winner
function getBluffPhase(progress) {
  if (progress < 0.18) return 'deal';
  if (progress < 0.50) return 'player';
  if (progress < 0.78) return 'both';
  return 'result';
}

// ── COIN TOSS ────────────────────────────────────────────────────
function getCoin(ri) {
  const r = prng(ri * 2222 + 7);
  return r() < 0.5 ? 'HEADS' : 'TAILS';
}

// ── 5 DICE ───────────────────────────────────────────────────────
function getDice5(ri) {
  const r = prng(ri * 3333 + 5);
  return [rInt(r,1,6),rInt(r,1,6),rInt(r,1,6),rInt(r,1,6),rInt(r,1,6)];
}

function evalDice(dice) {
  const counts = {};
  dice.forEach(d => counts[d] = (counts[d]||0)+1);
  const vals = Object.values(counts).sort((a,b) => b-a);
  const sum  = dice.reduce((a,b) => a+b, 0);
  const sorted = [...dice].sort((a,b) => a-b);
  const straight = sorted.join('') === '12345' || sorted.join('') === '23456';
  if (vals[0] === 5) return { name: 'FIVE OF A KIND', tier: 'legendary', sum };
  if (vals[0] === 4) return { name: 'FOUR OF A KIND', tier: 'great', sum };
  if (vals[0] === 3 && vals[1] === 2) return { name: 'FULL HOUSE', tier: 'great', sum };
  if (straight)      return { name: 'STRAIGHT', tier: 'good', sum };
  if (vals[0] === 3) return { name: 'THREE OF A KIND', tier: 'good', sum };
  if (vals[0] === 2 && vals[1] === 2) return { name: 'TWO PAIR', tier: 'ok', sum };
  if (vals[0] === 2) return { name: 'ONE PAIR', tier: 'ok', sum };
  return { name: 'BUST — SUM ' + sum, tier: 'bust', sum };
}

// ── 1 DIE ────────────────────────────────────────────────────────
function getDie1(ri) {
  const r = prng(ri * 1111 + 6);
  return rInt(r, 1, 6);
}

// ── EMOJI ────────────────────────────────────────────────────────
const EMOJI_LIST = [
  { e:'🎰', name:'JACKPOT',    cat:'Casino' },
  { e:'🎲', name:'DICE ROLL',  cat:'Casino' },
  { e:'🃏', name:'WILD CARD',  cat:'Cards'  },
  { e:'🎯', name:'BULLSEYE',   cat:'Games'  },
  { e:'🏆', name:'CHAMPION',   cat:'Sports' },
  { e:'💎', name:'DIAMOND',    cat:'Gems'   },
  { e:'⚡', name:'LIGHTNING',  cat:'Nature' },
  { e:'🔥', name:'ON FIRE',    cat:'Nature' },
  { e:'🌊', name:'WAVE',       cat:'Nature' },
  { e:'🌙', name:'MOON',       cat:'Space'  },
  { e:'⭐', name:'STAR',       cat:'Space'  },
  { e:'🚀', name:'ROCKET',     cat:'Space'  },
  { e:'🦁', name:'LION',       cat:'Animals'},
  { e:'🐉', name:'DRAGON',     cat:'Mythic' },
  { e:'🦋', name:'BUTTERFLY',  cat:'Animals'},
  { e:'🍀', name:'LUCKY CLOVER',cat:'Nature'},
  { e:'🎸', name:'ROCK ON',    cat:'Music'  },
  { e:'🌈', name:'RAINBOW',    cat:'Nature' },
  { e:'🦊', name:'FOX',        cat:'Animals'},
  { e:'🦄', name:'UNICORN',    cat:'Mythic' },
  { e:'🎆', name:'FIREWORKS',  cat:'Events' },
];
// exactly 21 — A Zengine Original

function getEmoji(ri) {
  const r = prng(ri * 6666 + 21);
  return EMOJI_LIST[Math.floor(r() * EMOJI_LIST.length)];
}

// ── EXPORT ───────────────────────────────────────────────────────
window.WB = WB;
window.wbSync = {
  prng, rInt, roundIdx, secsLeft, roundProgress,
  getRouletteResult, roulColor, ROUL_RED, WHEEL_ORDER,
  getPick3, getPick5, getPowerball,
  getKeno,
  rankName, SUIT_SYMS, RED_SUITS, RANKS, SUITS, RANK_NAMES,
  getPokerCard,
  getBluffHand, getBluffPhase,
  getCoin,
  getDice5, getDie1, evalDice,
  getEmoji, EMOJI_LIST,
};
