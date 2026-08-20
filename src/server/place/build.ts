import { CollectionService } from "@rbxts/services";
import {
	DOOR_HEIGHT,
	DOOR_THICKNESS,
	DOOR_WIDTH,
	PALETTE,
	PLAYGROUND_PAIR,
	PORTAL_PAIR_ATTRIBUTE,
	PORTAL_TAG,
	PORTALS_FOLDER_NAME,
	WORLD_NAME,
} from "shared/game";
import {
	DEFAULT_CLOSET_DOOR_ATTRIBUTES,
	generateClosetDoor,
} from "shared/procedural";

function makePart(
	name: string,
	size: Vector3,
	cframe: CFrame,
	color: Color3,
	parent: Instance,
	opts?: {
		material?: Enum.Material;
		canCollide?: boolean;
	},
): Part {
	const p = new Instance("Part");
	p.Name = name;
	p.Anchored = true;
	p.Size = size;
	p.CFrame = cframe;
	p.Color = color;
	p.Material = opts?.material ?? Enum.Material.SmoothPlastic;
	p.CanCollide = opts?.canCollide ?? true;
	p.TopSurface = Enum.SurfaceType.Smooth;
	p.BottomSurface = Enum.SurfaceType.Smooth;
	p.Parent = parent;
	return p;
}

function box(
	parent: Instance,
	name: string,
	size: Vector3,
	position: Vector3,
	color: Color3,
	material?: Enum.Material,
): Part {
	return makePart(name, size, new CFrame(position), color, parent, {
		material,
	});
}

function portalDoor(
	parent: Instance,
	name: string,
	pair: string,
	cframe: CFrame,
): Part {
	const door = makePart(
		name,
		new Vector3(DOOR_WIDTH, DOOR_HEIGHT, DOOR_THICKNESS),
		cframe,
		PALETTE.portalSurface,
		parent,
		{ material: Enum.Material.Neon, canCollide: false },
	);
	door.SetAttribute(PORTAL_PAIR_ATTRIBUTE, pair);
	CollectionService.AddTag(door, PORTAL_TAG);
	return door;
}

function standingClosetDoor(
	world: Folder,
	name: string,
	cframe: CFrame,
	color: Color3,
	doorNumber: number,
): CFrame {
	const model = new Instance("Model");
	model.Name = name;
	model.Parent = world;
	generateClosetDoor(model, {
		size: new Vector3(DOOR_WIDTH, DOOR_HEIGHT, 0.7),
		attributes: {
			...DEFAULT_CLOSET_DOOR_ATTRIBUTES,
			Color: color,
			DoorNumber: doorNumber,
			HangFromRail: true,
		},
	});
	model.PivotTo(cframe);
	return cframe;
}

function stack(
	parent: Instance,
	name: string,
	origin: Vector3,
	color: Color3,
	count: number,
): void {
	for (let i = 0; i < count; i++) {
		const size = 6 - i * 0.6;
		box(
			parent,
			`${name}${i}`,
			new Vector3(size, 3, size),
			origin.add(new Vector3(0, 1.5 + i * 3, 0)),
			color,
			Enum.Material.SmoothPlastic,
		);
	}
}

export function buildPlace(workspace: Workspace): Folder {
	for (const name of [
		WORLD_NAME,
		PORTALS_FOLDER_NAME,
		"SpawnLocation",
		"Baseplate",
	] as const) {
		const existing = workspace.FindFirstChild(name);
		if (existing) existing.Destroy();
	}

	const world = new Instance("Folder");
	world.Name = WORLD_NAME;
	world.Parent = workspace;

	const portals = new Instance("Folder");
	portals.Name = PORTALS_FOLDER_NAME;
	portals.Parent = workspace;

	const pad = new Instance("Model");
	pad.Name = "Pad";
	pad.Parent = world;

	box(
		pad,
		"Floor",
		new Vector3(140, 1, 140),
		new Vector3(0, 0.5, 0),
		PALETTE.pad,
		Enum.Material.Concrete,
	);

	// Distinct landmarks so looking *through* a door is obviously another place
	// on the pad, not the next room over.
	stack(pad, "RedStack", new Vector3(-8, 1, 0), PALETTE.red, 5);
	stack(pad, "CyanStack", new Vector3(36, 1, 28), PALETTE.cyan, 4);
	box(
		pad,
		"YellowRamp",
		new Vector3(18, 1, 8),
		new Vector3(36, 4, 8),
		PALETTE.yellow,
		Enum.Material.SmoothPlastic,
	).CFrame = new CFrame(new Vector3(36, 4, 8)).mul(
		CFrame.Angles(math.rad(-18), 0, 0),
	);
	box(
		pad,
		"MarkA",
		new Vector3(4, 0.2, 4),
		new Vector3(-32, 1.1, 0),
		PALETTE.mark,
	);
	box(
		pad,
		"MarkB",
		new Vector3(4, 0.2, 4),
		new Vector3(20, 1.1, 40),
		PALETTE.mark,
	);

	const doorA = CFrame.lookAt(
		new Vector3(-24, 1 + DOOR_HEIGHT / 2, 0),
		new Vector3(0, 1 + DOOR_HEIGHT / 2, 0),
	);
	const doorB = CFrame.lookAt(
		new Vector3(20, 1 + DOOR_HEIGHT / 2, 28),
		new Vector3(20, 1 + DOOR_HEIGHT / 2, 0),
	);
	standingClosetDoor(world, "DoorA", doorA, Color3.fromRGB(214, 96, 112), 12);
	standingClosetDoor(world, "DoorB", doorB, Color3.fromRGB(72, 148, 188), 7);
	portalDoor(portals, "PortalA", PLAYGROUND_PAIR, doorA);
	portalDoor(portals, "PortalB", PLAYGROUND_PAIR, doorB);

	const spawn = new Instance("SpawnLocation");
	spawn.Name = "SpawnLocation";
	spawn.Anchored = true;
	spawn.Size = new Vector3(6, 1, 6);
	spawn.CFrame = new CFrame(new Vector3(0, 1.5, 20));
	spawn.Neutral = true;
	spawn.Duration = 0;
	spawn.Transparency = 1;
	spawn.CanCollide = false;
	spawn.Parent = workspace;

	return world;
}
