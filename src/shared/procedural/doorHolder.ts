import { part } from "./parts";

export interface DoorHolderAttributes {}

export const DEFAULT_DOOR_HOLDER_ATTRIBUTES: DoorHolderAttributes = {};

/** Loader arms, scream canister, and keypad. Stub until we build this next. */
export function generateDoorHolder(
	target: Instance,
	params: { size: Vector3; attributes: DoorHolderAttributes },
): void {
	const size = params.size;
	const metalDark = Color3.fromRGB(92, 96, 102);
	const metalLight = Color3.fromRGB(176, 180, 186);
	const extraX = 1.35;

	part(
		target,
		"ArmLeft",
		new Vector3(0.45, 4.2, 0.45),
		new CFrame(-size.X / 2 - extraX - 0.7, 0.2, 0.4),
		metalLight,
		Enum.Material.Metal,
	);
	part(
		target,
		"Keypad",
		new Vector3(1.6, 1.8, 0.25),
		new CFrame(-size.X / 2 - extraX - 1.5, 1.4, -0.2),
		metalDark,
		Enum.Material.Metal,
	);
	part(
		target,
		"ArmRight",
		new Vector3(0.55, 3.6, 0.55),
		new CFrame(size.X / 2 + extraX + 0.85, 0.4, 0.5),
		metalLight,
		Enum.Material.Metal,
	);
	part(
		target,
		"CanisterMount",
		new Vector3(1.4, 0.7, 1.1),
		new CFrame(size.X / 2 + extraX + 1.4, -0.6, -0.15),
		metalDark,
		Enum.Material.Metal,
	);
}
