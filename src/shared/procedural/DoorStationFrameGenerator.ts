import {
	DEFAULT_DOOR_STATION_FRAME_ATTRIBUTES,
	generateDoorStationFrame,
} from "./doorStationFrame";


const DoorStationFrameGenerator = {
	Attributes: DEFAULT_DOOR_STATION_FRAME_ATTRIBUTES,
	OnGenerate: (
		parameters: {
			Size: Vector3;
			Attributes: typeof DEFAULT_DOOR_STATION_FRAME_ATTRIBUTES;
			Pause: (this: unknown) => void;
		},
		targetContainer: Instance,
	): void => {
		generateDoorStationFrame(targetContainer, {
			size: parameters.Size,
			attributes: {
				...DEFAULT_DOOR_STATION_FRAME_ATTRIBUTES,
				...parameters.Attributes,
			},
		});
	},
};

export = DoorStationFrameGenerator;
