import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import {_getOrderInfo,_getExpress,_getTrack} from "./../../util/api.js"
import { AtActionSheet, AtActionSheetItem } from "taro-ui"
import './index.scss'

class Index extends Component {

  config = {
    navigationBarTitleText: '物流'
  }
  state={
    "locactions": [],
    "sends": [],
    "expressdata": [],//快递信息
    "nowClientIndex": 0,
    "visible": false
  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  componentDidMount(){
   
  }
  componentWillUnmount () { }

  componentDidShow () {
    this.getOrderInfo();
  }

  componentDidHide () { }
  showModal = () => {
      this.setState({
          visible: true,
      });
  }

  //获取快递信息
  getExpress = () => {
      let send = this.state.sends[this.state.nowClientIndex];
      console.log(send);
      let params = {
          code: send.send_memo.split(",")[1],
          shipper: send.send_memo.split(",")[4],
      }
      // let params = {
      //     code: 494284683027,
      //     shipper: 145,
      // }
      _getExpress(params).then((res) => {
          let json = res;
          if (json.result === 1) {
              if (json.data !== null) {
                  this.setState({
                      expressdata: json.data.traces
                  })
              } else {
                  this.setState({
                      expressdata: []
                  })
              }
          } else {
              Toast.fail(json.message);
          }
      })
  }
  //获取轨迹
  getTrack = () => {
      let {orderId} = this.$router.params;
      let params = {
          oid: orderId,
          isl: 1,
          userid: this.state.sends[this.state.nowClientIndex].send_uid
      }
      _getTrack(params).then((res) => {
          let json =res;
          if (json.result === 1) {
              if (json.data !== null) {
                  this.setState({
                      locactions: json.data.locactions
                  })
              }
          } else {
            Taro.showToast({
              title:json.message,
              icon:"fail"
            })
          }
      }).then(() => {
          // this.createBMapTract();
      })
  }
  changeSend = (nowClientIndex) => {
      this.setState({
          nowClientIndex: nowClientIndex,
          visible: false,
          locactions: [],
          "expressdata": [],//快递信息
      })
      if (this.state.sends[nowClientIndex]) {
          let send = this.state.sends[nowClientIndex];
          if (send.send_type === 1) {
              setTimeout(() => {
                  this.getTrack();
              }, 300);
          } else if (send.send_type === 2) {
              setTimeout(() => {
                  this.getExpress();
              }, 300);
          }
      }
  }

  getOrderInfo = ()=>{
    let {orderId} = this.$router.params;
    Taro.showLoading({
      title:"正在获取数据",
      mask:true
    });
    let params = {
      orderid: orderId
    }
    _getOrderInfo(params).then((res)=>{
      Taro.hideLoading();
      let json = res;
      if (json.result === 1) {
          let order = json.data.order ? json.data.order : {};
          if (order.sends !== null && order.sends.length > 0) {
              let queryType = order.sends[this.state.nowClientIndex].send_type;
              this.setState({
                  sends: order.sends,
              })

              if (queryType === 2) {
                  setTimeout(() => {
                      this.getExpress();
                  }, 300);

              } else if (queryType === 1) {
                  setTimeout(() => {
                      this.getTrack();
                  }, 300);
              }
          } else {
              this.setState({
                  sends: []
              })
          }
      } else {
          Taro.showToast({
            title:json.message,
            icon:"fail"
          })
      }
    })
  }
  render () {
    let {orderId} = this.$router.params;
    let {locactions,sends,expressdata,nowClientIndex,visible} = this.state;
    console.log(locactions,sends,expressdata,nowClientIndex,visible);
    let send = sends[nowClientIndex];
    let send_type
    if (send) {
        send_type = send.send_type; //1我司送货 2-快递 3-第三方个人
    }else{
        send_type = 4;//没有物流信息
    }
    switch (send_type) {
      case 1:
        let len = locactions ? locactions.length : 0;
        // statements_1
        break;
      case 2:
        // statements_1
        break;
      case 3:
        // statements_1
        break;
      case 4:
        // statements_1
        break;
      default:
        // statements_def
        break;
    }

    return (
      <View className='logisticsPage'>
          {
            send_type==1?<View className="trackPage">
                      <View className="title" onClick={this.showModal}>
                          <Text className="send_type_des">公司送货人</Text>{send.sendUName}
                          <Text type="right" style={{ "float": "right", "marginTop": "0.2rem" }} />
                      </View>
                      <View className="trackInfo">
                          共计{len}个轨迹点
                      </View>
                      <View className="map_wrap">
                          <View className="map_canvas" ref="map_canvas" id="map_canvas">

                          </View>
                          <View className="swiper">
                              
                          </View>
                      </View>

                  </View>:<View />
          }
          <AtActionSheet isOpened={visible} cancelText='取消' title='选择送货选项'>
            {
              sends.map((item, index) => {
                var nowClientIndex = sends.indexOf(item);
                return <AtActionSheetItem key={index} style={{ "textAlign": "center" }} onClick={this.changeSend.bind(this, nowClientIndex)}>{
                    item.send_type === 1 ? "公司送货人：" + item.sendUName : (item.send_type === 2 ? item.send_memo.split(",")[0] : "第三方个人：" + item.send_memo.split(",")[0])
                }</AtActionSheetItem>
              })
            }
          </AtActionSheet>
      </View>
    )
  }
}

export default Index
