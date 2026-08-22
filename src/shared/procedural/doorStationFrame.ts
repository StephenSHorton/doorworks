import { cylinderBetween, part } from "./parts";

export type FrameStyle = "channel" | "industrial" | "strip" | "slim";

export interface DoorStationFrameAttributes {
	DoorNumber: number;
	Style: string;
}

export const DEFAULT_DOOR_STATION_FRAME_ATTRIBUTES: DoorStationFrameAttributes =
	{
		DoorNumber: 12,
		Style: "channel",
	};

export const FRAME_STYLES: FrameStyle[] = [
	"channel",
	"industrial",
	"strip",
	"slim",
];

function parseStyle(value: string): FrameStyle {
	for (const s of FRAME_STYLES) {
		if (s === value) return s;
	}
	return "channel";
}

const METAL = Color3.fromRGB(150, 154, 160);
const METAL_DARK = Color3.fromRGB(78, 82, 90);
const METAL_WARM = Color3.fromRGB(118, 110, 102);
const NEON_RED = Color3.fromRGB(220, 36, 40);

function addLight(parent: BasePart, brightness: number, range: number): void {
	const light = new Instance("PointLight");
	light.Color = Color3.fromRGB(255, 56, 56);
	light.Brightness = brightness;
	light.Range = range;
	light.Parent = parent;
}

/**
 * Separate metal surround for a closet door. Origin is the door slab center
 * (same space as generateClosetDoor). Equal jambs, heavier header, thin sill.
 */
export function generateDoorStationFrame(
	target: Instance,
	params: { size: Vector3; attributes: DoorStationFrameAttributes },
): void {
	const size = params.size;
	const style = parseStyle(params.attributes.Style);
	const w = size.X;
	const h = size.Y;
	const d = math.max(size.Z, 0.4);

	let jambW = 0.5;
	let headerH = 0.8;
	let sillH = 0.2;
	let frameD = d + 0.18;
	let metal = METAL;
	let headerMetal = METAL;

	if (style === "industrial") {
		jambW = 0.7;
		headerH = 1.05;
		sillH = 0.28;
		frameD = d + 0.28;
		metal = METAL_DARK;
		headerMetal = METAL;
	} else if (style === "strip") {
		jambW = 0.48;
		headerH = 0.7;
		sillH = 0.16;
		frameD = d + 0.14;
		metal = METAL;
		headerMetal = METAL_DARK;
	} else if (style === "slim") {
		jambW = 0.28;
		headerH = 0.5;
		sillH = 0.12;
		frameD = d + 0.1;
		metal = METAL_WARM;
		headerMetal = METAL_WARM;
	}

	const z = 0.04;
	const jambH = h + sillH;
	const jambY = -sillH / 2;

	part(
		target,
		"JambLeft",
		new Vector3(jambW, jambH, frameD),
		new CFrame(-w / 2 - jambW / 2, jambY, z),
		metal,
		Enum.Material.Metal,
	);
	part(
		target,
		"JambRight",
		new Vector3(jambW, jambH, frameD),
		new CFrame(w / 2 + jambW / 2, jambY, z),
		metal,
		Enum.Material.Metal,
	);
	part(
		target,
		"Header",
		new Vector3(w + jambW * 2, headerH, frameD),
		new CFrame(0, h / 2 + headerH / 2, z),
		headerMetal,
		Enum.Material.Metal,
	);
	part(
		target,
		"Sill",
		new Vector3(w, sillH, frameD),
		new CFrame(0, -h / 2 - sillH / 2, z),
		metal,
		Enum.Material.Metal,
	);

	if (style === "channel") {
		const lampH = 0.52;
		const lampD = 0.36;
		const cz = -frameD / 2 + 0.1;
		const baseY = h / 2 + headerH + 0.04;
		const base = new Vector3(0, baseY, cz);
		const tip = new Vector3(0, baseY + lampH, cz);
		const midY = baseY + lampH / 2;
		const beacon = cylinderBetween(
			target,
			"Beacon",
			lampD,
			base,
			tip,
			NEON_RED,
			Enum.Material.Neon,
		);
		addLight(beacon, 1.3, 12);
		cylinderBetween(
			target,
			"BeaconRing",
			lampD + 0.28,
			new Vector3(0, midY - 0.05, cz),
			new Vector3(0, midY + 0.05, cz),
			METAL,
			Enum.Material.Metal,
		);
	} else if (style === "industrial") {
		const beacon = part(
			target,
			"Beacon",
			new Vector3(0.5, 0.35, 0.5),
			new CFrame(
				-w / 2 - jambW / 2,
				h / 2 + headerH + 0.22,
				-frameD / 2 + 0.05,
			),
			NEON_RED,
			Enum.Material.Neon,
		);
		addLight(beacon, 1.4, 12);
		part(
			target,
			"HeaderLip",
			new Vector3(w + jambW * 2, 0.12, 0.16),
			new CFrame(0, h / 2 + 0.08, -frameD / 2 + 0.02),
			METAL_DARK,
			Enum.Material.DiamondPlate,
		);
	} else if (style === "strip") {
		const strip = part(
			target,
			"Beacon",
			new Vector3(w * 0.72, 0.14, 0.1),
			new CFrame(0, h / 2 + headerH * 0.15, -frameD / 2 - 0.02),
			NEON_RED,
			Enum.Material.Neon,
		);
		addLight(strip, 1.1, 10);
	} else {
		const strip = part(
			target,
			"Beacon",
			new Vector3(w + jambW * 1.2, 0.08, 0.06),
			new CFrame(0, h / 2 + 0.06, -frameD / 2 - 0.01),
			NEON_RED,
			Enum.Material.Neon,
		);
		addLight(strip, 0.9, 8);
	}
}
