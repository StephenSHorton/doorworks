import { type OnStart, Service } from "@flamework/core";
import { Lighting, Workspace } from "@rbxts/services";
import { buildPlace } from "../place/build";

@Service({})
export class PlaceService implements OnStart {
	public onStart(): void {
		this.applyNightShiftLighting();
		buildPlace(Workspace);
	}

	private applyNightShiftLighting(): void {
		Lighting.ClockTime = 20.5;
		Lighting.Brightness = 2;
		Lighting.Ambient = Color3.fromRGB(70, 72, 88);
		Lighting.OutdoorAmbient = Color3.fromRGB(48, 50, 62);
		Lighting.FogColor = Color3.fromRGB(28, 30, 40);
		Lighting.FogStart = 200;
		Lighting.FogEnd = 800;

		if (!Lighting.FindFirstChildOfClass("Sky")) {
			const sky = new Instance("Sky");
			sky.Parent = Lighting;
		}
	}
}
