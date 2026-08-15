# 🚀 Retro 2D Space Shooter

A complete retro arcade space shooter built directly for the web browser with pure HTML5 Canvas and JavaScript!

---

## 🕹️ Controls

| Action | Desktop Keys | Mobile Controls |
|---|---|---|
| **Move** | Arrow Keys or `W`, `A`, `S`, `D` | On-screen D-Pad (▲ ◀ ▼ ▶) |
| **Shoot** | `SPACEBAR` | On-screen 🔥 button |
| **Mute / Unmute** | Click 🔊 in top-right | Click 🔊 button |

---

## 🌌 Multi-Level Difficulty Progression (Easy → Hard)

| Level / Sector | Sector Name | Alien Types Introduced | Speed & Shoot Rate | What to Expect |
|---|---|---|---|---|
| 🟢 **Level 1** | **Sector Alpha — Recon Field** | 🟢 Scouts (1 HP) | Slow speed, no shooting in Wave 1 | **Easy Warmup / Target Practice** |
| 🔵 **Level 2** | **Asteroid Belt — Armored Fleet** | 🟢 Scouts + 🟠 Cruisers (3 HP) | Medium speed, twin wing lasers | **Cruisers stay on screen with ❤️❤️❤️ bars** |
| 🟠 **Level 3** | **Nebula Outpost — Swarm Assault** | 🟣 Swarmers (2 HP) + Cruisers | Fast sweeping swoops, aimed sniper shots | **Intense tactical dogfights** |
| 🔴 **Level 4** | **Deep Cosmos — Dread Squadron** | 🔴 Bombers (4 HP) + ⚡ Phantoms (2 HP) | High speed, cluster bombs, cloaking | **Cluster bombs split into 3 spreading pellets!** |
| 👑 **Level 5** | **Mother Ship Lair — Final Battle** | Full Armada Vanguard + 👑 **Boss** | Maximum speed, 3 boss phases | **The Epic Dreadnought Omega showdown!** |
| 🚀 **Level 6+** | **Hyperspace Overdrive (Endless)** | Infinite Scaling Horde | Scaled speed & bullet velocity | **Compete for infinite high scores!** |

---

## 👾 5 Unique Alien Archetypes

- 🟢 **Scout** (1 HP): Agile recon drone, single plasma pulse.
- 🟠 **Cruiser** (3 HP): Heavy battleship with twin wing cannons. Persistent on screen with ❤️❤️❤️ bar.
- 🟣 **Swarmer** (2 HP): Fast zig-zagger firing aimed sniper shots. Persistent with ❤️❤️ bar.
- 🔴 **Bomber** (4 HP): Heavy siege gunship that fires **Cluster Bombs (💣)** which split into 3 bullets!
- ⚡ **Phantom** (2 HP): Stealth infiltrator that **cloaks with fading alpha** and fires high-speed sniper beams!

---

## ⭐ 4 Collectible Power-Ups

- ⚡ **Speed Boost**: Supercharges ship speed and engine flames.
- 💥 **Triple Shot**: Fires a 3-way laser spread.
- 🛡️ **Shield**: Projects a protective forcefield that absorbs hits.
- ❤️ **Extra Life**: Restores a lost heart up to max 5!

---

## 🧩 Modular Code Architecture (`js/`)

```
space-shooter/
├── index.html        ← UI layout, HUD, and overlay state screens
├── style.css         ← Retro arcade typography, buttons & animations
├── README.md         ← Game guide and architecture summary
└── js/
    ├── audio.js      ← 8-bit sound synth & background battle music
    ├── stars.js      ← Parallax scrolling 3D starfield
    ├── particles.js  ← Particle explosions, sparks & fireworks
    ├── lasers.js     ← Projectile physics, cluster bombs & beams
    ├── powerups.js   ← Power-up capsule drops & floating physics
    ├── player.js     ← Spaceship controls & canvas rendering
    ├── levels.js     ← Multi-level scaling, sector configs & tactical waves
    ├── enemies.js    ← 5 Alien types, cloaking, cluster weapons & heart bars
    ├── boss.js       ← Dreadnought Omega 3-phase boss battle
    └── game.js       ← Master game loop, states, collisions & HUD
```
