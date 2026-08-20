import { CollectionService } from "@rbxts/services";
import { disk, part, shade } from "./parts";

export interface ClosetDoorAttributes {
	DoorNumber: number;
	StileWidth: number;
	RailHeight: number;
	KnobRight: boolean;
	Color: Color3;
	PortalPair: string;
}

export const DEFAULT_CLOSET_DOOR_ATTRIBUTES: ClosetDoorAttributes = {
	DoorNumber: 12,
	StileWidth: 0.85,
	RailHeight: 0.78,
	KnobRight: true,
	Color: Color3.fromRGB(232, 228, 218),
	PortalPair: "playground",
};

export interface ClosetDoorParams {
	size: Vector3;
	attributes: ClosetDoorAttributes;
}

function rectangularMolding(
	parent: Instance,
	tag: string,
	cx: number,
	cy: number,
	pw: number,
	ph: number,
	z: number,
	mold: number,
	color: Color3,
): void {
	part(
		parent,
		`MoldTop${tag}`,
		new Vector3(pw, mold, 0.07),
		new CFrame(cx, cy + ph / 2 - mold / 2, z),
		color,
		Enum.Material.Wood,
	);
	part(
		parent,
		`MoldBottom${tag}`,
		new Vector3(pw, mold, 0.07),
		new CFrame(cx, cy - ph / 2 + mold / 2, z),
		color,
		Enum.Material.Wood,
	);
	part(
		parent,
		`MoldLeft${tag}`,
		new Vector3(mold, ph, 0.07),
		new CFrame(cx - pw / 2 + mold / 2, cy, z),
		color,
		Enum.Material.Wood,
	);
	part(
		parent,
		`MoldRight${tag}`,
		new Vector3(mold, ph, 0.07),
		new CFrame(cx + pw / 2 - mold / 2, cy, z),
		color,
		Enum.Material.Wood,
	);
}

function colonialPanel(
	parent: Instance,
	tag: string,
	cx: number,
	cy: number,
	pw: number,
	ph: number,
	depth: number,
	fill: Color3,
	trim: Color3,
	arched: boolean,
): void {
	const mold = math.clamp(math.min(pw, ph) * 0.09, 0.09, 0.18);
	const zFront = -depth / 2 - 0.03;
	const zFill = -depth / 2 + 0.1;
	const innerW = pw - mold * 2;
	const innerH = ph - mold * 2;

	if (!arched) {
		part(
			parent,
			`PanelFill${tag}`,
			new Vector3(innerW, innerH, 0.14),
			new CFrame(cx, cy, zFill),
			fill,
			Enum.Material.Wood,
		);
		rectangularMolding(parent, tag, cx, cy, pw, ph, zFront, mold, trim);
		return;
	}

	const archR = innerW / 2;
	const rectH = math.max(innerH - archR * 0.92, innerH * 0.42);
	const rectBottom = cy - ph / 2 + mold;
	const rectCy = rectBottom + rectH / 2;
	const archCy = rectBottom + rectH;

	part(
		parent,
		`PanelFill${tag}`,
		new Vector3(innerW, rectH, 0.14),
		new CFrame(cx, rectCy, zFill),
		fill,
		Enum.Material.Wood,
	);
	disk(
		parent,
		`PanelArch${tag}`,
		innerW,
		0.14,
		new CFrame(cx, archCy, zFill),
		fill,
		Enum.Material.Wood,
	);
	disk(
		parent,
		`PanelArchMold${tag}`,
		innerW + mold * 1.6,
		0.07,
		new CFrame(cx, archCy, zFront),
		trim,
		Enum.Material.Wood,
	);

	const moldH = rectH + mold;
	const moldCy = rectBottom - mold / 2 + moldH / 2;
	part(
		parent,
		`MoldBottom${tag}`,
		new Vector3(pw, mold, 0.07),
		new CFrame(cx, cy - ph / 2 + mold / 2, zFront),
		trim,
		Enum.Material.Wood,
	);
	part(
		parent,
		`MoldLeft${tag}`,
		new Vector3(mold, moldH, 0.07),
		new CFrame(cx - pw / 2 + mold / 2, moldCy, zFront),
		trim,
		Enum.Material.Wood,
	);
	part(
		parent,
		`MoldRight${tag}`,
		new Vector3(mold, moldH, 0.07),
		new CFrame(cx + pw / 2 - mold / 2, moldCy, zFront),
		trim,
		Enum.Material.Wood,
	);
}

/**
 * Four-panel colonial closet door only. Station frame and holder are
 * separate ProceduralModels.
 *
 * @see https://create.roblox.com/docs/parts/procedural-models
 */
export function generateClosetDoor(
	target: Instance,
	params: ClosetDoorParams,
): void {
	const size = params.size;
	const a = params.attributes;
	const wood = a.Color;
	const trim = shade(wood, 0.82);
	const fill = shade(wood, 1.04);
	const brass = Color3.fromRGB(196, 152, 72);
	const depth = math.max(size.Z, 0.55);

	const portal = part(
		target,
		"PortalPlane",
		new Vector3(size.X - 0.15, size.Y - 0.15, 0.28),
		new CFrame(0, 0, depth / 2 - 0.08),
		Color3.fromRGB(18, 18, 24),
		Enum.Material.Neon,
	);
	portal.CanCollide = false;
	portal.SetAttribute("PortalPair", a.PortalPair);
	CollectionService.AddTag(portal, "ImmersivePortal");

	const stile = math.clamp(a.StileWidth, 0.5, size.X / 3);
	const rail = math.clamp(a.RailHeight, 0.45, size.Y / 5);
	const innerW = size.X - stile * 2;
	const innerH = size.Y - rail * 2;
	const mullion = stile * 0.62;
	const lockRail = rail * 0.85;

	part(
		target,
		"LeftStile",
		new Vector3(stile, size.Y, depth),
		new CFrame(-size.X / 2 + stile / 2, 0, 0),
		wood,
		Enum.Material.Wood,
	);
	part(
		target,
		"RightStile",
		new Vector3(stile, size.Y, depth),
		new CFrame(size.X / 2 - stile / 2, 0, 0),
		wood,
		Enum.Material.Wood,
	);
	part(
		target,
		"TopRail",
		new Vector3(innerW, rail, depth),
		new CFrame(0, size.Y / 2 - rail / 2, 0),
		wood,
		Enum.Material.Wood,
	);
	part(
		target,
		"BottomRail",
		new Vector3(innerW, rail, depth),
		new CFrame(0, -size.Y / 2 + rail / 2, 0),
		wood,
		Enum.Material.Wood,
	);

	const lowerShare = 0.4;
	const lowerH = innerH * lowerShare;
	const upperH = innerH - lowerH - lockRail;
	const lockY = -innerH / 2 + lowerH + lockRail / 2;

	part(
		target,
		"LockRail",
		new Vector3(innerW, lockRail, depth),
		new CFrame(0, lockY, 0),
		wood,
		Enum.Material.Wood,
	);
	part(
		target,
		"Mullion",
		new Vector3(mullion, innerH, depth),
		new CFrame(0, 0, 0),
		wood,
		Enum.Material.Wood,
	);

	const cellW = (innerW - mullion) / 2;
	const leftX = -innerW / 2 + cellW / 2;
	const rightX = innerW / 2 - cellW / 2;
	const lowerCy = -innerH / 2 + lowerH / 2;
	const upperCy = lockY + lockRail / 2 + upperH / 2;
	const pad = 0.12;

	colonialPanel(
		target,
		"LL",
		leftX,
		lowerCy,
		cellW - pad,
		lowerH - pad,
		depth,
		fill,
		trim,
		false,
	);
	colonialPanel(
		target,
		"LR",
		rightX,
		lowerCy,
		cellW - pad,
		lowerH - pad,
		depth,
		fill,
		trim,
		false,
	);
	colonialPanel(
		target,
		"UL",
		leftX,
		upperCy,
		cellW - pad,
		upperH - pad,
		depth,
		fill,
		trim,
		true,
	);
	colonialPanel(
		target,
		"UR",
		rightX,
		upperCy,
		cellW - pad,
		upperH - pad,
		depth,
		fill,
		trim,
		true,
	);

	const knobX = a.KnobRight ? size.X / 2 - stile / 2 : -size.X / 2 + stile / 2;
	const knob = part(
		target,
		"Knob",
		new Vector3(0.32, 0.32, 0.32),
		new CFrame(knobX, lockY + 0.15, -depth / 2 - 0.22),
		brass,
		Enum.Material.Metal,
	);
	knob.Shape = Enum.PartType.Ball;
	part(
		target,
		"LockPlate",
		new Vector3(0.22, 0.55, 0.06),
		new CFrame(knobX, lockY - 0.35, -depth / 2 - 0.06),
		brass,
		Enum.Material.Metal,
	);
}
