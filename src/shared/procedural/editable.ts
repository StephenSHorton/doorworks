import { AssetService } from "@rbxts/services";

/**
 * EditableMesh helpers for edit-time ProceduralModels.
 * Build topology, then bake to a MeshPart (Pause before the yielding bake).
 */

export function createMesh(): EditableMesh {
	return AssetService.CreateEditableMesh();
}

function addTri(
	mesh: EditableMesh,
	a: number,
	b: number,
	c: number,
): void {
	mesh.AddTriangle(a, b, c);
}

/** Quad. Winding is clockwise from the outside so Roblox front-faces point out. */
export function addQuad(
	mesh: EditableMesh,
	a: number,
	b: number,
	c: number,
	d: number,
): void {
	addTri(mesh, a, d, c);
	addTri(mesh, a, c, b);
}

export function addBox(
	mesh: EditableMesh,
	center: Vector3,
	size: Vector3,
): void {
	const hx = size.X / 2;
	const hy = size.Y / 2;
	const hz = size.Z / 2;
	const cx = center.X;
	const cy = center.Y;
	const cz = center.Z;

	const v = (x: number, y: number, z: number) =>
		mesh.AddVertex(new Vector3(x, y, z));

	const n000 = v(cx - hx, cy - hy, cz - hz);
	const n100 = v(cx + hx, cy - hy, cz - hz);
	const n110 = v(cx + hx, cy + hy, cz - hz);
	const n010 = v(cx - hx, cy + hy, cz - hz);
	const n001 = v(cx - hx, cy - hy, cz + hz);
	const n101 = v(cx + hx, cy - hy, cz + hz);
	const n111 = v(cx + hx, cy + hy, cz + hz);
	const n011 = v(cx - hx, cy + hy, cz + hz);

	// Front (-Z), back (+Z), right (+X), left (-X), top (+Y), bottom (-Y)
	addQuad(mesh, n000, n100, n110, n010);
	addQuad(mesh, n101, n001, n011, n111);
	addQuad(mesh, n100, n101, n111, n110);
	addQuad(mesh, n001, n000, n010, n011);
	addQuad(mesh, n010, n110, n111, n011);
	addQuad(mesh, n001, n101, n100, n000);
}

/**
 * Tombstone extrusion: rectangle with a semicircle on top, extruded in Z.
 * Used for colonial arched upper panels.
 */
export function addTombstone(
	mesh: EditableMesh,
	center: Vector3,
	size: Vector3,
	archSegments = 8,
): void {
	const hx = size.X / 2;
	const hy = size.Y / 2;
	const hz = size.Z / 2;
	const r = hx;
	const rectH = size.Y - r;
	if (rectH < 0.08) {
		addBox(mesh, center, size);
		return;
	}

	const ring: Vector3[] = [];
	const zFront = center.Z - hz;
	const zBack = center.Z + hz;
	const ySpring = center.Y - hy + rectH;
	const x0 = center.X;
	const y0 = center.Y - hy;

	ring.push(new Vector3(x0 - hx, y0, 0));
	ring.push(new Vector3(x0 + hx, y0, 0));
	ring.push(new Vector3(x0 + hx, ySpring, 0));
	for (let i = 1; i < archSegments; i++) {
		const t = i / archSegments;
		const ang = t * math.pi;
		ring.push(
			new Vector3(
				x0 + r * math.cos(ang),
				ySpring + r * math.sin(ang),
				0,
			),
		);
	}
	ring.push(new Vector3(x0 - hx, ySpring, 0));

	const frontIds: number[] = [];
	const backIds: number[] = [];
	for (const p of ring) {
		frontIds.push(mesh.AddVertex(new Vector3(p.X, p.Y, zFront)));
		backIds.push(mesh.AddVertex(new Vector3(p.X, p.Y, zBack)));
	}

	const n = ring.size();
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		addQuad(mesh, frontIds[i], frontIds[j], backIds[j], backIds[i]);
	}
	for (let i = 1; i < n - 1; i++) {
		addTri(mesh, frontIds[0], frontIds[i + 1], frontIds[i]);
		addTri(mesh, backIds[0], backIds[i], backIds[i + 1]);
	}
}

export interface BakeMeshOptions {
	name: string;
	parent: Instance;
	color: Color3;
	material: Enum.Material;
	cframe: CFrame;
	pause: () => void;
}

/**
 * Bake an EditableMesh into a MeshPart. Yields — call pause() is invoked here.
 * Prefers CreateDataModelContentAsync so the mesh is static for the session.
 */
export function bakeMesh(mesh: EditableMesh, options: BakeMeshOptions): MeshPart {
	options.pause();
	const live = Content.fromObject(mesh);
	let meshContent = live;
	const [bakeOk, packed] = pcall(() => {
		const [status, content] = AssetService.CreateDataModelContentAsync(
			live,
		) as unknown as LuaTuple<[Enum.CreateContentResult, Content]>;
		return { status, content };
	});
	if (
		bakeOk &&
		packed.status === Enum.CreateContentResult.Success
	) {
		meshContent = packed.content;
	}

	options.pause();
	const meshPart = AssetService.CreateMeshPartAsync(meshContent, {
		CollisionFidelity: Enum.CollisionFidelity.Box,
	});
	mesh.Destroy();
	meshPart.Name = options.name;
	meshPart.Anchored = true;
	meshPart.CanCollide = false;
	meshPart.Color = options.color;
	meshPart.Material = options.material;
	meshPart.Parent = options.parent;
	meshPart.CFrame = options.cframe;
	return meshPart;
}
