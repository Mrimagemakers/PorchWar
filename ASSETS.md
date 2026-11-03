# Local art pack

The source repository is intentionally separate from the large user-supplied art pack. Copy the `models/rigged`, `portraits`, and `references` folders from the complete local Porch War bundle into the same paths in this checkout.

The game can run with procedural characters and surfaces if those folders are absent. Character Studio requires the GLBs. Missing portrait files are hidden automatically. Files are loaded locally; no model-generation service is required.

There are thirteen converted characters: `character-00.glb` corresponds to `character.fbx`; `character-01.glb` through `character-12.glb` correspond to the numbered FBX source files. Existing weighted skeletons were preserved. Eight procedural gameplay clips are included: Idle, Walk, Punch, Kick, Block, Hit, Special and KO. The browser also corrects limb directions across the different imported bone coordinate systems. These are prototype animation motions, not motion-captured finished fight animations.

Default civilian skin assignments are provisional. The new portrait illustrations are the target designs; the earlier FBX models do not reproduce those illustrations. Use Character Studio to inspect and assign source skins. The six fantasy, horror and military models are available as alternate skins, not the defaults for the family roster.

The ten portrait images map to Becky, Ricky, Kevin, Lucy, Charlie, Debbie, Hank, Jolene, Earl and Mr. Ronnie. Bubba and Karen have no new supplied portrait in this set.

Seven environment images guide six arenas; two are diner views. Their layout, lighting and surface details informed the 3D scenery. Small local image crops provide selected material textures. The arenas remain real-time 3D approximations, not exact photorealistic reconstructions.

All art was supplied by the project owner. Source FBX files were not modified. No rights or licenses for redistributing those assets are asserted by this source repository. Three.js and its bundled addons retain their MIT license in `vendor/THREE-LICENSE.txt`.
