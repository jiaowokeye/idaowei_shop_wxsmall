import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { AtList, AtListItem, AtSwipeAction,AtInputNumber } from 'taro-ui'
import {_getCartList,_updateCart,_deleteCart,_getCommodityList} from "./../../util/api.js"
import c_img_default from "./../../assets/image/commodity_default.png"
import './index.scss'

const OPTIONS = [
  {
    text: '删除',
    style: {
      backgroundViewor: 'red'
    }
  }
]
class Index extends Component {

  config = {
    navigationBarTitleText: '购物车'
  }
  state = {
    list: [],
    "checked": "",
    "visible": false,
    "checkall": false,
    "sumPrice": 0,
    "selectData": [],
    "remark": "",
  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  componentDidMount(){
    this.getCartList();
  }
  //获取购物车列表
  getCartList = ()=>{
    let params = {
        "c_type": 2
    }
    _getCartList(params).then((res)=>{
        let data = res.data;
        for(let i=0;i<data.length;i++){
          let itemOption = {isClose: false,options: OPTIONS}
          data[i] = Object.assign(itemOption,data[i]);
        }
        this.setState({
            list: data,
            "checkall": false,
            "sumPrice": 0,
            "selectData": []
        })
    })
  }
 //选购物车商品
  selectShop = (i) => {
      let data = this.state.list;
      data[i].checked = !data[i].checked;
      let boolean = true;
      for (let i = 0; i < data.length; i++) {
          if (!data[i].checked) {
              boolean = false;
              break;
          }
      }
      this.setState({
          list: data,
          checkall: boolean
      })
      this.evalSumPrice(data);
  }
  changeConut = (id,c_itemid,value) => {
    console.log(value,id);
    let ind = id;
    let data = this.state.list;
    data[ind].c_count = value;
    if (value === "") {
        data[ind].checked = false;
    }
    //修改购物车商品
    let params = {
        "cid": data[ind].commodity_id,
        "c_type":2,
        "count":value,
        "pid":c_itemid   
    }
    _updateCart(params).then((res)=>{
        this.setState({
            list: data
        })
        this.evalSumPrice(data);
    })
  }
  //计算总价
  evalSumPrice = (dataP) => {
      let sum = 0;
      let data = dataP;
      let selectData = [];
      for (let i = 0; i < data.length; i++) {
          if (data[i].checked && data[i].c_count !== "") {
              selectData.push(data[i]);
              let price = 0;
              let commodityPrices = data[i].commodity.commodityPrices ? data[i].commodity.commodityPrices : []
              if (commodityPrices !== null && commodityPrices.length > 0) {
                  price = commodityPrices[0].c_price;
              }
              sum += price * data[i].c_count;
          }
      }
      this.setState({
          "sumPrice": sum.toFixed(2),
          "selectData": selectData,
      })
  }
 //全选全不选
  checkallClick = () => {
      let boolean = this.state.checkall ? false : true
      let data = this.state.list;
      for (var i = 0; i < data.length; i++) {
          data[i].checked = boolean;
      }
      this.evalSumPrice(data);
      this.setState({
          list: data,
          checkall: !this.state.checkall
      });
  }
  //结算
  settlement = ()=>{
    this.checkPrice();
  }
  checkPrice = (callback) => {
    if (this.state.selectData.length !== 0) {
        let selectData = this.state.selectData;
        let commodity_ids = "";
        for (let i = 0; i < selectData.length; i++) {
            commodity_ids += selectData[i].commodity_id + ",";
        }
        let params = {
            commodity_ids: commodity_ids,
            status: 1,
            in_type: 1,
            isPersonPrice: 1,
            pageSize:99999
        }
        _getCommodityList(params).then((res) => {
            let json = res;
            if (json.result === 1) {
                let data = json.data.paginationData ? json.data.paginationData : [];
                let obj = {};
                let changeGoods = "";
                for (let i = 0; i < data.length; i++) {
                    obj[data[i].commodity_id] = data[i];
                }
                for (let i = 0; i < selectData.length; i++) {
                    let oldprice = 0;
                    let newprice = 0;
                    let oldcommodityPrices = selectData[i].commodity.commodityPrices ? selectData[i].commodity.commodityPrices : [];
                    let newcommodityPrices = obj[selectData[i].commodity_id].commodityPrices ? obj[selectData[i].commodity_id].commodityPrices : [];
                    if (oldcommodityPrices.length > 0) {
                        oldprice = oldcommodityPrices[0].c_price;
                    }
                    if (newcommodityPrices.length > 0) {
                        newprice = newcommodityPrices[0].c_price;
                    }
                    if (oldprice !== newprice) {
                        changeGoods += selectData[i].commodity.c_name + "、";
                    }

                    selectData[i].commodity = obj[selectData[i].commodity_id];
                }

                this.setState({
                    selectData: selectData
                })
                this.evalSumPrice(selectData);

                if (changeGoods !== "") {
                    Taro.showToast({
                      title:"有商品价格改变",
                      icon:"none"
                    })
                }else{
                  let sumPrice = this.state.sumPrice;
                  let selectData = JSON.stringify(this.state.selectData);
                  Taro.navigateTo({
                    url:"./../fillOrder/index?sumPrice="+sumPrice+"&selectData="+selectData,
                  })
                }

                
            } else {
                Toast.fail("价格确认失败");
            }
        })

    } else {
        Toast.fail("请选择商品");
    }
  }
  //滑动操作点击事件
  handleClick = (commodity_id,c_itemid,item, key, e) => {
    let params = {
        "cids": commodity_id,
        "pid": c_itemid,
        "c_type": 2
    }
    _deleteCart(params).then((res)=>{
        this.getCartList();
    })
  }
  //点击单个取消确认
  handleSingle = index => {
    const list = this.state.list.map((item, key) => {
      item.isClose = key !== index
      return item
    })
    this.setState({
      list
    })
  }
  render () {
    const { list,sumPrice } = this.state;
    return (
      <View className='cartPage'>
        <View className='cartCont'>
            
          {
            list.map((item, index) => {
              let price = 0;
              let commodityPrices = item.commodity.commodityPrices ? item.commodity.commodityPrices : [];
              if (commodityPrices !== null && commodityPrices.length > 0) {
                  price = commodityPrices[0].c_price;
              }
              price = Number(price).toFixed(2);
              return (
                <View className="cartItem" style={index===list.length-1?{"borderBottom":"0"}:{}}>
                  <AtSwipeAction
                    key={index}
                    autoClose
                    onOpened={this.handleSingle.bind(this, index)}
                    isClose={item.isClose}
                    options={item.options}
                    onClick={this.handleClick.bind(this,item.commodity_id,item.c_itemid)}
                  >
                    <View className="at-row">
                      <View className='at-col at-col-1'>
                        <Text style={{ "marginLeft": "0.1rem" }} className={item.checked ? "check checkMt check-circle active" : "check check-circle-o checkMt"} key={"icon" + index} onClick={this.selectShop.bind(this, index)}></Text>
                      </View>
                      <View className='at-col at-col-3'>
                        <Image key={"img" + index} className="shopImg" alt="" src={item.commodity.c_pic ? item.commodity.c_pic : c_img_default} />
                      </View>
                      <View className='at-col at-col-5'>
                         <View className="c_name" key={"name" + index}>{item.commodity.c_name}</View>
                        <View className="price">￥{Number(price).toFixed(2)}</View>
                      </View>
                      <View className='at-col at-col-3'>
                        <AtInputNumber
                          step={1}
                          width = {50}
                          value={item.c_count}
                          onChange={this.changeConut.bind(this,index,item.c_itemid)}
                        />
                      </View>
                    </View>
                  </AtSwipeAction>
                </View>
              )})
            }
        </View>
        <View className="statics at-row" style={{ "paddingLeft": "0.24rem" }}>
            <View className="at-col at-col-3" onClick={this.checkallClick} >
                <Text style={{ "top": "0.1rem", "marginLeft": "0.1rem","position":"relative"}} className={this.state.checkall ? "check check-circle active" : "check check-circle-o"}/>
                <Text className="checkAlldes">{this.state.checkall ? "取消" : "全选"}</Text>
            </View>

            <View className="at-col at-col-5" align="right">
                <View className="eval">合计：<Text className="sumPrice">￥
                {sumPrice}
                </Text></View>
            </View>
            <View className="clearing at-col at-col-3 at-col__offset-1" align="center" onClick={this.settlement}>
                结算
            </View>
        </View>
      </View>
    )
  }
}

export default Index
