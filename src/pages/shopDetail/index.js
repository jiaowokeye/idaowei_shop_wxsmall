import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Swiper, SwiperItem,Image } from '@tarojs/components'
import { AtGrid,AtInput } from "taro-ui"
import './index.scss'
import {_getCommodityInfo,_addCart} from "./../../util/api.js"
class Index extends Component {

  config = {
    navigationBarTitleText: '商品详情'
  }
  state = {
    Collection: false,
    data: {},
    icon: ["icon-shaixuan", "icon-shoucang", "icon-tianjia"],
    num:1.0,

  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  componentDidMount(){
    this.getCommodityInfo();
  }
  //获取商品详情
  getCommodityInfo(){
    let params = {
        "code": this.$router.params.commodity_id,
        "isGetAllPrice": 0
    }
    _getCommodityInfo(params).then((res)=>{
        this.setState({
          data:res.data
        })
    })
  }
  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }
  handleChangeNum (value) {
    this.setState({
      num: value
    })
  }
  addCart(){
    let params = {
        "cid": this.$router.params.commodity_id,
        "pid": this.state.data.commodityPrices[0].c_itemid,
        "count": this.state.num,
        "c_type": 2
    }
    _addCart(params).then((res)=>{
      Taro.showToast({
        title:"添加成功",
        icon:"success"
      })
    })
  }
  render () {
    let data = this.state.data;
    //默认价格
    let price = 0;
    let commodityPrices = data.commodityPrices ? data.commodityPrices : []
    if (commodityPrices !== null && commodityPrices.length > 0) {
        // for (let j = 0; j < commodityPrices.length; j++) {
        //     if (commodityPrices[j].c_itemid == 3921) {//默认价

        //     }
        // }
        price = commodityPrices[0].c_price;
    }
    price = Number(price).toFixed(2);
    //附件图片 商品图片
    let sysAttaches = this.state.data.sysAttaches ? this.state.data.sysAttaches : [{ attach_storage: "http://www.idaowei.com/core/view/images/commodity_default.png" }]
    //单位
    let mainUnit = this.state.data.mainunit;
    let unitName = "";
    if (mainUnit != null) {
        unitName = mainUnit.u_name;
    }
    return (
      <View className='shopDetailPage'>
         <Swiper
          className='test-h'
          indicatorColor='#999'
          indicatorActiveColor='#333'
          circular
          indicatorDots
          autoplay>
          {
            this.state.data.sysAttaches.map((e,i)=>{
              return  <SwiperItem key={i}>
                        <Image 
                          src={e.attach_storage}
                        />
                      </SwiperItem>
            })
          }
        </Swiper>
        <View className="shopInfo">

            <View className="c_name">{this.state.data.c_name}</View>
            <View className="specification"><Text>规格：</Text><Text>{this.state.data.specification}</Text></View>
            <View style={{"display": "flex","alignItems":"center"}}>
                <Text className="price">￥{price}</Text>
                <Text className={this.state.data.isnew === 1 ? "lab new" : "hide"}>新品</Text>
                <Text className={this.state.data.issales === 1 ? "lab sales" : "hide"}>促销</Text>
            </View>
            {/* <Col Text={6}>
                <Icon onClick={this.changeCollection.bind(this, data.commodity_id)} type={this.state.Collection ? "star":"star-o"} />
                    <View>
                        {this.state.Collection?"已收藏":"未收藏"}
                    </View>
                </Col> */}
        </View>
        <View className="shopDes">
            <View className="title">商品信息</View>
            <View className="remark">{this.state.data.remark ? this.state.data.remark : "暂无信息"}</View>
        </View>
        <View className="shopSpe">
            <View className="title">商品规格</View>
            <View className="spe">
                <View><Text>分类：</Text><Text>{this.state.data.type_name}</Text></View>
                <View><Text>单位：</Text><Text>{unitName}</Text></View>
                <View><Text>规格：</Text><Text>{this.state.data.specification}</Text></View>
                <View><Text>编码：</Text><Text>{this.state.data.c_code}</Text></View>
                <View><Text>条形码：</Text><Text>{this.state.data.barcode}</Text></View>
            </View>
        </View>
        <View className="footer">
          <View className='at-row'>
            <View className='at-col at-col-6'>
              <View className='at-row'>
                <View className="at-col at-col-4" style={{"textAlign":"right"}}>数量：</View>
                <View className="at-col at-col-8">
                  <AtInput
                    title=''
                    type='digit'
                    placeholder='商品数量'
                    value={this.state.num}
                     onChange={this.handleChangeNum.bind(this)}
                  />
                </View>
              </View>
            </View>
            <View className='at-col at-col-4 at-col__offset-2' onClick={this.addCart} style={{"background":"#40b0d1","textAlign":"center"}}>
                <Text className="AddCartDetailIcon" />
                <Text style={{"color":"white"}}>加入购物车</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Index
