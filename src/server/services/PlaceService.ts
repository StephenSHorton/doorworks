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
		Lighting.ClockTime = 22;
		Lighting.Brightness = 1.4;
		Lighting.Ambient = Color3.fromRGB(36, 38, 52);
		Lighting.OutdoorAmbient = Color3.fromRGB(24, 26, 36);
		Lighting.FogColor = Color3.fromRGB(18, 20, 28);
		Lighting.FogStart = 80;
		Lighting.FogEnd = 420;

		if (!Lighting.FindFirstChildOfClass("Sky")) {
			const sky = new Instance("Sky");
			sky.Parent = Lighting;
		}
	}
}
