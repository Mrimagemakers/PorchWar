# Porch War — County Line Brawlers

A Three.js/WebXR street-fighting mystery set in a small trailer-park town. Karen Smith accuses Hank and Bubba Miller of stealing tires from Rick’s garage, restarting a twenty-year family feud. Fight through the town’s street criminals, collect ten clues, identify the thief and earn the Best Neighbor Award.

## Run

Install Node.js 22 or later, run `npm start` (or `node server.mjs`) and open **http://localhost:4175/**. The server is static and has no package dependencies. Three.js r180 and the addons are bundled locally under their MIT license. Optional Google Fonts fall back to system fonts. Set `PORT` to use another port.

The source repository excludes the large local art pack. See [ASSETS.md](ASSETS.md) to install the supplied models, portraits and environment references. Without the pack, the game uses procedural fallback characters and surfaces.

## Play

Twelve adult fighters, ten distinct arenas, story mode and one-on-one battles against AI. Story stops contain two street encounters and a boss, followed by a searchable clue. The case board saves evidence; the final suspect puzzle requires all ten clues and a supported accusation. The town route is chapter-based, with one active opponent at a time.

Move with WASD, punch J, kick K, block I/L, grab or search E, special Q, dash Space, case board N and pause Escape. First-aid cartons restore health, props have durability, and consecutive strikes build combos. XP, levels, chapter progress and clues save in the browser.

Xbox and PlayStation controllers use the browser’s standard Gamepad mapping. Press a controller button after connecting by USB/Bluetooth. See [CONTROLS.md](CONTROLS.md) for mappings and menu navigation. Physical-controller testing remains outstanding.

## Art and animation

Thirteen supplied FBX files were exported to local GLB copies with their existing weighted skeletons preserved. Each has eight prototype gameplay clips. A runtime limb-direction correction handles differences between source bone coordinate systems. Character Studio previews models and animation states and saves provisional fighter assignments.

The newer supplied images are the target character art and appear as portraits for ten fighters. The older FBX models do not faithfully reproduce those portraits. Seven environment images guide six arena refinements: motel balconies and dusk lighting, speedway service lanes, parking-lot fixtures, market canopies, grocery stock and diner details. Selected local image crops provide surface textures. These remain real-time approximations, not photorealistic reconstructions.

Combat uses hand/foot strike boxes during active animation windows, facing checks and one damage event per swing. The game has one renderer loop. There are no duplicated character-loader loops from the supplied example code.

## WebXR

Use a supported headset browser over HTTPS. Localhost is only for development on the same device; a headset cannot use the PC’s localhost address. Thumbsticks move, triggers attack/advance, grip grabs and the secondary face button triggers a special. The game presents a third-person VR arena and in-world HUD rather than tracked physical punching. Headset performance and comfort still need hardware testing.

## Checks and limits

Run `npm run check` for syntax and eleven combat, progression, evidence and controller-input tests. A development harness also checked all thirty encounter transitions and the ten-clue ending with graphics mocked. All thirteen GLBs pass structural checks for skins, weights and required animation clips.

Full campaign balance, controller hardware, VR hardware, exact portrait-matched 3D meshes, polished animation, multiplayer, advanced prop physics and production audio remain unfinished. User-supplied source files were not modified. The repository does not assert redistribution rights for the separate art pack.

## Combat, navigation and stability update
Shared-screen multiplayer: Local Duel, Team Brawl and Local Co-op. Online rooms, matchmaking and remote network synchronization are not implemented.
Eight strikes include uppercut, body hook, leg sweep and two airborne kicks. Weapon reach/durability/recovery differ, with thrown weapons, named chains, health/grit pickups and temporary power. Story and one-on-one AI remain playable.
Expanded town bounds, swept obstacle sliding, AI pathfinding, sprint, orbit/zoom camera and minimap. H opens the field guide.
High is the default rendering preset. Ultra adds rendering detail within a 2.4-million-pixel limit; Performance reduces shadows and resolution. Inactive model cache entries are released, offscreen tabs pause, and graphics-context loss presents recovery. These safeguards reduce resource pressure but cannot guarantee that any GPU will never reset.
The project remains a browser prototype; its assets and procedural animation do not match the visual or animation fidelity of Street Fighter or Mortal Kombat X. Photo reskins project front-view photos onto existing meshes, so silhouette and unseen surfaces remain approximate.
Validation: 18 automated tests plus all 30 story encounters, ten clue pickups and final puzzle progression. Physical two-controller testing and long-session hardware testing remain outstanding.
Local environment reference copies were deduplicated because C: filled completely. The ignored local-assets.json maps their exact URLs to original uploaded PNGs in Downloads. Keep those originals in place, or copy them back to references/ when packaging on another computer.
