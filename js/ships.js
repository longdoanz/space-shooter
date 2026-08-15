/* =====================================================
   🚀 SHIP & WEAPON ARCHETYPES (js/ships.js)
   5 Distinct Weapon Archetypes & Signature Powers:
   1. 🚀 PLASMA VULCAN      (Rapid Multidirectional Spread)
   2. ⚡ TESLA LIGHTNING    (Intelligent Homing Electric Arc)
   3. 💥 ANTIMATTER CANNON  (Massive Heavy AoE Shockwaves)
   4. 🔮 QUANTUM DEATH RAY  (Piercing Continuous Laser Beam)
   5. 🌀 VORTEX RAZOR       (Slicing Boomerang Energy Blades)
   ===================================================== */

'use strict';

const WEAPON_ARCHETYPES = [
  {
    id: 'plasma',
    name: 'PLASMA VULCAN',
    tag: 'RAPID SPREAD',
    color: '#00eaff',
    accentColor: '#0066cc',
    icon: '🚀',
    shootRate: 11,
    sfx: 'laser_plasma',
    description: 'Rapid multi-directional plasma blasters (Lv5: Plasma Storm)!'
  },
  {
    id: 'homing',
    name: 'TESLA LIGHTNING',
    tag: 'AUTO SEEKER',
    color: '#ffdd00',
    accentColor: '#ff8800',
    icon: '⚡',
    shootRate: 14,
    sfx: 'laser_lightning',
    description: 'Crackling electric lightning that seeks down aliens automatically!'
  },
  {
    id: 'explosive',
    name: 'ANTIMATTER CANNON',
    tag: 'HEAVY AOE',
    color: '#ff3344',
    accentColor: '#880011',
    icon: '💥',
    shootRate: 17,
    sfx: 'laser_rocket',
    description: 'Devastating explosive shells that trigger screen-shaking blast shockwaves!'
  },
  {
    id: 'piercing',
    name: 'QUANTUM DEATH RAY',
    tag: 'BEAM PIERCER',
    color: '#00ff88',
    accentColor: '#008844',
    icon: '🔮',
    shootRate: 10,
    sfx: 'laser_quantum',
    description: 'Continuous ultra-bright laser beams that slice through lines of enemies!'
  },
  {
    id: 'vortex',
    name: 'VORTEX RAZOR',
    tag: 'BOOMERANG SLICE',
    color: '#a020f0',
    accentColor: '#5500aa',
    icon: '🌀',
    shootRate: 13,
    sfx: 'laser_vortex',
    description: 'Spinning energy razor discs that cut enemies and loop back like a boomerang!'
  }
];

const SHIP_CLASSES = [
  {
    id: 'striker',
    name: 'PLASMA STRIKER',
    weaponType: 'plasma',
    speed: 5.6,
    maxHp: 3,
    icon: '🚀',
  },
  {
    id: 'phantom',
    name: 'THUNDER PHANTOM',
    weaponType: 'homing',
    speed: 6.2,
    maxHp: 3,
    icon: '⚡',
  },
  {
    id: 'destroyer',
    name: 'VOID DESTROYER',
    weaponType: 'explosive',
    speed: 4.8,
    maxHp: 4,
    icon: '💥',
  },
  {
    id: 'valkyrie',
    name: 'LASER VALKYRIE',
    weaponType: 'piercing',
    speed: 5.3,
    maxHp: 3,
    icon: '🔮',
  },
  {
    id: 'blade',
    name: 'VORTEX CYCLONE',
    weaponType: 'vortex',
    speed: 5.8,
    maxHp: 3,
    icon: '🌀',
  }
];

let selectedShipClass = SHIP_CLASSES[0];

function selectShipClass(classId) {
  const found = SHIP_CLASSES.find(s => s.id === classId);
  if (found) {
    selectedShipClass = found;
  }
}

function getWeaponProfile(weaponId) {
  return WEAPON_ARCHETYPES.find(w => w.id === weaponId) || WEAPON_ARCHETYPES[0];
}
