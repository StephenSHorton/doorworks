export interface ClosetDoorAttributes {
	DoorNumber: number;
	PanelRows: number;
	PanelCols: number;
	StileWidth: number;
	RailHeight: number;
	HangFromRail: boolean;
	KnobRight: boolean;
	Color: Color3;
}

export const DEFAULT_CLOSET_DOOR_ATTRIBUTES: ClosetDoorAttributes = {
	DoorNumber: 12,
	PanelRows: 3,
	PanelCols: 2,
	StileWidth: 0.72,
	RailHeight: 0.68,
	HangFromRail: true,
	KnobRight: true,
	Color: Color3.fromRGB(214, 96, 112),
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

/**
 * Builds a painted 6-panel closet door around the origin, facing -Z (Front).
 * Stiles/rails form open panel windows so a portal part behind the door shows
 * through. Matches the Roblox ProceduralModel OnGenerate contract: parent
 * everything into `target` and do not touch the DataModel outside it.
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
	const trim = shade(wood, 0.72);
	const brass = Color3.fromRGB(196, 152, 72);
	const railMetal = Color3.fromRGB(92, 96, 104);
	const depth = math.max(size.Z, 0.5);
	const stile = math.clamp(a.StileWidth, 0.4, size.X / 3);
	const rail = math.clamp(a.RailHeight, 0.4, size.Y / 5);
	const rows = math.clamp(math.floor(a.PanelRows), 1, 4);
	const cols = math.clamp(math.floor(a.PanelCols), 1, 3);
	const innerW = size.X - stile * 2;
	const innerH = size.Y - rail * 2;
	const mullion = cols > 1 ? stile * 0.55 : 0;
	const midRail = rows > 1 ? rail * 0.7 : 0;

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

	const cellW = (innerW - mullion * (cols - 1)) / cols;
	const cellH = (innerH - midRail * (rows - 1)) / rows;
	const originX = -innerW / 2;
	const originY = -innerH / 2;

	for (let c = 1; c < cols; c++) {
		const x = originX + cellW * c + mullion * (c - 0.5);
		part(
			target,
			`Mullion${c}`,
			new Vector3(mullion, innerH, depth),
			new CFrame(x, 0, 0),
			trim,
			Enum.Material.Wood,
		);
	}
	for (let r = 1; r < rows; r++) {
		const y = originY + cellH * r + midRail * (r - 0.5);
		part(
			target,
			`MidRail${r}`,
			new Vector3(innerW, midRail, depth),
			new CFrame(0, y, 0),
			trim,
			Enum.Material.Wood,
		);
	}

	const molding = 0.12;
	const moldZ = -depth / 2 - 0.04;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const cx = originX + cellW * c + mullion * c + cellW / 2;
			const cy = originY + cellH * r + midRail * r + cellH / 2;
			const pw = cellW - 0.16;
			const ph = cellH - 0.16;
			const frame = `${r}_${c}`;
			part(
				target,
				`PanelTop${frame}`,
				new Vector3(pw, molding, 0.08),
				new CFrame(cx, cy + ph / 2 - molding / 2, moldZ),
				trim,
				Enum.Material.Wood,
			);
			part(
				target,
				`PanelBottom${frame}`,
				new Vector3(pw, molding, 0.08),
				new CFrame(cx, cy - ph / 2 + molding / 2, moldZ),
				trim,
				Enum.Material.Wood,
			);
			part(
				target,
				`PanelLeft${frame}`,
				new Vector3(molding, ph, 0.08),
				new CFrame(cx - pw / 2 + molding / 2, cy, moldZ),
				trim,
				Enum.Material.Wood,
			);
			part(
				target,
				`PanelRight${frame}`,
				new Vector3(molding, ph, 0.08),
				new CFrame(cx + pw / 2 - molding / 2, cy, moldZ),
				trim,
				Enum.Material.Wood,
			);
		}
	}

	const knobX = a.KnobRight ? size.X / 2 - stile / 2 : -size.X / 2 + stile / 2;
	const knob = part(
		target,
		"Knob",
		new Vector3(0.28, 0.28, 0.28),
		new CFrame(knobX, -size.Y * 0.05, -depth / 2 - 0.18),
		brass,
		Enum.Material.Metal,
	);
	knob.Shape = Enum.PartType.Ball;

	const plate = part(
		target,
		"NumberPlate",
		new Vector3(1.4, 0.7, 0.08),
		new CFrame(0, size.Y / 2 - rail / 2, -depth / 2 - 0.06),
		brass,
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
	label.Text = tostring(a.DoorNumber);
	label.TextColor3 = Color3.fromRGB(40, 28, 16);
	label.Font = Enum.Font.GothamBold;
	label.TextScaled = true;
	label.Parent = gui;

	if (a.HangFromRail) {
		const hangY = size.Y / 2 + 0.9;
		part(
			target,
			"Rail",
			new Vector3(size.X + 4, 0.18, 0.18),
			new CFrame(0, hangY, 0),
			railMetal,
			Enum.Material.Metal,
		);
		for (const side of [-1, 1]) {
			const x = side * (size.X / 2 - 0.4);
			const wheel = part(
				target,
				side < 0 ? "RollerL" : "RollerR",
				new Vector3(0.42, 0.42, 0.22),
				new CFrame(x, hangY, 0),
				Color3.fromRGB(48, 48, 52),
				Enum.Material.Metal,
			);
			wheel.Shape = Enum.PartType.Cylinder;
			wheel.CFrame = new CFrame(x, hangY, 0).mul(
				CFrame.Angles(0, 0, math.rad(90)),
			);
			part(
				target,
				side < 0 ? "HangL" : "HangR",
				new Vector3(0.12, 0.85, 0.12),
				new CFrame(x, hangY - 0.5, 0),
				railMetal,
				Enum.Material.Metal,
			);
		}
	}
}
