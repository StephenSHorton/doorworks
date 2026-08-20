# Doorworks

A single-place Roblox game: night-shift door factory. Closets on the floor are live portals — walk through and you are in the other room.

Built from [flamework-template](https://github.com/StephenSHorton/flamework-template) with [immersive-portals](https://github.com/StephenSHorton/immersive-portals).

This is an **original** factory/closet game. It is not Monsters, Inc., and it does not use Disney/Pixar characters, names, or branding.

## Stack

roblox-ts + Flamework + Charm + Lapis + Squash + [@rbxts/immersive-portals](https://github.com/StephenSHorton/immersive-portals)

## Quick start

```bash
bun install
rokit install
bun run build
bun run serve
```

In Studio, connect the Rojo plugin. Press Play. Walk toward the wooden closet and through it.

After a rebuild:

```bash
bun run push
```

## First slice

- Factory floor at the origin with one closet
- Matching bedroom 400 studs away
- Both door parts tagged `ImmersivePortal` with `PortalPair = closet-1`
- Scenery lives in `Workspace.World` (what the portal viewports clone)
- Door parts live in `Workspace.Portals` so they are not double-cloned into the view
