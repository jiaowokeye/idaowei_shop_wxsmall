import Taro from "@tarojs/taro";
import qs from "qs";
const baseURI = process.env.NODE_ENV=="development"?"http://111.198.29.228:18080/core/":"http://bi.idaowei.com/core/";
const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
const checkStatus = (response,url)=> {
	//登录设置cookie
	if(url.indexOf("comp/weichart.do?auth")!==-1){
		Taro.setStorageSync("cookie",response.header["Set-Cookie"]);
	}
	if (response.statusCode >= 200 && response.statusCode < 300) {
		if(response.data.result!==0){
			return response.data;
		}else{
			Taro.showToast({
				title:response.data.message,
				icon:"none"
			})
		}
		
	}else{
		Taro.showToast({
			title:codeMessage[response.statusCode],
			icon:"none"
		})
	}
	
}
const Post = (url,data) => {
	const cookie = Taro.getStorageSync("cookie")?Taro.getStorageSync("cookie"):"";
	const token =  Taro.getStorageSync("token")?Taro.getStorageSync("token"):"";
	data = Object.assign({"productid":1,"os":3,"ver":0.8,"token":token,"rand":Math.random()},data);
	return Taro.request({
			url:baseURI+url,
			data: qs.stringify(data),
			header: {
				'content-type': 'application/x-www-form-urlencoded',
				'cookie':cookie		
			},
			method:"POST"
		}).then((res)=>checkStatus(res,url))
}

const Get = (url) => {
	const cookie = Taro.getStorageSync("cookie")?Taro.getStorageSync("cookie"):"";
	const token =  Taro.getStorageSync("token")?Taro.getStorageSync("token"):"";
	data = Object.assign({"productid":1,"os":3,"ver":0.8,"token":token,"rand":Math.random()},data);
	return Taro.request({
			url:baseURI+url,
			data: data,
			header: {
				'content-type': 'application/x-www-form-urlencoded',
				'cookie':cookie
			},
			method:"GET"
		}).then((res)=>checkStatus(res,url))
}

const API = {
	post:Post,
	get:Get
}

export default API;