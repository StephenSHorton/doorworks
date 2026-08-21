import { CollectionService } from "@rbxts/services";
import {
	addArchCornerBackings,
	addBox,
	addTombstone,
	bakeMesh,
	createMesh,
} from "./editable";
import { cylinderBetween, part, shade } from "./parts";

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
	pause: () => void;
}

/**
 * Four-panel colonial closet door. Wood body is one EditableMesh (frame +
 * inset fills; arched uppers) so recesses are real topology, not overlapping
 * Parts. Hardware stays separate primitives. CFrame only.
 */
export function generateClosetDoor(
	target: Instance,
	params: ClosetDoorParams,
): void {
	const size = params.size;
	const a = params.attributes;
	const wood = a.Color;
	const fill = shade(wood, 0.92);
	const brass = Color3.fromRGB(196, 152, 72);
	const depth = math.max(size.Z, 0.35);
	const front = -depth / 2;
	const dip = math.clamp(depth * 0.35, 0.1, 0.16);

	const portal = part(
		target,
		"PortalPlane",
		new Vector3(size.X - 0.1, size.Y - 0.1, 0.12),
		new CFrame(0, 0, depth / 2 + 0.08),
		Color3.fromRGB(18, 18, 24),
		Enum.Material.SmoothPlastic,
	);
	portal.Transparency = 1;
	portal.CanCollide = false;
	portal.CastShadow = false;
	portal.SetAttribute("PortalPair", a.PortalPair);
	CollectionService.AddTag(portal, "ImmersivePortal");

	const stile = math.clamp(a.StileWidth, 0.35, size.X / 3);
	const rail = math.clamp(a.RailHeight, 0.35, size.Y / 5);
	const innerW = size.X - stile * 2;
	const innerH = size.Y - rail * 2;
	const mullion = stile * 0.55;
	const lockRail = rail * 0.85;

	const lowerShare = 0.4;
	const lowerH = innerH * lowerShare;
	const upperH = innerH - lowerH - lockRail;
	const lockY = -innerH / 2 + lowerH + lockRail / 2;

	const cellW = (innerW - mullion) / 2;
	const leftX = -innerW / 2 + cellW / 2;
	const rightX = innerW / 2 - cellW / 2;
	const lowerCy = -innerH / 2 + lowerH / 2;
	const upperCy = lockY + lockRail / 2 + upperH / 2;
	const gap = 0.02;
	const fillFront = front + dip;
	const fillBack = depth / 2;
	const fillThick = math.max(fillBack - fillFront, 0.08);
	const zFill = (fillFront + fillBack) / 2;

	const body = createMesh();
	addBox(
		body,
		new Vector3(-size.X / 2 + stile / 2, 0, 0),
		new Vector3(stile, size.Y, depth),
	);
	addBox(
		body,
		new Vector3(size.X / 2 - stile / 2, 0, 0),
		new Vector3(stile, size.Y, depth),
	);
	addBox(
		body,
		new Vector3(0, size.Y / 2 - rail / 2, 0),
		new Vector3(innerW, rail, depth),
	);
	addBox(
		body,
		new Vector3(0, -size.Y / 2 + rail / 2, 0),
		new Vector3(innerW, rail, depth),
	);
	addBox(
		body,
		new Vector3(0, lockY, 0),
		new Vector3(innerW, lockRail, depth),
	);
	addBox(
		body,
		new Vector3(0, -innerH / 2 + lowerH / 2, 0),
		new Vector3(mullion, lowerH, depth),
	);
	addBox(
		body,
		new Vector3(0, lockY + lockRail / 2 + upperH / 2, 0),
		new Vector3(mullion, upperH, depth),
	);
	addArchCornerBackings(
		body,
		new Vector3(leftX, upperCy, 0),
		new Vector3(cellW, upperH, depth),
	);
	addArchCornerBackings(
		body,
		new Vector3(rightX, upperCy, 0),
		new Vector3(cellW, upperH, depth),
	);

	const fills = createMesh();
	addBox(
		fills,
		new Vector3(leftX, lowerCy, zFill),
		new Vector3(cellW - gap, lowerH - gap, fillThick),
	);
	addBox(
		fills,
		new Vector3(rightX, lowerCy, zFill),
		new Vector3(cellW - gap, lowerH - gap, fillThick),
	);
	addTombstone(
		fills,
		new Vector3(leftX, upperCy, zFill),
		new Vector3(cellW - gap, upperH - gap, fillThick),
	);
	addTombstone(
		fills,
		new Vector3(rightX, upperCy, zFill),
		new Vector3(cellW - gap, upperH - gap, fillThick),
	);

	bakeMesh(body, {
		name: "DoorBody",
		parent: target,
		color: wood,
		material: Enum.Material.Wood,
		cframe: new CFrame(),
		pause: params.pause,
	});
	bakeMesh(fills, {
		name: "DoorPanels",
		parent: target,
		color: fill,
		material: Enum.Material.Wood,
		cframe: new CFrame(),
		pause: params.pause,
	});

	const knobX = a.KnobRight
		? size.X / 2 - stile / 2
		: -size.X / 2 + stile / 2;
	const knobY = lockY + 0.18;
	const knobD = 0.5;
	const stemLen = 0.42;
	const stemD = 0.14;
	const plateThick = 0.04;

	part(
		target,
		"LockPlate",
		new Vector3(0.3, 0.72, plateThick),
		new CFrame(knobX, lockY - 0.22, front - plateThick / 2),
		brass,
		Enum.Material.Metal,
	);
	cylinderBetween(
		target,
		"KnobStem",
		stemD,
		new Vector3(knobX, knobY, front),
		new Vector3(knobX, knobY, front - stemLen),
		brass,
		Enum.Material.Metal,
	);
	part(
		target,
		"Knob",
		new Vector3(knobD, knobD, knobD),
		new CFrame(knobX, knobY, front - stemLen - knobD / 2 + 0.03),
		brass,
		Enum.Material.Metal,
		Enum.PartType.Ball,
	);
}
