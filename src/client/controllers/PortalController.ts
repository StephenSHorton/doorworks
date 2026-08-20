import { Controller, type OnStart } from "@flamework/core";
import { PortalGroup } from "@rbxts/immersive-portals";
import { Workspace } from "@rbxts/services";
import { PORTAL_TAG, WORLD_NAME } from "shared/game";

@Controller({})
export class PortalController implements OnStart {
	private readonly group = new PortalGroup({
		autoDiscoverTag: PORTAL_TAG,
		defaultPortalConfig: { teleportCooldown: 0.25 },
	});

	public onStart(): void {
		const world = Workspace.WaitForChild(WORLD_NAME);
		this.group.enableAutoDiscovery();
		this.group.setWorld(world);
		this.group.trackAllPlayers();
		this.group.bind();
	}
}
