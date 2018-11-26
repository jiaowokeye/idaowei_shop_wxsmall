import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import {_getOrderInfo,_updateOrderStatus} from "./../../util/api.js"
import { AtSteps } from 'taro-ui'
import c_img_default from "./../../assets/image/commodity_default.png"
import './index.scss'
class Index extends Component {

  config = {
    navigationBarTitleText: '订单详情'
  }
  state = {
    "waitpay":false,
    "current": -1,
    "step1Date": "",
    "step2Date": "",
    "step3Date": "",
    "data": {},
    "isgetInfo": false
  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  componentWillUnmount () { }

  componentDidShow () { 
    this.getOrderInfo();
  }
  getOrderInfo = () => {
    let {orderId} = this.$router.params;
    Taro.showLoading({
      title:"正在获取数据",
      mask:true
    });
    let params = {
        orderid: orderId
    }
    _getOrderInfo(params).then((res)=>{
      console.log(res);
      this.setState({
        data:res.data.order
      })
      this.handleStatus(res.data.order);
      Taro.hideLoading();
    })
  }
  handleStatus = (data) => {
    console.log(data);
    let status = data.status;
    switch (status) {
        case -1://待付款
            this.setState({
                "current": 0,
                "step1Date": "",
                "step2Date": "",
                "step3Date": "",
                "waitpay":true,
            })
            break;
        case 0://待处理
        case 4://已配货
            this.setState({
                "current": 0,
                "step1Date": data.pay_time ? data.pay_time.substring(0, 16) : "",
                "step2Date": "",
                "step3Date": "",
                "waitpay":false,
            }) 
            break;
        case 5://配送中
        case 1://待送货
            this.setState({
                "current": 1,
                "step1Date": data.pay_time ? data.pay_time.substring(0, 16) : "",
                "step2Date": data.send_date ? data.send_date.substring(0, 16) : "",
                "step3Date": "",
                "waitpay":false,
            })
            break;
        case 3://已完成
            let sends = data.sends ? data.sends : [];
            let signer_date = data.signer_date ? data.signer_date : (sends[sends.length - 1].send_endtime);
            this.setState({
                "current": 2,
                "step1Date": data.pay_time ? data.pay_time.substring(0, 16) : "",
                "step2Date": data.send_date ? data.send_date.substring(0, 16) : "",
                "step3Date": signer_date.substring(0, 16),
                "waitpay":false,
            })
            break;
        default:
            this.setState({
                "current": -2,
                "step1Date": "",
                "step2Date": "",
                "step3Date": "",
                "waitpay":false,
            })
            break;
    }
  }
  //取消订单
  cancleOrder = (orderid)=>{
    this.updateOrderStatus(2,orderid);
  }
  //确认收货
  receipt = (orderid)=>{
    this.updateOrderStatus(3,orderid);
  }
  updateOrderStatus = (status,orderid)=>{
    let params = {
        orderid: orderid,
        status: status,//撤销
    }
    Taro.showModal({
      content: status==2?'是否取消订单':'是否确认收货',
      success:(res)=> {
        if (res.confirm) {
          _updateOrderStatus(params).then((res)=>{
              this.getOrderInfo();
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  }
  //查看物流
  toLogistics = (orderid)=>{
    Taro.navigateTo({
      url:"./../logistics/index?orderId="+orderid,
    })
  }
  componentDidHide () { }
  render () {
    let {orderId} = this.$router.params;
    let {step1Date,step2Date,step3Date,current,data,waitpay} = this.state;
    let details = data.details?data.details:[];
    let status = data.status;
    const items = [
      { 'title': '买家付款', 'desc': step1Date },
      { 'title': '卖家发货', 'desc': step2Date },
      { 'title': '交易成功', 'desc': step3Date }
    ]
    const pay_type = {
        "0":"未知",
        "1":"微信",
        "2":"支付宝"
    }
    return (
      <View className='orderDetailPage'>
        <View className={waitpay?"":"hide"}>等待买家付款</View>
        <AtSteps
          items={items}
          current={current}
          onChange={this.onChange.bind(this)}
        />
        <View className="addressWrap" onClick={this.chooseAddress}>
          <View>
            <View style={{position:"relative"}}>
              <View className="perinfo" >{data.contacts}<Text>{data.phone}</Text></View>
            </View>
            <View className="address" span={24}>地址：{data.send_address}</View>
          </View>
        </View>
        <View className="orderItem">
          {
            details.map((item, j) => {
                return (<View className="cartItem" key={j}>
                    <View className="shopImgWrap">
                        <Image key={"img" + j} alt="图片" className="shopImg" src={item.c_pic ? item.c_pic : c_img_default} />
                    </View>
                    <View className="shopNameWrap">
                        <View className="c_name" key={"name" + j}>{item.c_name}</View>
                    </View>
                    <View className="shopOthetInfo">
                        <View className="price">￥{Number(item.price).toFixed(2)}</View>
                        <View className="count">{"x" + item.count}</View>
                    </View>
                </View>)
            })
          }
        </View>
        <View className="price_wrap">
            <View className="at-row-wrap">
              <View className="at-row">
                  <View className="at-col">
                      商品总额：
                  </View>
                  <View className="at-col" style={{"textAlign":"right"}}>
                      ￥{Number(data.order_sum).toFixed(2)}
                  </View>
                 
              </View>
              <View className="at-row">
                <View className="at-col">
                    运费：
                </View>
                <View className="at-col" style={{"textAlign":"right"}}>
                    ￥{Number(data.express_fee).toFixed(2)}
                </View>
              </View>
            </View>
            <View className="at-row-modal">
                <View style={{"textAlign":"right"}}>
                    总价￥{(Number(data.express_fee) + Number(data.order_sum)).toFixed(2)}
                </View>
            </View>
            <View className="at-row">
                买家留言：<span className="des">{this.state.data.remark}</span>
            </View>
        </View>
        {
          waitpay?
          <View>
              <View className="other_info_wrap">
                  <View>
                      订单编号：{data.order_id}
                  </View>
                  <View>
                      提单时间：{data.order_date}
                  </View>
              </View>
          </View>
          :
          <View>
              <View className="other_info_wrap">
                  <View className="">
                      实付金额：￥{Number(data.income_sum).toFixed(2)}
                  </View>
                  <View>
                      支付方式：{pay_type[data.pay_type]}
                  </View>
                  <View>
                      订单编号：{data.order_id}
                  </View>
                  <View>
                      提单时间：{data.order_date?data.order_date.substring(0,16):""}
                  </View>
                  <View>
                      付款时间：{data.pay_time?data.pay_time.substring(0,16):""}
                  </View>
              </View>
          </View>
        }

        <View className="statics">
          <View className={[2, 8].indexOf(status) === -1 ? "at-row" :"hide"}>
              <View className="at-col at-col-5">
                {
                  waitpay?<View className="eval">应付金额：<Text className="sumPrice">￥{(Number(data.express_fee) + Number(data.order_sum)).toFixed(2)}</Text></View>:<View />
                }
              </View>
              <View className="shopBtnWrap at-col at-col-7">
                  <View style={{"margin":"0 5px"}} onClick={this.cancleOrder.bind(this,orderId)} className={[-1, 0,4].indexOf(status) === -1 ? "hide" : "shopBtn"}>取消订单</View>
                  <View type="primary" style={{"margin":"0 5px"}} className={status !== -1 ? "payBtn hide" : "payBtn shopBtn"}>付款</View>
                  <View style={{"margin":"0 5px"}} onClick={this.toLogistics.bind(this,orderId)} className={[1,3,5].indexOf(status) === -1 ? "hide" : "shopBtn"}>查看物流</View>
                  <View style={{"margin":"0 5px"}} onClick={this.receipt.bind(this,orderId)} className={[1,5].indexOf(status) === -1 ? "hide" : "shopBtn"}>确认收货</View>
                  <View style={{"margin":"0 5px"}} className={waitpay ? "hide" : "shopBtn"}>申请退款</View>
              </View>

          </View>
        </View>
      </View>
    )
  }
}

export default Index
