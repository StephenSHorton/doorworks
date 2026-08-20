import { CollectionService } from "@rbxts/services";
import {
	CLOSET_1_PAIR,
	DOOR_HEIGHT,
	DOOR_THICKNESS,
	DOOR_WIDTH,
	FACTORY_SIZE,
	FRAME_THICKNESS,
	PALETTE,
	PORTAL_PAIR_ATTRIBUTE,
	PORTAL_TAG,
	PORTALS_FOLDER_NAME,
	ROOM_OFFSET,
	ROOM_SIZE,
	WALL_HEIGHT,
	WORLD_NAME,
} from "shared/game";

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
	canCollide?: boolean,
): Part {
	return makePart(name, size, new CFrame(position), color, parent, {
		material,
		canCollide,
	});
}

function doorFrame(parent: Instance, doorCFrame: CFrame, color: Color3): void {
	const hw = DOOR_WIDTH / 2;
	const hh = DOOR_HEIGHT / 2;
	const t = FRAME_THICKNESS;
	const depth = DOOR_THICKNESS + 0.4;

	makePart(
		"FrameLeft",
		new Vector3(t, DOOR_HEIGHT + t, depth),
		doorCFrame.mul(new CFrame(-hw - t / 2, 0, 0)),
		color,
		parent,
		{ material: Enum.Material.Wood },
	);
	makePart(
		"FrameRight",
		new Vector3(t, DOOR_HEIGHT + t, depth),
		doorCFrame.mul(new CFrame(hw + t / 2, 0, 0)),
		color,
		parent,
		{ material: Enum.Material.Wood },
	);
	makePart(
		"FrameTop",
		new Vector3(DOOR_WIDTH + t * 2, t, depth),
		doorCFrame.mul(new CFrame(0, hh + t / 2, 0)),
		color,
		parent,
		{ material: Enum.Material.Wood },
	);
	makePart(
		"Threshold",
		new Vector3(DOOR_WIDTH + t * 2, 0.3, depth + 0.4),
		doorCFrame.mul(new CFrame(0, -hh - 0.15, 0.2)),
		color,
		parent,
		{ material: Enum.Material.Wood },
	);
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

function enclosure(
	parent: Instance,
	floorCenter: Vector3,
	floorSize: Vector3,
	wallColor: Color3,
	ceilingColor: Color3,
	door?: { wall: "negZ" | "negX"; width: number; height: number },
): void {
	const floorTop = floorCenter.Y + floorSize.Y / 2;
	const wallCenterY = floorTop + WALL_HEIGHT / 2;
	const hx = floorSize.X / 2;
	const hz = floorSize.Z / 2;
	const t = 1;

	const wall = (
		name: string,
		size: Vector3,
		position: Vector3,
		color: Color3,
	) => box(parent, name, size, position, color);

	if (door?.wall === "negZ") {
		const gap = door.width / 2;
		const side = hx - gap;
		wall(
			"WallNegZLeft",
			new Vector3(side, WALL_HEIGHT, t),
			new Vector3(
				floorCenter.X - gap - side / 2,
				wallCenterY,
				floorCenter.Z - hz,
			),
			wallColor,
		);
		wall(
			"WallNegZRight",
			new Vector3(side, WALL_HEIGHT, t),
			new Vector3(
				floorCenter.X + gap + side / 2,
				wallCenterY,
				floorCenter.Z - hz,
			),
			wallColor,
		);
		const lintelH = WALL_HEIGHT - door.height;
		wall(
			"WallNegZLintel",
			new Vector3(door.width, lintelH, t),
			new Vector3(
				floorCenter.X,
				floorTop + door.height + lintelH / 2,
				floorCenter.Z - hz,
			),
			wallColor,
		);
	} else {
		wall(
			"WallNegZ",
			new Vector3(floorSize.X + t, WALL_HEIGHT, t),
			new Vector3(floorCenter.X, wallCenterY, floorCenter.Z - hz),
			wallColor,
		);
	}

	if (door?.wall === "negX") {
		const gap = door.width / 2;
		const side = hz - gap;
		wall(
			"WallNegXLeft",
			new Vector3(t, WALL_HEIGHT, side),
			new Vector3(
				floorCenter.X - hx,
				wallCenterY,
				floorCenter.Z - gap - side / 2,
			),
			wallColor,
		);
		wall(
			"WallNegXRight",
			new Vector3(t, WALL_HEIGHT, side),
			new Vector3(
				floorCenter.X - hx,
				wallCenterY,
				floorCenter.Z + gap + side / 2,
			),
			wallColor,
		);
		const lintelH = WALL_HEIGHT - door.height;
		wall(
			"WallNegXLintel",
			new Vector3(t, lintelH, door.width),
			new Vector3(
				floorCenter.X - hx,
				floorTop + door.height + lintelH / 2,
				floorCenter.Z,
			),
			wallColor,
		);
	} else {
		wall(
			"WallNegX",
			new Vector3(t, WALL_HEIGHT, floorSize.Z + t),
			new Vector3(floorCenter.X - hx, wallCenterY, floorCenter.Z),
			wallColor,
		);
	}

	wall(
		"WallPosZ",
		new Vector3(floorSize.X + t, WALL_HEIGHT, t),
		new Vector3(floorCenter.X, wallCenterY, floorCenter.Z + hz),
		wallColor,
	);
	wall(
		"WallPosX",
		new Vector3(t, WALL_HEIGHT, floorSize.Z + t),
		new Vector3(floorCenter.X + hx, wallCenterY, floorCenter.Z),
		wallColor,
	);
	wall(
		"Ceiling",
		new Vector3(floorSize.X + t, 1, floorSize.Z + t),
		new Vector3(floorCenter.X, floorTop + WALL_HEIGHT, floorCenter.Z),
		ceilingColor,
	);
}

function buildFactory(world: Folder): CFrame {
	const factory = new Instance("Model");
	factory.Name = "Factory";
	factory.Parent = world;

	const floorCenter = new Vector3(0, FACTORY_SIZE.Y / 2, 0);
	const floorTop = floorCenter.Y + FACTORY_SIZE.Y / 2;
	box(
		factory,
		"Floor",
		FACTORY_SIZE,
		floorCenter,
		PALETTE.factoryFloor,
		Enum.Material.Concrete,
	);
	enclosure(
		factory,
		floorCenter,
		FACTORY_SIZE,
		PALETTE.factoryWall,
		Color3.fromRGB(28, 32, 38),
		{ wall: "negZ", width: DOOR_WIDTH, height: DOOR_HEIGHT },
	);
	box(
		factory,
		"StationStripe",
		new Vector3(DOOR_WIDTH + 6, 0.2, 4),
		new Vector3(0, floorTop + 0.1, -FACTORY_SIZE.Z / 2 + 3),
		PALETTE.factoryAccent,
		Enum.Material.Metal,
	);

	const doorPos = new Vector3(
		0,
		floorTop + DOOR_HEIGHT / 2,
		-FACTORY_SIZE.Z / 2,
	);
	const doorCFrame = CFrame.lookAt(doorPos, doorPos.add(new Vector3(0, 0, 1)));
	doorFrame(factory, doorCFrame, PALETTE.doorFrame);
	return doorCFrame;
}

function buildCloset(world: Folder): CFrame {
	const closet = new Instance("Model");
	closet.Name = "Closet";
	closet.Parent = world;

	const floorCenter = ROOM_OFFSET.add(new Vector3(0, ROOM_SIZE.Y / 2, 0));
	const floorTop = floorCenter.Y + ROOM_SIZE.Y / 2;
	box(
		closet,
		"Floor",
		ROOM_SIZE,
		floorCenter,
		PALETTE.roomFloor,
		Enum.Material.WoodPlanks,
	);
	enclosure(
		closet,
		floorCenter,
		ROOM_SIZE,
		PALETTE.roomWall,
		PALETTE.roomCeiling,
		{ wall: "negX", width: DOOR_WIDTH, height: DOOR_HEIGHT },
	);
	box(
		closet,
		"BedBase",
		new Vector3(8, 1.2, 12),
		ROOM_OFFSET.add(new Vector3(6, 1.6, 0)),
		PALETTE.bed,
		Enum.Material.Fabric,
	);
	box(
		closet,
		"Bedsheet",
		new Vector3(7.6, 0.3, 11.4),
		ROOM_OFFSET.add(new Vector3(6, 2.3, 0)),
		PALETTE.bedsheet,
		Enum.Material.Fabric,
	);
	box(
		closet,
		"Nightstand",
		new Vector3(2, 2, 2),
		ROOM_OFFSET.add(new Vector3(6, 2, -8)),
		PALETTE.doorFrame,
		Enum.Material.Wood,
	);

	const doorCFrame = CFrame.lookAt(
		new Vector3(
			ROOM_OFFSET.X - ROOM_SIZE.X / 2,
			floorTop + DOOR_HEIGHT / 2,
			ROOM_OFFSET.Z,
		),
		new Vector3(ROOM_OFFSET.X, floorTop + DOOR_HEIGHT / 2, ROOM_OFFSET.Z),
	);
	doorFrame(closet, doorCFrame, PALETTE.doorFrame);
	return doorCFrame;
}

export function buildPlace(workspace: Workspace): Folder {
	const existingWorld = workspace.FindFirstChild(WORLD_NAME);
	if (existingWorld) existingWorld.Destroy();
	const existingPortals = workspace.FindFirstChild(PORTALS_FOLDER_NAME);
	if (existingPortals) existingPortals.Destroy();
	const existingSpawn = workspace.FindFirstChild("SpawnLocation");
	if (existingSpawn) existingSpawn.Destroy();

	const world = new Instance("Folder");
	world.Name = WORLD_NAME;
	world.Parent = workspace;

	const portals = new Instance("Folder");
	portals.Name = PORTALS_FOLDER_NAME;
	portals.Parent = workspace;

	const factoryDoor = buildFactory(world);
	const closetDoor = buildCloset(world);
	portalDoor(portals, "Closet1Factory", CLOSET_1_PAIR, factoryDoor);
	portalDoor(portals, "Closet1Room", CLOSET_1_PAIR, closetDoor);

	const spawn = new Instance("SpawnLocation");
	spawn.Name = "SpawnLocation";
	spawn.Anchored = true;
	spawn.Size = new Vector3(6, 1, 6);
	spawn.CFrame = new CFrame(new Vector3(0, 1.5, 10));
	spawn.Neutral = true;
	spawn.Duration = 0;
	spawn.Transparency = 1;
	spawn.CanCollide = false;
	spawn.Parent = workspace;

	return world;
}
