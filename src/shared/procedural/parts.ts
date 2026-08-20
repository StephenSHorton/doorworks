export function part(
	parent: Instance,
	name: string,
	size: Vector3,
	cframe: CFrame,
	color: Color3,
	material: Enum.Material,
	shape?: Enum.PartType,
): Part {
	const p = new Instance("Part");
	p.Name = name;
	p.Anchored = true;
	p.CanCollide = false;
	p.Size = size;
	if (shape !== undefined) p.Shape = shape;
	// CFrame, never Position — Position depenetrates and refuses overlaps.
	p.CFrame = cframe;
	p.Color = color;
	p.Material = material;
	p.TopSurface = Enum.SurfaceType.Smooth;
	p.BottomSurface = Enum.SurfaceType.Smooth;
	p.Parent = parent;
	return p;
}

export function shade(color: Color3, mul: number): Color3 {
	return new Color3(
		math.clamp(color.R * mul, 0, 1),
		math.clamp(color.G * mul, 0, 1),
		math.clamp(color.B * mul, 0, 1),
	);
}

export function disk(
	parent: Instance,
	name: string,
	diameter: number,
	thickness: number,
	cframe: CFrame,
	color: Color3,
	material: Enum.Material,
): Part {
	return part(
		parent,
		name,
		new Vector3(diameter, thickness, diameter),
		cframe.mul(CFrame.Angles(math.rad(90), 0, 0)),
		color,
		material,
		Enum.PartType.Cylinder,
	);
}
