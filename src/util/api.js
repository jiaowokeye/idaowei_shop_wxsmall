import API from "./request.js";
import Taro from "@tarojs/taro";
//登录 通过code换token；
export function _login(data){
	return API.post("comp/weichart.do?auth",data).then((res)=>{
		Taro.setStorageSync("token",res.token);
		Taro.setStorageSync("open_id",res.open_id);
	});
}
//支付  order_id 订单id callback 回调
export function _pay(order_id,callback){
	let params = {
        order_id: order_id,
        open_id: Taro.getStorageSync("open_id")
    }
    API.post("comp/weichart.do?unifiedOrder",params).then((res)=>{
    	let json = res;
    	let data = json.data;
        let param_str_obj = {
            timestamp: "1414723233",
            nonceStr: data.nonce_str,
            package: 'prepay_id=' + data.prepay_id,
            signType: 'MD5', // 注意：新版支付接口使用 MD5 加密
        }
        param_str_obj["timeStamp"] = param_str_obj["timestamp"];
	    delete param_str_obj["timestamp"];
	    let params = {
	        param_str: JSON.stringify(param_str_obj)
	    }
	    API.post("comp/weichart.do?getSign",params).then((res)=>{
	    	let option = JSON.parse(JSON.stringify(param_str_obj));
            option.paySign = res.data;
            option.success = () => {
            	Taro.showToast({
					title:"支付成功",
					icon:"none"
				})
				setTimeout(callback,1000);
            }
            option.cancel = () => {
            	Taro.showToast({
					title:"取消支付",
					icon:"none"
				})
				setTimeout(callback,1000);
            }
            Taro.requestPayment(option)
	    })
    })
}


//首页的
//
//
//获取商品列表
export function _getCommodityList(data){
	return API.post("comp/commodity.do?list",data);
}

//获取商品分类
export function _getMenuTree(data){
	return API.post("sys/codeitem.do?getMenuTree",data);
}

//添加购物车
export function _addCart(data){
	return API.post("comp/order/cart.do?add",data);
}
//商品详情
export function _getCommodityInfo(data){
	return API.post("comp/commodity.do?info",data);
}

//购物车页///
//
//

//获取购物车列表
export function _getCartList(data){
	return API.post("comp/order/cart.do?list",data);
}

//从购物车删除
export function _deleteCart(data){
	return API.post("comp/order/cart.do?delete",data);
}
//更新购物车
export function _updateCart(data){
	return API.post("comp/order/cart.do?update",data);
}
//提单
export function _oCrtOrUpt(data){
	return API.post("comp/order.do?oCrtOrUpt",data);
}

//获取运费
export function _getfreight(data){
	return API.post("comp/order/freight.do?price",data);
}
//获取地址列表
export function _getaddress(data){
	return API.post("comp/order/send/address.do?find",data);
}
//删除地址
export function _deladdress(data){
	return API.post("comp/order/send/address.do?delete",data);
}
//添加地址
export function _addaddress(data){
	return API.post("comp/order/send/address.do?add",data);
}
//更新地址
export function _updateaddress(data){
	return API.post("comp/order/send/address.do?update",data);
}

//获取省市区列表
export function _getprovice(data){
	return API.post("sys/province.do?all",data);
}



//订单物流详情页
//
//获取快递信息
export function _getExpress(data){
	return API.post("common.do?express",data);
}
//获取轨迹
export function _getTrack(data){
	return API.post("comp/order/send.do.do?track",data);
}
//获取订单详情
export function _getOrderInfo(data){
	return API.post("comp/order.do?info",data);
}
//订单
//更改订单状态
export function _updateOrderStatus(data){
	return API.post("comp/order.do?uptStatus",data);
}

//获取订单列表
export function _getOrderList(data){
	/*
 		case 0://全部订单
            status = "-1,0,1,5,4,3,8,2";
            break;
        case 1://待付款
            status = "-1"
            break;  
        case 2://待发货
            status = "0,4"
            break;
        case 3://已发货
            status = "1,5"
            break;
        case 4://已完成
            status = "3" 
            break;
        default:
            break;
	 */
	return API.post("comp/order.do?list",data);
}

//微信支付相关
//统一下单
export function _unifiedOrder(data){
	return API.post("comp/weichart.do?unifiedOrder",data);
}
//获取签名
export function _getSign(){
	return API.post("comp/weichart.do?getSign",data);
}