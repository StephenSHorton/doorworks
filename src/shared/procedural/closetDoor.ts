import { CollectionService } from "@rbxts/services";

export interface ClosetDoorAttributes {
	DoorNumber: number;
	PanelRows: number;
	PanelCols: number;
	StileWidth: number;
	RailHeight: number;
	HangFromRail: boolean;
	Station: boolean;
	KnobRight: boolean;
	Color: Color3;
	PortalPair: string;
}

export const DEFAULT_CLOSET_DOOR_ATTRIBUTES: ClosetDoorAttributes = {
	DoorNumber: 12,
	PanelRows: 2,
	PanelCols: 2,
	StileWidth: 0.85,
	RailHeight: 0.78,
	HangFromRail: false,
	Station: true,
	KnobRight: true,
	Color: Color3.fromRGB(232, 228, 218),
	PortalPair: "playground",
};

export interface ClosetDoorParams {
	size: Vector3;
	attributes: ClosetDoorAttributes;
}

function part(
	parent: Instance,
	name: string,
	size: Vector3,
	cframe: CFrame,
	color: Color3,
	material: Enum.Material,
): Part {
	const p = new Instance("Part");
	p.Name = name;
	p.Anchored = true;
	p.CanCollide = false;
	p.Size = size;
	p.CFrame = cframe;
	p.Color = color;
	p.Material = material;
	p.TopSurface = Enum.SurfaceType.Smooth;
	p.BottomSurface = Enum.SurfaceType.Smooth;
	p.Parent = parent;
	return p;
}

function shade(color: Color3, mul: number): Color3 {
	return new Color3(
		math.clamp(color.R * mul, 0, 1),
		math.clamp(color.G * mul, 0, 1),
		math.clamp(color.B * mul, 0, 1),
	);
}

function disk(
	parent: Instance,
	name: string,
	diameter: number,
	thickness: number,
	cframe: CFrame,
	color: Color3,
	material: Enum.Material,
): Part {
	const p = part(
		parent,
		name,
		new Vector3(diameter, thickness, diameter),
		cframe.mul(CFrame.Angles(math.rad(90), 0, 0)),
		color,
		material,
	);
	p.Shape = Enum.PartType.Cylinder;
	return p;
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

function buildStation(
	target: Instance,
	size: Vector3,
	depth: number,
	doorNumber: number,
): void {
	const metal = Color3.fromRGB(148, 152, 158);
	const metalDark = Color3.fromRGB(92, 96, 102);
	const metalLight = Color3.fromRGB(176, 180, 186);
	const hazard = Color3.fromRGB(214, 176, 48);
	const extraX = 1.35;
	const extraY = 1.7;
	const backZ = depth / 2 + 0.55;

	part(
		target,
		"StationBack",
		new Vector3(size.X + extraX * 2, size.Y + extraY, 0.7),
		new CFrame(0, extraY / 2 - 0.15, backZ),
		metalDark,
		Enum.Material.DiamondPlate,
	);
	part(
		target,
		"StationLeft",
		new Vector3(0.7, size.Y + extraY, depth + 1.4),
		new CFrame(-size.X / 2 - extraX + 0.15, extraY / 2 - 0.15, 0.15),
		metal,
		Enum.Material.Metal,
	);
	part(
		target,
		"StationRight",
		new Vector3(0.7, size.Y + extraY, depth + 1.4),
		new CFrame(size.X / 2 + extraX - 0.15, extraY / 2 - 0.15, 0.15),
		metal,
		Enum.Material.Metal,
	);
	part(
		target,
		"StationHeader",
		new Vector3(size.X + extraX * 2, 1.1, depth + 1.2),
		new CFrame(0, size.Y / 2 + extraY / 2 + 0.05, 0.1),
		metal,
		Enum.Material.Metal,
	);

	const beacon = part(
		target,
		"Beacon",
		new Vector3(0.55, 0.55, 0.55),
		new CFrame(0, size.Y / 2 + extraY / 2 + 0.55, -depth / 2 - 0.2),
		Color3.fromRGB(196, 32, 36),
		Enum.Material.Neon,
	);
	beacon.Shape = Enum.PartType.Ball;
	const light = new Instance("PointLight");
	light.Color = Color3.fromRGB(255, 64, 64);
	light.Brightness = 1.2;
	light.Range = 10;
	light.Parent = beacon;

	const rivet = (name: string, x: number, y: number, z: number) => {
		const r = part(
			target,
			name,
			new Vector3(0.18, 0.18, 0.12),
			new CFrame(x, y, z),
			metalLight,
			Enum.Material.Metal,
		);
		r.Shape = Enum.PartType.Cylinder;
		r.CFrame = new CFrame(x, y, z).mul(CFrame.Angles(math.rad(90), 0, 0));
	};
	const zRivet = -depth / 2 - 0.72;
	rivet(
		"RivetTL",
		-size.X / 2 - extraX + 0.35,
		size.Y / 2 + extraY / 2 - 0.35,
		zRivet,
	);
	rivet(
		"RivetTR",
		size.X / 2 + extraX - 0.35,
		size.Y / 2 + extraY / 2 - 0.35,
		zRivet,
	);
	rivet("RivetBL", -size.X / 2 - extraX + 0.35, -size.Y / 2 + 0.45, zRivet);
	rivet("RivetBR", size.X / 2 + extraX - 0.35, -size.Y / 2 + 0.45, zRivet);

	part(
		target,
		"ArmLeft",
		new Vector3(0.45, 4.2, 0.45),
		new CFrame(-size.X / 2 - extraX - 0.7, 0.2, 0.4),
		metalLight,
		Enum.Material.Metal,
	);
	part(
		target,
		"PanelLeft",
		new Vector3(1.6, 1.8, 0.25),
		new CFrame(-size.X / 2 - extraX - 1.5, 1.4, -0.2),
		metalDark,
		Enum.Material.Metal,
	);
	part(
		target,
		"ArmRight",
		new Vector3(0.55, 3.6, 0.55),
		new CFrame(size.X / 2 + extraX + 0.85, 0.4, 0.5),
		metalLight,
		Enum.Material.Metal,
	);
	part(
		target,
		"ClampRight",
		new Vector3(1.4, 0.7, 1.1),
		new CFrame(size.X / 2 + extraX + 1.4, -0.6, -0.15),
		metalDark,
		Enum.Material.Metal,
	);

	part(
		target,
		"Threshold",
		new Vector3(size.X + extraX * 2 + 2, 0.12, 3.2),
		new CFrame(0, -size.Y / 2 - 0.06, -depth / 2 - 1.4),
		Color3.fromRGB(48, 50, 54),
		Enum.Material.DiamondPlate,
	);
	part(
		target,
		"HazardL",
		new Vector3((size.X + extraX * 2 + 2) / 2, 0.14, 1.1),
		new CFrame(
			-(size.X + extraX * 2 + 2) / 4,
			-size.Y / 2 - 0.05,
			-depth / 2 - 2.6,
		),
		hazard,
		Enum.Material.SmoothPlastic,
	);
	part(
		target,
		"HazardR",
		new Vector3((size.X + extraX * 2 + 2) / 2, 0.14, 1.1),
		new CFrame(
			(size.X + extraX * 2 + 2) / 4,
			-size.Y / 2 - 0.05,
			-depth / 2 - 2.6,
		),
		hazard,
		Enum.Material.SmoothPlastic,
	);

	const plate = part(
		target,
		"NumberPlate",
		new Vector3(1.5, 0.55, 0.08),
		new CFrame(0, size.Y / 2 + extraY / 2 + 0.05, -depth / 2 - 0.55),
		Color3.fromRGB(196, 152, 72),
		Enum.Material.Metal,
	);
	const gui = new Instance("SurfaceGui");
	gui.Name = "NumberGui";
	gui.Face = Enum.NormalId.Front;
	gui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
	gui.PixelsPerStud = 50;
	gui.Parent = plate;
	const label = new Instance("TextLabel");
	label.BackgroundTransparency = 1;
	label.Size = new UDim2(1, 0, 1, 0);
	label.Text = tostring(doorNumber);
	label.TextColor3 = Color3.fromRGB(40, 28, 16);
	label.Font = Enum.Font.GothamBold;
	label.TextScaled = true;
	label.Parent = gui;
}

/**
 * Four-panel colonial closet door (arched uppers) in an industrial dock.
 * Portal plane sits behind the slab for walk-through. No character-specific
 * decals — paint via the Color attribute.
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

	if (a.Station) {
		buildStation(target, size, depth, a.DoorNumber);
	} else if (a.HangFromRail) {
		const hangY = size.Y / 2 + 0.9;
		part(
			target,
			"Rail",
			new Vector3(size.X + 4, 0.18, 0.18),
			new CFrame(0, hangY, 0),
			Color3.fromRGB(92, 96, 104),
			Enum.Material.Metal,
		);
	}
}
