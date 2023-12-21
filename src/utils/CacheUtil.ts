import {DEFAULT_SETTINGS, SyncCnblogSettings} from "../Setting";

export default class CacheUtil {
	settings: SyncCnblogSettings;
	private static instance: CacheUtil;
	private constructor() {
	}
	public static getInstance(): CacheUtil {
		if (!CacheUtil.instance) {
			CacheUtil.instance = new CacheUtil();
		}
		return CacheUtil.instance;
	}
	public static getSettingData(): SyncCnblogSettings{
		return this.getInstance().settings;
	}
	public static setSettingData(settings: SyncCnblogSettings): void {
		this.getInstance().settings = settings;
	}
	public static loadData(): void {
		// CacheUtil.setSettingData(Object.assign({}, DEFAULT_SETTINGS, await this.loadData()));
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
