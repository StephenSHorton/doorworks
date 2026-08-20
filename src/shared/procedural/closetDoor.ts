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
	StileWidth: 0.55,
	RailHeight: 0.55,
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
	thick: number,
	color: Color3,
): void {
	part(
		parent,
		`MoldTop${tag}`,
		new Vector3(pw, mold, thick),
		new CFrame(cx, cy + ph / 2 - mold / 2, z),
		color,
		Enum.Material.Wood,
	);
	part(
		parent,
		`MoldBottom${tag}`,
		new Vector3(pw, mold, thick),
		new CFrame(cx, cy - ph / 2 + mold / 2, z),
		color,
		Enum.Material.Wood,
	);
	part(
		parent,
		`MoldLeft${tag}`,
		new Vector3(mold, ph, thick),
		new CFrame(cx - pw / 2 + mold / 2, cy, z),
		color,
		Enum.Material.Wood,
	);
	part(
		parent,
		`MoldRight${tag}`,
		new Vector3(mold, ph, thick),
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
	front: number,
	dip: number,
	fill: Color3,
	trim: Color3,
	arched: boolean,
): void {
	const mold = math.clamp(math.min(pw, ph) * 0.1, 0.08, 0.14);
	const fillThick = dip;
	const moldThick = dip * 0.45;
	// Fill sits in the pocket: its front face is `dip` behind the slab front.
	const zFill = front + dip + fillThick / 2;
	// Molding sits in the pocket lip, overlapping slab + fill via CFrame.
	const zMold = front + moldThick / 2;
	const innerW = pw - mold * 2;
	const innerH = ph - mold * 2;

	if (!arched) {
		part(
			parent,
			`PanelFill${tag}`,
			new Vector3(innerW, innerH, fillThick),
			new CFrame(cx, cy, zFill),
			fill,
			Enum.Material.Wood,
		);
		rectangularMolding(
			parent,
			tag,
			cx,
			cy,
			pw,
			ph,
			zMold,
			mold,
			moldThick,
			trim,
		);
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
		new Vector3(innerW, rectH, fillThick),
		new CFrame(cx, rectCy, zFill),
		fill,
		Enum.Material.Wood,
	);
	disk(
		parent,
		`PanelArch${tag}`,
		innerW,
		fillThick,
		new CFrame(cx, archCy, zFill),
		fill,
		Enum.Material.Wood,
	);
	disk(
		parent,
		`PanelArchMold${tag}`,
		innerW + mold * 1.7,
		moldThick,
		new CFrame(cx, archCy, zMold),
		trim,
		Enum.Material.Wood,
	);

	const moldH = rectH + mold;
	const moldCy = rectBottom - mold / 2 + moldH / 2;
	part(
		parent,
		`MoldBottom${tag}`,
		new Vector3(pw, mold, moldThick),
		new CFrame(cx, cy - ph / 2 + mold / 2, zMold),
		trim,
		Enum.Material.Wood,
	);
	part(
		parent,
		`MoldLeft${tag}`,
		new Vector3(mold, moldH, moldThick),
		new CFrame(cx - pw / 2 + mold / 2, moldCy, zMold),
		trim,
		Enum.Material.Wood,
	);
	part(
		parent,
		`MoldRight${tag}`,
		new Vector3(mold, moldH, moldThick),
		new CFrame(cx + pw / 2 - mold / 2, moldCy, zMold),
		trim,
		Enum.Material.Wood,
	);
}

/**
 * Four-panel colonial closet door. Recesses are CFrame'd into the slab
 * (never Position — that depenetrates). Portal plane is invisible.
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
	const trim = shade(wood, 0.88);
	const fill = shade(wood, 0.92);
	const brass = Color3.fromRGB(196, 152, 72);
	const depth = math.max(size.Z, 0.35);
	const front = -depth / 2;
	const dip = math.clamp(depth * 0.35, 0.1, 0.16);

	const portal = part(
		target,
		"PortalPlane",
		new Vector3(size.X - 0.1, size.Y - 0.1, 0.2),
		new CFrame(0, 0, depth / 2 - 0.05),
		Color3.fromRGB(18, 18, 24),
		Enum.Material.SmoothPlastic,
	);
	portal.Transparency = 1;
	portal.CanCollide = false;
	portal.CastShadow = false;
	portal.SetAttribute("PortalPair", a.PortalPair);
	CollectionService.AddTag(portal, "ImmersivePortal");

	part(
		target,
		"Slab",
		new Vector3(size.X, size.Y, depth),
		new CFrame(0, 0, 0),
		wood,
		Enum.Material.Wood,
	);

	const stile = math.clamp(a.StileWidth, 0.35, size.X / 3);
	const rail = math.clamp(a.RailHeight, 0.35, size.Y / 5);
	const innerW = size.X - stile * 2;
	const innerH = size.Y - rail * 2;
	const mullion = stile * 0.55;
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
	const pad = 0.06;

	colonialPanel(
		target,
		"LL",
		leftX,
		lowerCy,
		cellW - pad,
		lowerH - pad,
		front,
		dip,
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
		front,
		dip,
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
		front,
		dip,
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
		front,
		dip,
		fill,
		trim,
		true,
	);

	const knobX = a.KnobRight ? size.X / 2 - stile / 2 : -size.X / 2 + stile / 2;
	part(
		target,
		"Knob",
		new Vector3(0.22, 0.22, 0.22),
		new CFrame(knobX, lockY + 0.12, front - 0.12),
		brass,
		Enum.Material.Metal,
		Enum.PartType.Ball,
	);
	part(
		target,
		"LockPlate",
		new Vector3(0.16, 0.4, 0.05),
		new CFrame(knobX, lockY - 0.28, front - 0.02),
		brass,
		Enum.Material.Metal,
	);
}
