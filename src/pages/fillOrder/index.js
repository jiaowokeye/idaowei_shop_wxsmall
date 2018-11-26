import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text ,Input} from '@tarojs/components'
import c_img_default from "./../../assets/image/commodity_default.png"
import './index.scss'
import {_getaddress,_oCrtOrUpt,_getfreight} from "./../../util/api.js"
class Index extends Component {

  config = {
    navigationBarTitleText: '提交订单'
  }
  state = {
    freight:0,
    remark:"",
    addressObj:{},
    isgetfreight:false
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
    let {sumPrice,selectData,address_id} = this.$router.params;
    console.log(sumPrice,selectData,address_id);
    let params = {
        pageSize: 99999,
        pageNo: 1,
    }
    _getaddress(params).then((res)=>{
        let addressObj = {};
        let addressList = res.data.paginationData?res.data.paginationData:[{}];
        if(address_id){
          for(let i=0;i<addressList.length;i++){
            if(addressList[i].address_id==address_id){
              addressObj = addressList[i];
              break;
            }
          }
        }else{
          addressObj = addressList[0];
        }
        this.setState({
          addressObj:addressObj
        })
        setTimeout(this.getfreight,200);
    });
  }
  //获取运费
  getfreight = () => {
    let {sumPrice,selectData} = this.$router.params;
    let {freight,remark,addressObj} = this.state;
    let goods = "";
    if (selectData !== null && selectData.length > 0) {
        for (let i = 0; i < selectData.length; i++) {
            goods += "cid:" + selectData[i].commodity_id + ",num:" + selectData[i].c_count + ",cost:" + sumPrice + ";";
        }
    }
    goods = goods.substring(0, goods.length - 1);
    if(!addressObj.address_id){
        return;
    }
    let params = {
        address_id: addressObj.address_id,
        goods: goods,
    }
    this.setState({
        "freight": "",
        "isgetfreight": true
    })
    _getfreight(params).then((res)=>{
        this.setState({
            "freight": res.data,
            "isgetfreight": false
        })
    })

  }
  //修改留言
  onInput = (e)=>{
    this.setState({
      remark:e.detail.value
    })
  }
  //选择地址
  chooseAddress = ()=>{
    let {sumPrice,selectData} = this.$router.params;
    Taro.redirectTo({
      url:"./../address/index?sumPrice="+sumPrice+"&selectData="+selectData+"&chooseAddress=1",
    })
  }
  //提单
  oCrtOrUpt = () => {
      let {sumPrice,selectData} = this.$router.params;
      let {freight,remark,addressObj,isgetfreight} = this.state;
      if(isgetfreight){
        Taro.showToast({
          title:"正在计算运费",
          icon:"none"
        })
        return;
      }
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
          console.log(res.data);
            Taro.redirectTo({
              url:"./../orderDetail/index?orderId="+res.data,
            })
          Taro.showToast({
            title:"提交订单成功",
            icon:"success"
          })
      })
  }
  render () {
    let {sumPrice,selectData} = this.$router.params;
    let {freight,remark,addressObj} = this.state;
    console.log(Object.keys(addressObj).length);
    return (
      <View className='fillinorder'>
        <View className="addressWrap" onClick={this.chooseAddress}>
            {
              Object.keys(addressObj).length!==0?<View>
              <View style={{position:"relative"}}>
                <View className="perinfo" >{addressObj.receiving_name}<span style={{marginLeft:"10px"}}>{addressObj.phone}</span></View>
              </View>
              <View className="address" span={24}>地址：{addressObj.province.name + addressObj.city.name + addressObj.country.name + addressObj.address}</View>
            </View>:<View>添加地址</View>
            }
            
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
