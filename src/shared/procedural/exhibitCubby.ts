import { part } from "./parts";

export interface ExhibitCubbyParams {
	title: string;
	description: string;
	/** Interior width (X) and depth (Z). Height of walls is separate. */
	width?: number;
	depth?: number;
	wallHeight?: number;
}

const FLOOR_COLOR = Color3.fromRGB(36, 38, 44);
const WALL_COLOR = Color3.fromRGB(28, 30, 36);
const TRIM = Color3.fromRGB(72, 76, 88);

/**
 * Open-front booth: floor, back, two sides. SurfaceGui on the floor, bottom-right.
 * Local origin is the floor center; floor top is at y = 0.5 (1-stud slab).
 */
export function generateExhibitCubby(
	target: Instance,
	params: ExhibitCubbyParams,
): Model {
	const width = params.width ?? 20;
	const depth = params.depth ?? 14;
	const wallH = params.wallHeight ?? 12;
	const floorH = 1;
	const wallT = 0.4;

	const model = new Instance("Model");
	model.Name = "Cubby";
	model.Parent = target;

	const floor = part(
		model,
		"Floor",
		new Vector3(width, floorH, depth),
		new CFrame(0, floorH / 2, 0),
		FLOOR_COLOR,
		Enum.Material.SmoothPlastic,
	);
	floor.CanCollide = true;

	part(
		model,
		"BackWall",
		new Vector3(width + wallT * 2, wallH, wallT),
		new CFrame(0, floorH + wallH / 2, -depth / 2 - wallT / 2),
		WALL_COLOR,
		Enum.Material.SmoothPlastic,
	);
	part(
		model,
		"LeftWall",
		new Vector3(wallT, wallH, depth),
		new CFrame(-width / 2 - wallT / 2, floorH + wallH / 2, 0),
		WALL_COLOR,
		Enum.Material.SmoothPlastic,
	);
	part(
		model,
		"RightWall",
		new Vector3(wallT, wallH, depth),
		new CFrame(width / 2 + wallT / 2, floorH + wallH / 2, 0),
		WALL_COLOR,
		Enum.Material.SmoothPlastic,
	);

	const plaque = part(
		model,
		"Plaque",
		new Vector3(5.5, 0.08, 2.4),
		new CFrame(-width / 2 + 3.1, floorH + 0.06, depth / 2 - 1.5),
		TRIM,
		Enum.Material.SmoothPlastic,
	);
	attachPlaqueGui(plaque, params.title, params.description);

	model.WorldPivot = new CFrame();
	return model;
}

function attachPlaqueGui(
	plaque: BasePart,
	title: string,
	description: string,
): void {
	const gui = new Instance("SurfaceGui");
	gui.Name = "ExhibitLabel";
	gui.Face = Enum.NormalId.Top;
	gui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
	gui.PixelsPerStud = 50;
	gui.LightInfluence = 0.15;
	gui.AlwaysOnTop = false;
	gui.Parent = plaque;

	const titleLabel = new Instance("TextLabel");
	titleLabel.Name = "Title";
	titleLabel.BackgroundTransparency = 1;
	titleLabel.AnchorPoint = new Vector2(1, 1);
	titleLabel.Position = UDim2.fromScale(0.96, 0.48);
	titleLabel.Size = UDim2.fromScale(0.92, 0.4);
	titleLabel.Font = Enum.Font.GothamBold;
	titleLabel.Text = title;
	titleLabel.TextColor3 = Color3.fromRGB(245, 245, 248);
	titleLabel.TextXAlignment = Enum.TextXAlignment.Right;
	titleLabel.TextYAlignment = Enum.TextYAlignment.Bottom;
	titleLabel.TextScaled = true;
	titleLabel.Parent = gui;

	const body = new Instance("TextLabel");
	body.Name = "Description";
	body.BackgroundTransparency = 1;
	body.AnchorPoint = new Vector2(1, 0);
	body.Position = UDim2.fromScale(0.96, 0.52);
	body.Size = UDim2.fromScale(0.92, 0.42);
	body.Font = Enum.Font.Gotham;
	body.Text = description;
	body.TextColor3 = Color3.fromRGB(180, 184, 196);
	body.TextXAlignment = Enum.TextXAlignment.Right;
	body.TextYAlignment = Enum.TextYAlignment.Top;
	body.TextWrapped = true;
	body.TextScaled = true;
	body.Parent = gui;
}
