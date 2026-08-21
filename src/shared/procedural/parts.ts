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
	if (shape !== undefined) p.Shape = shape;
	p.Size = size;
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

/** Cylinder whose axis is the part's local Y. Rotate the CFrame to aim it. */
export function cylinder(
	parent: Instance,
	name: string,
	diameter: number,
	length: number,
	cframe: CFrame,
	color: Color3,
	material: Enum.Material,
): Part {
	return part(
		parent,
		name,
		new Vector3(diameter, length, diameter),
		cframe,
		color,
		material,
		Enum.PartType.Cylinder,
	);
}

/** Cylinder whose Y-axis runs from `from` to `to`. */
export function cylinderBetween(
	parent: Instance,
	name: string,
	diameter: number,
	from: Vector3,
	to: Vector3,
	color: Color3,
	material: Enum.Material,
): Part {
	const delta = to.sub(from);
	const length = delta.Magnitude;
	const mid = from.Lerp(to, 0.5);
	// lookAt aims -Z at `to`; -90° around X maps the cylinder's Y-axis onto that.
	const cf = CFrame.lookAt(mid, to).mul(CFrame.Angles(-math.pi / 2, 0, 0));
	return cylinder(parent, name, diameter, length, cf, color, material);
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
	return cylinder(
		parent,
		name,
		diameter,
		thickness,
		cframe.mul(CFrame.Angles(math.rad(90), 0, 0)),
		color,
		material,
	);
}
