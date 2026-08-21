import {
	DEFAULT_CLOSET_DOOR_ATTRIBUTES,
	generateClosetDoor,
} from "./closetDoor";

/**
 * Roblox ProceduralModel generator module.
 * @see https://create.roblox.com/docs/parts/procedural-models
 * @see https://create.roblox.com/docs/reference/engine/classes/ProceduralModel
 */
const ClosetDoorGenerator = {
	Attributes: DEFAULT_CLOSET_DOOR_ATTRIBUTES,
	OnGenerate: (
		parameters: {
			Size: Vector3;
			Attributes: typeof DEFAULT_CLOSET_DOOR_ATTRIBUTES;
			Pause: (this: unknown) => void;
		},
		targetContainer: Instance,
	): void => {
		generateClosetDoor(targetContainer, {
			size: parameters.Size,
			attributes: {
				...DEFAULT_CLOSET_DOOR_ATTRIBUTES,
				...parameters.Attributes,
			},
			pause: () => parameters.Pause(),
		});
	},
};

export = ClosetDoorGenerator;
