import {DEFAULT_SETTINGS, SyncCnblogSettings} from "../Setting";
import SyncCnblogPlugin from "../../main";
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


	/*// 缓存数据
cache_data: [
	{
		post_id : string,
		local_path: string,
		imgMap:[
			{
				local_img_path: string,
				net_img_path: string
			}
		]
	}

];*/

}
