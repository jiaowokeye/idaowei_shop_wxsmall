import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text ,Input} from '@tarojs/components'
import c_img_default from "./../../assets/image/commodity_default.png"
import './index.scss'
import {_getaddress,_oCrtOrUpt} from "./../../util/api.js"
class Index extends Component {

  config = {
    navigationBarTitleText: '提交订单'
  }
  state = {
    freight:0,
    remark:"",
    addressObj:{}
  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  componentDidMount(){
    this.getaddressList();
  }
  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  //获取收货地址
  getaddressList = ()=>{
    let params = {
        pageSize: 99999,
        pageNo: 1,
    }
    _getaddress(params).then((res)=>{
        this.setState({
          addressObj:res.data.paginationData?res.data.paginationData[0]:{}
        })
    });
  }
  onInput = (e)=>{
    this.setState({
      remark:e.detail.value
    })
  }
  //提单
  oCrtOrUpt = () => {
      let {sumPrice,selectData} = this.$router.params;
      let {freight,remark,addressObj} = this.state;
      if(Object.keys(addressObj).length==0){
        Taro.showToast({
          title:"请选择地址",
          icon:"none"
        })
        return;
      }
      let sendaddr = addressObj.province.name + addressObj.city.name + addressObj.country.name + addressObj.address;
      let params = {
          sendaddr: sendaddr,
          contacts: addressObj.receiving_name,
          phone: addressObj.phone,
          remark: remark,
          gettype: 2,
          details: createdetails(selectData),
          osum: sumPrice,
          otype: 5,
          senddate: "2018-02-20 13:59:00",
          status: (Number(sumPrice) + Number(freight)) !== 0?-1:0,
          express_fee: freight
      }
      _oCrtOrUpt(params).then((res)=>{
        console.log(res);
      })
     /* request("comp/order.do?oCrtOrUpt", {
          body: params,
          header:{
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
      }).then((res) => {
          let json =res;
          if (json.result === 1) {
              Toast.success("提单成功");

              // let url = window.location.origin + window.location.pathname + "#/order/list"
              
              const callback = () => {
                  window.isHasPopState = false;
                  let url = window.location.origin + window.location.pathname + "?#/order/detail?order_id=" + json.data;
                  window.location.href = url;
              }
              if ((Number(this.state.sumPrice) + Number(this.state.freight)) !== 0) {
                  Wxpay(json.data, callback);
              } else {
                  callback();
              }
          } else {
              Toast.fail("提单失败");
          }
      }).catch((rces)=>{
          Toast.fail("提单失败");
      })*/
  }
  render () {
    let {sumPrice,selectData} = this.$router.params;
    let {freight,remark,addressObj} = this.state;
    return (
      <View className='fillinorder'>
        <View className="addressWrap">
            <View style={{position:"relative"}}>
              <View className="perinfo" >{addressObj.receiving_name}<span style={{marginLeft:"10px"}}>{addressObj.phone}</span></View>
            </View>
            
            <View className="address" span={24}>地址：{addressObj.province.name + addressObj.city.name + addressObj.country.name + addressObj.address}</View>
        </View>
        <View className="shopWrap">
          {
            JSON.parse(selectData).map((e,i)=>{
              let price = 0;
              let commodityPrices = e.commodity.commodityPrices ? e.commodity.commodityPrices : []
              if (commodityPrices !== null && commodityPrices.length > 0) {
                  for (let j = 0; j < commodityPrices.length; j++) {
                      if (commodityPrices[j].c_itemid === e.c_itemid) {//默认价
                          price = commodityPrices[j].c_price;
                      }
                  }
              }
              return (
                  <View className="cartItem at-row" key={i}>
                      <View className="at-col at-col-3">
                          <Image alt="商品图片" key={"img" + i} className="shopImg" src={e.commodity.c_pic ? e.commodity.c_pic : c_img_default} />
                      </View>
                      <View className="at-col at-col-8">
                          <View>
                              <View className="c_name" key={"name" + i}>{e.commodity.c_name}</View>
                          </View>
                          <View>
                              <Text className="price" style={{"lineHeight":"0.6rem"}}>￥{Number(price).toFixed(2)}</Text>
                              <Text className="count">x{e.c_count}</Text>
                          </View>
                      </View>
                  </View>
                ) 
            })
          }
          <View className="item">
              <View className="label">
                  运费：
              </View>
              <View className="des">
                  ￥{freight}
              </View>
          </View>
          <View className="item">
              <View className="label">
                  买家留言：
              </View>
              <View className="des">
                  <Input placeholder="点击给卖家留言" value={remark} onInput={this.onInput}/>
              </View>
          </View>
          <View className="item">
              <View className="label">
              </View>
              <View className="des">
                合计： ￥{sumPrice}
              </View>
          </View>
        </View>
        <View className="statics at-row" style={{ "paddingLeft": "0.24rem" }}>
            <View className="at-col at-col-8" align="right">
                <View className="eval">应付总额：<Text className="sumPrice">￥
                {sumPrice}
                </Text></View>
            </View>
            <View className="clearing at-col at-col-3 at-col__offset-1" align="center" onClick={this.oCrtOrUpt}>
                提交订单
            </View>
        </View>
      </View>
    )
  }
}


const createdetails = (data) => {
    let detailsObj = [];
    if(typeof(data)=="string"){
      data = JSON.parse(data);
    }
    if (data !== null && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            let dataInt = data[i];
            let detailObj = {
                "commodity_id": 8014, "count": 2, "price": 31, "unit_id": 12054, "subTotal": 62, "price_id": 3921
            };
            let commodityPrices = dataInt.commodity.commodityPrices ? dataInt.commodity.commodityPrices : [];
            detailObj.commodity_id = dataInt.commodity_id;
            detailObj.count = dataInt.c_count;
            detailObj.price_id = dataInt.c_itemid;
            detailObj.unit_id = dataInt.commodity.mainunit.unit_id;
            detailObj.price = 0;
            for (let j = 0; j < commodityPrices.length; j++) {
                if (detailObj.price_id === commodityPrices[j].c_itemid) {
                    detailObj.price = commodityPrices[j].c_price;
                    break;
                }
            }
            detailObj.subTotal = detailObj.count * detailObj.price;

            detailsObj.push(detailObj);
        }
    }
    return JSON.stringify(detailsObj);
}


export default Index
