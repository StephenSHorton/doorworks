import { AssetService, MaterialService } from "@rbxts/services";

const MAP_SIZE = 64;

function writeMap(fill: (x: number, y: number) => Color3): EditableImage {
	const img = AssetService.CreateEditableImage({
		Size: new Vector2(MAP_SIZE, MAP_SIZE),
	});
	const buf = buffer.create(MAP_SIZE * MAP_SIZE * 4);
	let i = 0;
	for (let y = 0; y < MAP_SIZE; y++) {
		for (let x = 0; x < MAP_SIZE; x++) {
			const c = fill(x, y);
			buffer.writeu8(buf, i, math.floor(c.R * 255));
			buffer.writeu8(buf, i + 1, math.floor(c.G * 255));
			buffer.writeu8(buf, i + 2, math.floor(c.B * 255));
			buffer.writeu8(buf, i + 3, 255);
			i += 4;
		}
	}
	img.WritePixelsBuffer(
		new Vector2(0, 0),
		new Vector2(MAP_SIZE, MAP_SIZE),
		buf,
	);
	return img;
}

function imageContent(img: EditableImage): Content {
	return Content.fromObject(img);
}

function gray(v: number): Color3 {
	const t = math.clamp(v, 0, 1);
	return new Color3(t, t, t);
}

function woodColor(x: number, y: number): Color3 {
	const grain =
		math.noise(x / 10, y / 64) * 0.35 + math.sin(x * 0.35 + y * 0.02) * 0.15;
	const t = 0.78 + grain * 0.22;
	return new Color3(
		math.clamp(0.82 * t, 0, 1),
		math.clamp(0.72 * t, 0, 1),
		math.clamp(0.52 * t, 0, 1),
	);
}

function woodRough(x: number, y: number): Color3 {
	return gray(0.62 + math.noise(x / 8, y / 20) * 0.12);
}

function brassColor(x: number, y: number): Color3 {
	const n = math.noise(x / 18, y / 18) * 0.08;
	return new Color3(
		math.clamp(0.62 + n, 0, 1),
		math.clamp(0.45 + n, 0, 1),
		math.clamp(0.22 + n, 0, 1),
	);
}

/** Satin / brushed — high roughness so it does not read as chrome. */
function brassRough(x: number, y: number): Color3 {
	return gray(0.58 + math.noise(x / 6, y / 4) * 0.1);
}

function brassMetal(_x: number, _y: number): Color3 {
	return gray(0.92);
}

function woodMetal(_x: number, _y: number): Color3 {
	return gray(0.02);
}

function upsertVariant(
	name: string,
	base: Enum.Material,
	color: Content,
	rough: Content,
	metal: Content,
): MaterialVariant {
	const [found, existing] = pcall(() =>
		MaterialService.GetMaterialVariant(base, name),
	);
	const mv =
		found && existing ? existing : new Instance("MaterialVariant");
	mv.Name = name;
	(mv as unknown as { BaseMaterial: Enum.Material }).BaseMaterial = base;
	mv.StudsPerTile = 3;
	const maps = mv as unknown as {
		ColorMapContent: Content;
		RoughnessMapContent: Content;
		MetalnessMapContent: Content;
	};
	maps.ColorMapContent = color;
	maps.RoughnessMapContent = rough;
	maps.MetalnessMapContent = metal;
	mv.Parent = MaterialService;
	return mv;
}

function tryAppearance(pause: () => void, maps: object): SurfaceAppearance | undefined {
	pause();
	const [ok, sa] = pcall(() =>
		AssetService.CreateSurfaceAppearanceAsync(maps),
	);
	return ok ? sa : undefined;
}

export interface DoorMaterials {
	woodName: string;
	brassName: string;
	woodAppearance?: SurfaceAppearance;
	brassAppearance?: SurfaceAppearance;
}

export function createDoorMaterials(pause: () => void): DoorMaterials {
	const safePause = () => {
		pcall(pause);
	};
	const woodColorMap = writeMap(woodColor);
	const woodRoughMap = writeMap(woodRough);
	const woodMetalMap = writeMap(woodMetal);
	const brassColorMap = writeMap(brassColor);
	const brassRoughMap = writeMap(brassRough);
	const brassMetalMap = writeMap(brassMetal);

	const woodColorContent = imageContent(woodColorMap);
	const woodRoughContent = imageContent(woodRoughMap);
	const woodMetalContent = imageContent(woodMetalMap);
	const brassColorContent = imageContent(brassColorMap);
	const brassRoughContent = imageContent(brassRoughMap);
	const brassMetalContent = imageContent(brassMetalMap);

	upsertVariant(
		"DoorworksWood",
		Enum.Material.Wood,
		woodColorContent,
		woodRoughContent,
		woodMetalContent,
	);
	upsertVariant(
		"DoorworksSatinBrass",
		Enum.Material.Metal,
		brassColorContent,
		brassRoughContent,
		brassMetalContent,
	);

	return {
		woodName: "DoorworksWood",
		brassName: "DoorworksSatinBrass",
		woodAppearance: tryAppearance(safePause, {
			ColorMap: woodColorContent,
			RoughnessMap: woodRoughContent,
			MetalnessMap: woodMetalContent,
		}),
		brassAppearance: tryAppearance(safePause, {
			ColorMap: brassColorContent,
			RoughnessMap: brassRoughContent,
			MetalnessMap: brassMetalContent,
		}),
	};
}

export function applyWood(part: BasePart, mats: DoorMaterials): void {
	part.Material = Enum.Material.Wood;
	part.MaterialVariant = mats.woodName;
	if (part.IsA("MeshPart") && mats.woodAppearance) {
		mats.woodAppearance.Clone().Parent = part;
	}
}

export function applySatinBrass(part: BasePart, mats: DoorMaterials): void {
	part.Material = Enum.Material.Metal;
	part.MaterialVariant = mats.brassName;
	part.Reflectance = 0;
	if (part.IsA("MeshPart") && mats.brassAppearance) {
		mats.brassAppearance.Clone().Parent = part;
	}
}
