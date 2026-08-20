import {
	DEFAULT_DOOR_HOLDER_ATTRIBUTES,
	generateDoorHolder,
} from "./doorHolder";

const DoorHolderGenerator = {
	Attributes: DEFAULT_DOOR_HOLDER_ATTRIBUTES,
	OnGenerate: (
		parameters: {
			Size: Vector3;
			Attributes: typeof DEFAULT_DOOR_HOLDER_ATTRIBUTES;
			Pause: (this: unknown) => void;
		},
		targetContainer: Instance,
	): void => {
		generateDoorHolder(targetContainer, {
			size: parameters.Size,
			attributes: {
				...DEFAULT_DOOR_HOLDER_ATTRIBUTES,
				...parameters.Attributes,
			},
		});
	},
};

export = DoorHolderGenerator;
