/* =====================================================
   🌌 LEVEL PROGRESSION SYSTEM (js/levels.js)
   Defines Multi-Level Campaigns:
   - EVERY level has its own unique BOSS!
   - Sector themes & scalable difficulty parameters
   ===================================================== */

'use strict';

const LEVEL_CONFIGS = [
  // ── LEVEL 1: SECTOR ALPHA ────────────────────────────
  {
    level: 1,
    name: 'SECTOR ALPHA — RECON FIELD',
    color: '#00ff88',
    speedMultiplier: 0.85,
    shootRateMultiplier: 1.6,
    bulletSpeedMultiplier: 0.8,
    waves: [
      {
        title: '🎯 TARGET PRACTICE (3 SCOUTS)',
        enemies: [
          { type: 'scout', lane: 2.5, delay: 0 },
          { type: 'scout', lane: 1.5, delay: 40 },
          { type: 'scout', lane: 3.5, delay: 40 },
        ]
      },
      {
        title: '🛸 SCOUT FORMATION (4 SCOUTS)',
        enemies: [
          { type: 'scout', lane: 1.0, delay: 0 },
          { type: 'scout', lane: 2.0, delay: 30 },
          { type: 'scout', lane: 3.0, delay: 60 },
          { type: 'scout', lane: 4.0, delay: 90 },
        ]
      },
      {
        title: '👑 BOSS: V-DRONE COMMANDER',
        isBoss: true,
        enemies: []
      }
    ]
  },

  // ── LEVEL 2: ASTEROID BELT ───────────────────────────
  {
    level: 2,
    name: 'ASTEROID BELT — ARMORED FLEET',
    color: '#00eaff',
    speedMultiplier: 1.0,
    shootRateMultiplier: 1.1,
    bulletSpeedMultiplier: 1.0,
    waves: [
      {
        title: '🛸 ADVANCE PATROL',
        enemies: [
          { type: 'scout', lane: 1.2, delay: 0 },
          { type: 'scout', lane: 2.5, delay: 25 },
          { type: 'scout', lane: 3.8, delay: 50 },
        ]
      },
      {
        title: '🛡️ CRUISER BATTLE WEDGE',
        enemies: [
          { type: 'scout', lane: 1.0, delay: 0 },
          { type: 'cruiser', lane: 2.5, delay: 30 },
          { type: 'scout', lane: 4.0, delay: 0 },
        ]
      },
      {
        title: '👑 BOSS: CRUISER HEAVY DREAD',
        isBoss: true,
        enemies: []
      }
    ]
  },

  // ── LEVEL 3: NEBULA OUTPOST ──────────────────────────
  {
    level: 3,
    name: 'NEBULA OUTPOST — SWARM ASSAULT',
    color: '#ffaa00',
    speedMultiplier: 1.15,
    shootRateMultiplier: 0.9,
    bulletSpeedMultiplier: 1.15,
    waves: [
      {
        title: '⚡ SWARMER AMBUSH',
        enemies: [
          { type: 'swarmer', lane: 1.5, delay: 0 },
          { type: 'swarmer', lane: 3.5, delay: 25 },
          { type: 'cruiser', lane: 2.5, delay: 50 },
        ]
      },
      {
        title: '🛸 HEAVY SWARM INTERCEPT',
        enemies: [
          { type: 'scout', lane: 1.0, delay: 0 },
          { type: 'swarmer', lane: 2.0, delay: 30 },
          { type: 'cruiser', lane: 3.0, delay: 30 },
          { type: 'scout', lane: 4.0, delay: 0 },
        ]
      },
      {
        title: '👑 BOSS: NEBULA SWARM QUEEN',
        isBoss: true,
        enemies: []
      }
    ]
  },

  // ── LEVEL 4: DEEP COSMOS ─────────────────────────────
  {
    level: 4,
    name: 'DEEP COSMOS — DREAD SQUADRON',
    color: '#ff00aa',
    speedMultiplier: 1.25,
    shootRateMultiplier: 0.75,
    bulletSpeedMultiplier: 1.25,
    waves: [
      {
        title: '💣 BOMBER SIEGE & PHANTOMS',
        enemies: [
          { type: 'bomber', lane: 2.5, delay: 0 },
          { type: 'phantom', lane: 1.2, delay: 35 },
          { type: 'phantom', lane: 3.8, delay: 35 },
        ]
      },
      {
        title: '⚡ ELITE ARMADA INVASION',
        enemies: [
          { type: 'bomber', lane: 1.5, delay: 0 },
          { type: 'bomber', lane: 3.5, delay: 0 },
          { type: 'phantom', lane: 2.5, delay: 40 },
          { type: 'swarmer', lane: 1.0, delay: 70 },
          { type: 'swarmer', lane: 4.0, delay: 70 },
        ]
      },
      {
        title: '👑 BOSS: VOID FORTRESS TITAN',
        isBoss: true,
        enemies: []
      }
    ]
  },

  // ── LEVEL 5: MOTHER SHIP LAIR ────────────────────────
  {
    level: 5,
    name: 'MOTHER SHIP LAIR — FINAL BATTLE',
    color: '#ff0033',
    speedMultiplier: 1.35,
    shootRateMultiplier: 0.65,
    bulletSpeedMultiplier: 1.35,
    waves: [
      {
        title: '🛸 SUPREME HONOR GUARD',
        enemies: [
          { type: 'phantom', lane: 1.2, delay: 0 },
          { type: 'bomber', lane: 2.5, delay: 25 },
          { type: 'phantom', lane: 3.8, delay: 0 },
          { type: 'cruiser', lane: 1.8, delay: 50 },
          { type: 'cruiser', lane: 3.2, delay: 50 },
        ]
      },
      {
        title: '👑 SUPREME BOSS: DREADNOUGHT OMEGA',
        isBoss: true,
        enemies: []
      }
    ]
  }
];

function getLevelConfig(levelNum) {
  if (levelNum <= LEVEL_CONFIGS.length) {
    return LEVEL_CONFIGS[levelNum - 1];
  }
  const base = LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1];
  const excess = levelNum - LEVEL_CONFIGS.length;
  return {
    level: levelNum,
    name: `HYPERSPACE OVERDRIVE — SECTOR ${levelNum}`,
    color: '#00eaff',
    speedMultiplier: base.speedMultiplier + excess * 0.1,
    shootRateMultiplier: Math.max(0.35, base.shootRateMultiplier - excess * 0.05),
    bulletSpeedMultiplier: base.bulletSpeedMultiplier + excess * 0.1,
    waves: [
      {
        title: `HYPER SWARM FLEET`,
        enemies: [
          { type: 'phantom', lane: 1.5, delay: 0 },
          { type: 'bomber', lane: 3.5, delay: 0 },
          { type: 'cruiser', lane: 2.5, delay: 30 },
          { type: 'swarmer', lane: 1.0, delay: 60 },
          { type: 'swarmer', lane: 4.0, delay: 60 },
        ]
      },
      {
        title: `👑 HYPER OVERLORD ${levelNum}`,
        isBoss: true,
        enemies: []
      }
    ]
  };
}
