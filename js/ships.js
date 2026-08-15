/* =====================================================
   🚀 SHIP CLASSES & WEAPON ARCHETYPES (js/ships.js)
   Defines selectable characters with unique playstyles:
   1. 🚀 PLASMA STRIKER   (Balanced Rapid-Fire)
   2. ⚡ THUNDER PHANTOM  (Agile Homing Lightning)
   3. 💥 VOID DESTROYER   (Heavy Explosive Cannons)
   4. 🔮 LASER VALKYRIE   (Continuous Piercing Quantum Beam)
   ===================================================== */

'use strict';

const SHIP_CLASSES = [
  {
    id: 'striker',
    name: 'PLASMA STRIKER',
    role: 'Balanced Interceptor',
    description: 'Rapid-fire plasma blasters with multi-directional spread!',
    color: '#00eaff',
    accentColor: '#0066cc',
    speed: 5.5,
    maxHp: 3,
    shootRate: 12,
    weaponName: 'Plasma Vulcan',
    icon: '🚀',
  },
  {
    id: 'phantom',
    name: 'THUNDER PHANTOM',
    role: 'Intelligent Auto-Targeter',
    description: 'High-tech tracking lightning bolts that seek out enemies automatically!',
    color: '#ffdd00',
    accentColor: '#ff8800',
    speed: 6.2,
    maxHp: 3,
    shootRate: 14,
    weaponName: 'Homing Arc Lightning',
    icon: '⚡',
  },
  {
    id: 'destroyer',
    name: 'VOID DESTROYER',
    role: 'Heavy Siege Artillery',
    description: 'Massive explosive shells that trigger area-of-effect shockwaves!',
    color: '#ff3344',
    accentColor: '#880011',
    speed: 4.8,
    maxHp: 4,
    shootRate: 18,
    weaponName: 'Explosive Photon Cannon',
    icon: '💥',
  },
  {
    id: 'valkyrie',
    name: 'LASER VALKYRIE',
    role: 'Piercing Energy Specialist',
    description: 'Piercing quantum lasers that melt through multiple enemies in a straight line!',
    color: '#00ff88',
    accentColor: '#008844',
    speed: 5.3,
    maxHp: 3,
    shootRate: 10,
    weaponName: 'Quantum Prism Laser',
    icon: '🔮',
  }
];

let selectedShipClass = SHIP_CLASSES[0];

function selectShipClass(classId) {
  const found = SHIP_CLASSES.find(s => s.id === classId);
  if (found) {
    selectedShipClass = found;
  }
}
