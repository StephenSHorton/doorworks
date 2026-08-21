import { part } from "./parts";

export interface ExhibitCubbyParams {
	title: string;
	description: string;
	/** Pad size in X (width) and Z (depth). */
	width?: number;
	depth?: number;
}

const FLOOR_COLOR = Color3.fromRGB(36, 38, 44);
const TRIM = Color3.fromRGB(72, 76, 88);

/**
 * Exhibit pad only (no walls). Floor top is at y = 0 so content can sit on Y = 0.
 * Plaque SurfaceGui is the bottom-right corner from the open (+Z) side.
 */
export function generateExhibitCubby(
	target: Instance,
	params: ExhibitCubbyParams,
): Model {
	const width = params.width ?? 20;
	const depth = params.depth ?? 14;
	const floorH = 1;

	const model = new Instance("Model");
	model.Name = "Cubby";
	model.Parent = target;

	const floor = part(
		model,
		"Floor",
		new Vector3(width, floorH, depth),
		new CFrame(0, -floorH / 2, 0),
		FLOOR_COLOR,
		Enum.Material.SmoothPlastic,
	);
	floor.CanCollide = true;

	// 90° CCW from above, then the near-right corner of the pad (from spawn:
	// looking −Z, right is −X, near is +Z). Long axis runs along the front.
	const plaqueSize = new Vector3(5.5, 0.08, 2.4);
	const plaque = part(
		model,
		"Plaque",
		plaqueSize,
		new CFrame(
			-width / 2 + plaqueSize.X / 2 + 0.12,
			0.06,
			depth / 2 - plaqueSize.Z / 2 - 0.12,
		).mul(CFrame.Angles(0, math.pi, 0)),
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
