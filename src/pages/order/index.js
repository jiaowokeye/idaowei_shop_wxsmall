import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { AtSegmentedControl,AtButton } from 'taro-ui'
import {_getOrderList,_updateOrderStatus,_pay} from "./../../util/api.js"
import c_img_default from "./../../assets/image/commodity_default.png"
import './index.scss'


class Index extends Component {
  config = {
    navigationBarTitleText: '我的订单'
  }
  state = {
    current:0,
    data:[]
  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  componentDidMount(){
    this.getOrderList();
  }
  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }
  handleClick (value) {
    this.setState({
      current: value
    })
    setTimeout(()=>{
      this.getOrderList();
    },200)
  }
  getOrderList(){
    let status = "";
    switch (this.state.current) {
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
    }
    let params = {
        startdate: "",
        enddate: "",
        status: status,
        dtype: 2,
        stype: 1,
        balance: - 1,
        userid: 0,
        customerid: -1,
        pageNo: 1,
        pageSize: 50,
        new: 1,
        sdetails: "7",
        otype: 5,
        islist: 1,
        trans_type: 6
    }
    Taro.showLoading({
      title:"正在加载列表",
      mask:true
    });
    _getOrderList(params).then((res)=>{
      Taro.hideLoading();
      this.setState({
        data:res.data.paginationData
      })
    })
  }
  //付款
  pay = (orderid)=>{
    _pay(orderid);
  }
  //取消订单
  cancleOrder = (orderid)=>{

    let params = {
        orderid: orderid,
        status: 2,//撤销
    }
    Taro.showModal({
      title: '取消确认',
      content: '是否取消订单',
      success:(res)=> {
        if (res.confirm) {
          _updateOrderStatus(params).then((res)=>{
              this.getOrderList()
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
  showOrderDetail = (orderid)=>{
    Taro.navigateTo({
      url:"./../orderDetail/index?orderId="+orderid,
    })
  }
  render () {
    return (
      <View className='orderPage'>
        <AtSegmentedControl
          values={['全部订单','待付款','待发货',"已发货","已完成"]}
          onClick={this.handleClick.bind(this)}
          current={this.state.current}
        />
        <View className='tab-content orderListWrap' id='orderListWrap'>
          {
            this.state.data.map((e,i)=>{
              let orderTypePObj= {
                  "-1": "待付款",
                  "0": "待发货",
                  "1": "已发货",
                  "3": "已完成",
                  "4": "待发货",
                  "5": "已发货",
                  "2": "已取消",
                  "8": "已取消"
              }
              let details = e.details ? e.details : [];
              let status = e.status;
              return (
                /*
                onClick={()=>window.isHasPopState = false} to={"detail?order_id=" + this.state.data.order_id}
                 */
                <View className="orderItem">
                  <View onClick={this.showOrderDetail.bind(this,e.order_id)}>
                    <View>
                        <View className="order_id">
                            订单编号：{e.order_id}
                            <View className="status">
                              {
                                  orderTypePObj[e.status]
                              }
                            </View>
                        </View>
                    </View>
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
                    <View className={"otherPrice"}>
                        <View style={{"textAlign":"right"}}>
                            运费:￥<span style={{ fontSize: "16px" }}>{e.express_fee ? e.express_fee : 0}</span>
                            &nbsp;&nbsp;&nbsp;合计:￥<span style={{ fontSize: "16px" }}>{(Number(e.order_sum) + Number(e.express_fee)).toFixed(2)}</span>
                        </View>
                    </View>
                  </View>
                  <View className={[2, 8].indexOf(status) === -1 ? "" :"hide"}>
                      <View className="shopBtnWrap">
                          <View style={{"margin":"0 5px"}} onClick={this.cancleOrder.bind(this,e.order_id)} className={[-1, 0,4].indexOf(status) === -1 ? "hide" : "shopBtn"}>取消订单</View>
                          <View type="primary" style={{"margin":"0 5px"}} onClick={this.pay.bind(this,e.order_id)} className={status !== -1 ? "payBtn hide" : "payBtn shopBtn"}>付款</View>
                          <View style={{"margin":"0 5px"}} onClick={this.toLogistics.bind(this,e.order_id)} className={[1,3,5].indexOf(status) === -1 ? "hide" : "shopBtn"}>查看物流</View>
                      </View>

                  </View>
                </View>
              )
            })
          }
        </View>
      </View>
    )
  }
}

export default Index
