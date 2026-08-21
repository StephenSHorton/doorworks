import { AssetService } from "@rbxts/services";

/**
 * EditableMesh helpers for edit-time ProceduralModels.
 * Build topology, then bake to a MeshPart (Pause before the yielding bake).
 */

export function createMesh(): EditableMesh {
	return AssetService.CreateEditableMesh();
}

/** Winding so (b-a)×(c-a) points away from `origin` (out of the solid). */
function addTri(
	mesh: EditableMesh,
	a: number,
	b: number,
	c: number,
	origin: Vector3,
): void {
	const pa = mesh.GetPosition(a);
	const pb = mesh.GetPosition(b);
	const pc = mesh.GetPosition(c);
	const normal = pb.sub(pa).Cross(pc.sub(pa));
	const centroid = pa.add(pb).add(pc).mul(1 / 3);
	if (normal.Dot(centroid.sub(origin)) < 0) {
		mesh.AddTriangle(a, c, b);
	} else {
		mesh.AddTriangle(a, b, c);
	}
}

export function addQuad(
	mesh: EditableMesh,
	a: number,
	b: number,
	c: number,
	d: number,
	origin: Vector3,
): void {
	addTri(mesh, a, b, c, origin);
	addTri(mesh, a, c, d, origin);
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

	const origin = center;
	addQuad(mesh, n000, n100, n110, n010, origin);
	addQuad(mesh, n101, n001, n011, n111, origin);
	addQuad(mesh, n100, n101, n111, n110, origin);
	addQuad(mesh, n001, n000, n010, n011, origin);
	addQuad(mesh, n010, n110, n111, n011, origin);
	addQuad(mesh, n001, n101, n100, n000, origin);
}

const ARCH_SEGMENTS = 24;

/** Shallow circular segment (not a semicircle — that reads as a picket). */
function archMetrics(width: number, height: number): {
	hx: number;
	rise: number;
	radius: number;
	thetaRight: number;
} {
	const hx = width / 2;
	const rise = math.clamp(width * 0.2, 0.08, height * 0.22);
	const radius = (hx * hx + rise * rise) / (2 * rise);
	const thetaRight = math.atan2(radius - rise, hx);
	return { hx, rise, radius, thetaRight };
}

function pushArc(
	ring: Vector3[],
	x0: number,
	yCenter: number,
	radius: number,
	angStart: number,
	angEnd: number,
	segments: number,
): void {
	for (let i = 1; i < segments; i++) {
		const t = i / segments;
		const ang = angStart + t * (angEnd - angStart);
		ring.push(
			new Vector3(
				x0 + radius * math.cos(ang),
				yCenter + radius * math.sin(ang),
				0,
			),
		);
	}
}

function addPrism(
	mesh: EditableMesh,
	ring: Vector3[],
	zFront: number,
	zBack: number,
): void {
	if (ring.size() < 3) return;
	let sx = 0;
	let sy = 0;
	for (const p of ring) {
		sx += p.X;
		sy += p.Y;
	}
	const origin = new Vector3(
		sx / ring.size(),
		sy / ring.size(),
		(zFront + zBack) / 2,
	);
	const frontIds: number[] = [];
	const backIds: number[] = [];
	for (const p of ring) {
		frontIds.push(mesh.AddVertex(new Vector3(p.X, p.Y, zFront)));
		backIds.push(mesh.AddVertex(new Vector3(p.X, p.Y, zBack)));
	}
	const n = ring.size();
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		addQuad(mesh, frontIds[i], backIds[i], backIds[j], frontIds[j], origin);
	}
	for (let i = 1; i < n - 1; i++) {
		addTri(mesh, frontIds[0], frontIds[i], frontIds[i + 1], origin);
		addTri(mesh, backIds[0], backIds[i], backIds[i + 1], origin);
	}
}

/**
 * Rectangle with a shallow segmental arch on top (colonial, not a picket).
 */
export function addTombstone(
	mesh: EditableMesh,
	center: Vector3,
	size: Vector3,
): void {
	const { hx, rise, radius, thetaRight } = archMetrics(size.X, size.Y);
	if (size.Y - rise < 0.08) {
		addBox(mesh, center, size);
		return;
	}

	const x0 = center.X;
	const yTop = center.Y + size.Y / 2;
	const ySpring = yTop - rise;
	const yCenter = yTop - radius;
	const y0 = center.Y - size.Y / 2;
	const thetaLeft = math.pi - thetaRight;

	const ring: Vector3[] = [];
	ring.push(new Vector3(x0 - hx, y0, 0));
	ring.push(new Vector3(x0 + hx, y0, 0));
	ring.push(new Vector3(x0 + hx, ySpring, 0));
	pushArc(
		ring,
		x0,
		yCenter,
		radius,
		thetaRight,
		thetaLeft,
		ARCH_SEGMENTS,
	);
	ring.push(new Vector3(x0 - hx, ySpring, 0));
	addPrism(mesh, ring, center.Z - size.Z / 2, center.Z + size.Z / 2);
}

/**
 * Fill the two corners of a rectangular opening above a shallow arch so
 * they aren't holes. Inner edge matches addTombstone for the same size.
 */
export function addArchCornerBackings(
	mesh: EditableMesh,
	center: Vector3,
	size: Vector3,
): void {
	const { hx, rise, radius, thetaRight } = archMetrics(size.X, size.Y);
	if (size.Y - rise < 0.08) return;

	const x0 = center.X;
	const yTop = center.Y + size.Y / 2;
	const ySpring = yTop - rise;
	const yCenter = yTop - radius;
	const xL = x0 - hx;
	const xR = x0 + hx;
	const zFront = center.Z - size.Z / 2;
	const zBack = center.Z + size.Z / 2;
	const thetaLeft = math.pi - thetaRight;
	const thetaPeak = math.pi / 2;

	const left: Vector3[] = [];
	left.push(new Vector3(xL, ySpring, 0));
	left.push(new Vector3(xL, yTop, 0));
	left.push(new Vector3(x0, yTop, 0));
	pushArc(left, x0, yCenter, radius, thetaPeak, thetaLeft, ARCH_SEGMENTS);
	addPrism(mesh, left, zFront, zBack);

	const right: Vector3[] = [];
	right.push(new Vector3(xR, ySpring, 0));
	right.push(new Vector3(xR, yTop, 0));
	right.push(new Vector3(x0, yTop, 0));
	pushArc(right, x0, yCenter, radius, thetaPeak, thetaRight, ARCH_SEGMENTS);
	addPrism(mesh, right, zFront, zBack);
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
