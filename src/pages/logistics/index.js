import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import {_getOrderInfo,_getExpress,_getTrack} from "./../../util/api.js"
import { AtActionSheet, AtActionSheetItem,AtTimeline } from "taro-ui"
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
  //画折线
  draw_line_direction = (weight) => {
      let BMap = window.BMap;
      let icons = new BMap.IconSequence(
          new BMap.Symbol('M0 -5 L-5 -2 L0 -4 L5 -2 Z', {
              scale: weight / 10,
              strokeWeight: 1,
              rotation: 0,
              fillColor: 'white',
              fillOpacity: 1,
              strokeColor: 'white'
          }), '100%', '5%', false);
      return icons;
  }
  //画地图
  createBMapTract = () => {

      let BMap = window.BMap;
      map = new BMap.Map('map_canvas');
      // 创建地图实例
      let initPoint = new BMap.Point(116.404, 39.915);
      // 创建点坐标
      map.centerAndZoom(initPoint, 11);
      //添加缩放按钮
      var top_right_navigation = new BMap.NavigationControl({ anchor: 1, type: 1 }); //右上角
      map.addControl(top_right_navigation);

      if(this.state.locactions !== null && this.state.locactions.length > 0){
          let locactions = this.state.locactions;
          let pointArr = [];
          for (let i = 0; i < locactions.length; i++) {
              pointArr.push(new BMap.Point(locactions[i].bd_longitude, locactions[i].bd_latitude));
          }
          //添加覆盖物
          // for(let i=0;i<pointArr.length;i++){
          //     let marker = new BMap.Marker(pointArr[i]);
          //     map.addOverlay(marker);
          // }
          var pointCollection = new BMap.PointCollection(pointArr, { shape:window.BMAP_POINT_SHAPE_WATERDROP});

          var polyline = new BMap.Polyline(pointArr, {
              strokeColor: "#25d462", strokeWeight: 4, strokeOpacity: 1,
              icons: [this.draw_line_direction(8)]
          });   //创建折线
          map.addOverlay(polyline);          //增加折线
          map.addOverlay(pointCollection);
          map.setViewport(pointArr);
      }
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
    let send = sends[nowClientIndex];
    let send_type = 4;//没有物流信息
    let len = 0;
    let timelineArr = [];
    if (send) {
      send_type = send.send_type; //1我司送货 2-快递 3-第三方个人
      if (send_type === 1) {
        len = locactions ? locactions.length : 0;
      }else if(send_type===2){
        let len = expressdata.length;
        for (let i = len - 1; i >= 0; i--) {
            timelineArr.push({
              title: expressdata[i].info, content: [expressdata[i].time] ,icon: (i!==len-1?'':'check-circle')
            })
        }
      }
    }
    console.log(timelineArr);
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
            </View>:<View className="none-info"></View>
          }
          {
            send_type==2?<View className="trackPage">
                        <View className="title" onClick={this.showModal}>
                            <Text className="send_type_des">快递公司</Text>{send.send_memo.split(",")[0]}
                            <Text type="right" style={{ "float": "right", "marginTop": "0.2rem" }} />
                            <View style={{"borderTop":"1px solid #dbdbdb"}}><span className="send_type_des">快递单号</span>{this.state.sends[this.state.nowClientIndex].send_memo.split(",")[1]}</View>
                        </View>
                        <View className="expressWrap">
                            <View>
                                <AtTimeline 
                                  items={timelineArr}
                                >
                                </AtTimeline>
                            </View>
                        </View>
                    </View>:<View className="none-info"></View>
          }
          {
            send_type==3?<View className="trackPage">
                        <View className="title" onClick={this.showModal} >
                            <Text className="send_type_des">第三方个人</Text>
                            {send.send_memo.split(",")[0]}{send.send_memo.split(",")[2]}
                            <Text type="right" style={{ "float": "right", "marginTop": "0.2rem" }} />
                        </View>
                        <View className="none-info">暂无信息</View>
                    </View>:<View className="none-info"></View>
          }
          {
            send_type==4?<View>
                    <View className="trackPage none-info">
                        暂无物流跟踪信息
                    </View>
                </View>:<View className="none-info"></View>
          }
          <AtActionSheet isOpened={visible} cancelText='取消' title='选择送货选项'>
            {
              sends.map((item, index) => {
                return <AtActionSheetItem key={index} style={{ "textAlign": "center" }} onClick={this.changeSend.bind(this, index)}>{
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
