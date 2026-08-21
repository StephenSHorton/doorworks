import { AssetService, MaterialService } from "@rbxts/services";

const MAP_SIZE = 128;

export const WOOD_GRAINS = [
	"fine",
	"plank",
	"worn",
	"tight",
	"fineSubtle",
	"plankSubtle",
	"wornSubtle",
	"tightSubtle",
] as const;
export type WoodGrain = (typeof WOOD_GRAINS)[number];

function grainBase(
	kind: WoodGrain,
): "fine" | "plank" | "worn" | "tight" {
	if (kind === "fineSubtle") return "fine";
	if (kind === "plankSubtle") return "plank";
	if (kind === "wornSubtle") return "worn";
	if (kind === "tightSubtle") return "tight";
	return kind;
}

function writeMap(
	fill: (x: number, y: number) => { c: Color3; a: number },
): EditableImage {
	const img = AssetService.CreateEditableImage({
		Size: new Vector2(MAP_SIZE, MAP_SIZE),
	});
	const buf = buffer.create(MAP_SIZE * MAP_SIZE * 4);
	let i = 0;
	for (let y = 0; y < MAP_SIZE; y++) {
		for (let x = 0; x < MAP_SIZE; x++) {
			const { c, a } = fill(x, y);
			buffer.writeu8(buf, i, math.floor(c.R * 255));
			buffer.writeu8(buf, i + 1, math.floor(c.G * 255));
			buffer.writeu8(buf, i + 2, math.floor(c.B * 255));
			buffer.writeu8(buf, i + 3, math.floor(math.clamp(a, 0, 1) * 255));
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

const GRAIN_DARK = new Color3(0.18, 0.1, 0.05);

function woodOverlay(kind: WoodGrain, x: number, y: number): { c: Color3; a: number } {
	const base = grainBase(kind);
	const subtle = base !== kind;
	const nx = x / MAP_SIZE;
	const ny = y / MAP_SIZE;
	let line = 0;
	if (base === "fine") {
		const n = math.noise(x / 5, y / 40, 1.2);
		line = math.abs(math.sin((x + n * 10) * 1.15));
		line = math.pow(line, 0.35);
	} else if (base === "plank") {
		const n = math.noise(x / 14, y / 90, 2.4);
		const band = math.abs(math.sin((x + n * 18) * 0.28));
		const pore = math.noise(x / 3, y / 8, 9) > 0.35 ? 0.35 : 0;
		line = math.pow(band, 0.45) + pore;
	} else if (base === "worn") {
		const n = math.noise(x / 8, y / 22, 3.1);
		const scratch = math.abs(math.noise(x / 40, y / 2, 7.7));
		line = math.abs(math.sin((x + n * 14) * 0.7)) * 0.7 + scratch * 0.5;
	} else {
		const n = math.noise(x / 3.5, y / 28, 4.8);
		line = math.abs(math.sin((x + n * 6) * 2.2));
		line = math.pow(line, 0.25);
	}
	const edge = math.abs(nx - 0.5) * 0.08 + math.noise(nx * 4, ny * 4, 0.5) * 0.05;
	const alpha = subtle
		? math.clamp(0.05 + line * 0.22 + edge * 0.3, 0.04, 0.32)
		: math.clamp(0.22 + line * 0.55 + edge, 0.15, 0.78);
	return { c: GRAIN_DARK, a: alpha };
}

function woodRough(kind: WoodGrain, x: number, y: number): { c: Color3; a: number } {
	const worn = grainBase(kind) === "worn";
	const n = math.noise(x / 7, y / 18, worn ? 8 : 2);
	const v = worn ? 0.7 + n * 0.15 : 0.58 + n * 0.1;
	return { c: gray(v), a: 1 };
}

function woodMetal(): { c: Color3; a: number } {
	return { c: gray(0.02), a: 1 };
}

function brassOverlay(x: number, y: number, subtle: boolean): { c: Color3; a: number } {
	const brush = math.abs(math.sin(y * 0.9 + math.noise(x / 20, y / 4, 1) * 2));
	const alpha = subtle
		? 0.05 + brush * 0.1
		: 0.12 + brush * 0.22;
	return { c: new Color3(0.28, 0.18, 0.08), a: alpha };
}

function brassRough(x: number, y: number): { c: Color3; a: number } {
	return { c: gray(0.62 + math.noise(x / 5, y / 3, 1) * 0.08), a: 1 };
}

function brassMetal(): { c: Color3; a: number } {
	return { c: gray(0.9), a: 1 };
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
	mv.AlphaMode = Enum.AlphaMode.Overlay;
	mv.StudsPerTile = 2;
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

function tryAppearance(
	pause: () => void,
	maps: object,
): SurfaceAppearance | undefined {
	pause();
	const [ok, sa] = pcall(() =>
		AssetService.CreateSurfaceAppearanceAsync(maps),
	);
	if (!ok) return undefined;
	sa.AlphaMode = Enum.AlphaMode.Overlay;
	return sa;
}

export interface DoorMaterials {
	woodName: string;
	brassName: string;
	brassSubtleName: string;
	woodGrain: WoodGrain;
	woodAppearance?: SurfaceAppearance;
	brassAppearance?: SurfaceAppearance;
	brassSubtleAppearance?: SurfaceAppearance;
}

function parseGrain(value: string): WoodGrain {
	for (const g of WOOD_GRAINS) {
		if (g === value) return g;
	}
	return "plank";
}

const materialCache: Record<string, DoorMaterials> = {};

export function createDoorMaterials(
	pause: () => void,
	woodGrain = "plank",
): DoorMaterials {
	const grain = parseGrain(woodGrain);
	const cached = materialCache[grain];
	if (cached) return cached;
	const safePause = () => {
		pcall(pause);
	};

	const woodColorMap = writeMap((x, y) => woodOverlay(grain, x, y));
	const woodRoughMap = writeMap((x, y) => woodRough(grain, x, y));
	const woodMetalMap = writeMap(() => woodMetal());
	const brassColorMap = writeMap((x, y) => brassOverlay(x, y, false));
	const brassSubtleColorMap = writeMap((x, y) => brassOverlay(x, y, true));
	const brassRoughMap = writeMap(brassRough);
	const brassMetalMap = writeMap(() => brassMetal());

	const woodColorContent = imageContent(woodColorMap);
	const woodRoughContent = imageContent(woodRoughMap);
	const woodMetalContent = imageContent(woodMetalMap);
	const brassColorContent = imageContent(brassColorMap);
	const brassSubtleColorContent = imageContent(brassSubtleColorMap);
	const brassRoughContent = imageContent(brassRoughMap);
	const brassMetalContent = imageContent(brassMetalMap);

	const woodName = `DoorworksWood_${grain}`;
	upsertVariant(
		woodName,
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
	upsertVariant(
		"DoorworksSatinBrassSubtle",
		Enum.Material.Metal,
		brassSubtleColorContent,
		brassRoughContent,
		brassMetalContent,
	);

	const mats: DoorMaterials = {
		woodName,
		brassName: "DoorworksSatinBrass",
		brassSubtleName: "DoorworksSatinBrassSubtle",
		woodGrain: grain,
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
		brassSubtleAppearance: tryAppearance(safePause, {
			ColorMap: brassSubtleColorContent,
			RoughnessMap: brassRoughContent,
			MetalnessMap: brassMetalContent,
		}),
	};
	materialCache[grain] = mats;
	return mats;
}

export function applyWood(
	part: BasePart,
	mats: DoorMaterials,
	tint: Color3,
): void {
	part.Color = tint;
	part.Material = Enum.Material.Wood;
	part.MaterialVariant = mats.woodName;
	if (part.IsA("MeshPart") && mats.woodAppearance) {
		for (const old of part.GetChildren()) {
			if (old.IsA("SurfaceAppearance")) old.Destroy();
		}
		const sa = mats.woodAppearance.Clone();
		sa.AlphaMode = Enum.AlphaMode.Overlay;
		sa.Parent = part;
	}
}

export function applySatinBrass(
	part: BasePart,
	mats: DoorMaterials,
	subtle = false,
): void {
	part.Material = Enum.Material.Metal;
	part.MaterialVariant = subtle ? mats.brassSubtleName : mats.brassName;
	part.Reflectance = 0;
	const src = subtle ? mats.brassSubtleAppearance : mats.brassAppearance;
	if (part.IsA("MeshPart") && src) {
		for (const old of part.GetChildren()) {
			if (old.IsA("SurfaceAppearance")) old.Destroy();
		}
		const sa = src.Clone();
		sa.AlphaMode = Enum.AlphaMode.Overlay;
		sa.Parent = part;
	}
}
