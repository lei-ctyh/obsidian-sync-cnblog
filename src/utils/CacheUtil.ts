import {DEFAULT_SETTINGS, SyncCnblogSettings} from "../Setting";
import SyncCnblogPlugin from "../main";
export default class CacheUtil {
	private static settings: SyncCnblogSettings;
	public static getSettings(): SyncCnblogSettings{
		return this.settings;
	}
	public static setSettings(settings: SyncCnblogSettings): void{
		this.settings = settings;
	}
	public static async  saveSettings(): Promise<void>{
		return  SyncCnblogPlugin.getPluginThis().saveData(this.settings);
	}
}
