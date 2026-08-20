import { type OnStart, Service } from "@flamework/core";
import { Lighting, Workspace } from "@rbxts/services";
import { buildPlace } from "../place/build";

@Service({})
export class PlaceService implements OnStart {
	public onStart(): void {
		this.applyPlaygroundLighting();
		buildPlace(Workspace);
	}

	private applyPlaygroundLighting(): void {
		Lighting.ClockTime = 14.5;
		Lighting.Brightness = 2.4;
		Lighting.Ambient = Color3.fromRGB(90, 94, 102);
		Lighting.OutdoorAmbient = Color3.fromRGB(110, 114, 124);
		Lighting.FogStart = 400;
		Lighting.FogEnd = 2000;

		if (!Lighting.FindFirstChildOfClass("Sky")) {
			const sky = new Instance("Sky");
			sky.Parent = Lighting;
		}
	}
}
