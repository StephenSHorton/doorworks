// biome-ignore lint/correctness/noUnusedImports: Required for JSX
import Roact from "@rbxts/roact";
import { HealthBar } from "./components/HealthBar";
import { ShiftHud } from "./components/ShiftHud";

export function App() {
	return (
		<screengui ResetOnSpawn={false} IgnoreGuiInset={true}>
			<ShiftHud />
			<HealthBar />
		</screengui>
	);
}
