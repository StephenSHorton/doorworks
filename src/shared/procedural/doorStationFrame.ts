import { part } from "./parts";

export interface DoorStationFrameAttributes {
	DoorNumber: number;
}

export const DEFAULT_DOOR_STATION_FRAME_ATTRIBUTES: DoorStationFrameAttributes =
	{
		DoorNumber: 12,
	};

/** Metal dock around the door — header, sides, back, red beacon. Not used yet. */
export function generateDoorStationFrame(
	target: Instance,
	params: { size: Vector3; attributes: DoorStationFrameAttributes },
): void {
	const size = params.size;
	const depth = math.max(size.Z, 0.55);
	const metal = Color3.fromRGB(148, 152, 158);
	const metalDark = Color3.fromRGB(92, 96, 102);
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

	const plate = part(
		target,
		"NumberPlate",
		new Vector3(1.5, 0.55, 0.08),
		new CFrame(0, size.Y / 2 + extraY / 2 + 0.05, -depth / 2 - 0.55),
		Color3.fromRGB(196, 152, 72),
		Enum.Material.Metal,
	);
	const gui = new Instance("SurfaceGui");
	gui.Face = Enum.NormalId.Front;
	gui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
	gui.PixelsPerStud = 50;
	gui.Parent = plate;
	const label = new Instance("TextLabel");
	label.BackgroundTransparency = 1;
	label.Size = new UDim2(1, 0, 1, 0);
	label.Text = tostring(params.attributes.DoorNumber);
	label.TextColor3 = Color3.fromRGB(40, 28, 16);
	label.Font = Enum.Font.GothamBold;
	label.TextScaled = true;
	label.Parent = gui;
}
