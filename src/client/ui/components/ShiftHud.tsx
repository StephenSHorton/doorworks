// biome-ignore lint/correctness/noUnusedImports: Required for JSX
import Roact from "@rbxts/roact";

export function ShiftHud() {
	return (
		<frame
			AnchorPoint={new Vector2(0, 0)}
			Position={new UDim2(0, 20, 0, 20)}
			Size={new UDim2(0, 360, 0, 72)}
			BackgroundColor3={Color3.fromRGB(16, 18, 24)}
			BackgroundTransparency={0.2}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, 6)} />
			<uipadding
				PaddingTop={new UDim(0, 10)}
				PaddingBottom={new UDim(0, 10)}
				PaddingLeft={new UDim(0, 14)}
				PaddingRight={new UDim(0, 14)}
			/>
			<textlabel
				Size={new UDim2(1, 0, 0, 24)}
				BackgroundTransparency={1}
				Text="DOORWORKS  ·  NIGHT SHIFT"
				TextColor3={Color3.fromRGB(232, 168, 84)}
				TextSize={16}
				Font={Enum.Font.GothamBold}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
			<textlabel
				Position={new UDim2(0, 0, 0, 28)}
				Size={new UDim2(1, 0, 0, 24)}
				BackgroundTransparency={1}
				Text="Walk through the closet. The other side is a real room."
				TextColor3={Color3.fromRGB(210, 214, 220)}
				TextSize={14}
				Font={Enum.Font.Gotham}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextWrapped={true}
			/>
		</frame>
	);
}
