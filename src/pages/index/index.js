import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text} from '@tarojs/components'
import { AtSearchBar,ScrollView,AtLoadMore,AtIcon,AtModal, AtModalHeader, AtModalContent, AtModalAction ,AtInput,AtDrawer} from 'taro-ui'
import {_getCommodityList,_login,_addCart,_getMenuTree} from "./../../util/api.js"

import c_img_default from "./commodity_default.png"
import './index.scss'
class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }
  state = {
    "commodity_id": 0,
    "p_id": 0,
    "data": [],
    "cond": "",
    "type": 0,
    "showType":false,
    "typeData":[],
    "pageNo": 1,
    "num": "1.0",
    "isOpened":false,
    "hasMore": false,//有更多
    "isLoadingMore":false,//正在加载更多
    "isLoadingReset":false//正在刷新列表
  }
 
  componentWillReceiveProps (nextProps) {

  }
  componentDidMount(){
    
    Taro.login({
      //获取code
      success: function (res) {
        console.log(res.code);
      }
    })
    // _login();
    this.getCommodityList();
    this.getTypeList();
      
  }
  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }
  //改变类型显示 1-显示 2-隐藏
  changeShowType = (type)=>{
    this.setState({
      showType:type==1?true:false
    })
  }
  onItemClick = (index)=>{
    this.setState({
      type:this.state.typeData[index].id,
      data:[]
    })
    setTimeout(()=>{this.onScrollToUpper()},100);
  }
  //改变搜索框内容
  onChange =(value)=>{
    this.setState({
      cond: value
    })
  }
  //改变商品数量
  onChangeNum = (value)=>{
    this.setState({
      num: value
    })
  }
   //获取类型
  getTypeList = () => {
      let params = {
          set_id: 7
      }
      _getMenuTree(params).then((res) => {
          let data =res.data;
          if (data !== null) {
              let typeData = [{
                  "text": "全部",
                  "id": 0,
              }]
              this.setState({
                  typeData: typeData.concat(data)
              })
          } else {
              this.setState({
                  typeData: []
              })
          }
      }).catch((err)=>console.log(err))
  }
  //获取商品列表
  getCommodityList = ()=>{
    let params = {
        cond: this.state.cond,
        type: this.state.type,
        "in_type": 1,
        "look_user_id": 0,
        "status": 1,
        "pageNo": this.state.pageNo,
        "pageSize": 10
    }
    _getCommodityList(params).then((res)=>{
      console.log(res);
      this.setState({
        data:this.state.data.concat(res.data.paginationData),
        isLoadingMore:false,
        isLoadingReset:false,
        hasMore:res.data.pageAmount==this.state.pageNo?false:true
      })
    })
  }
  //打开输入数量框
  addNum = (commodity_id, p_id) => {
      this.setState({
          "commodity_id": commodity_id,
          "num": "1.0",
          "p_id": p_id,
          "isOpened":true
      })
  }
  //购买商品点击取消
  handleCancel = ()=>{
    this.setState({
      "isOpened":false
    })
  }
  handleConfirm = ()=>{
    this.addCart();
  }
  //添加购物车
  addCart = () => {
    let params = {
        "cid": this.state.commodity_id,
        "pid": this.state.p_id,
        "count": this.state.num,
        "c_type": 2
    }
    _addCart(params).then((res) => {
        let json =res;
        if (json.result === 1) {
            Taro.showToast({
              title:'添加购物车成功',
              icon:"none"
            })
            this.handleCancel();
        } else {
            Toast.fail(json.message, 1)
        }
    })
  }
  toDetail = (commodity_id)=>{
    Taro.navigateTo({
      url:"./../shopDetail/index?commodity_id="+commodity_id
    })
  }
  onScrollToUpper = ()=>{
   if(!this.state.isLoadingReset){
      this.setState({
        pageNo:1,
        isLoadingReset:true,
        data:[]
      })
      setTimeout(()=>{this.getCommodityList()},100);
    }
  }
  onScrollToLower = ()=>{
    if(!this.state.isLoadingMore&&this.state.hasMore){
      this.setState({
        pageNo:this.state.pageNo+1,
        isLoadingMore:true
      })
      setTimeout(()=>{this.getCommodityList()},100);
    }
    
  }
  render () {
    let atDrawData = [];
    let typeData = this.state.typeData;
    for(let i=0;i<typeData.length;i++){
      atDrawData.push(typeData[i].text);
    }
    return (
      <View className='index'>
          
          <AtDrawer 
            show={this.state.showType} 
            mask 
            onClose={this.changeShowType.bind(this,2)} 
            onItemClick = {this.onItemClick.bind(this)}
            items={atDrawData}
          ></AtDrawer>
          <View className='top'>
              <View style={{width:'10%',float:"left"}}>
                <AtIcon value='list' size='30' color='#F00' onClick={this.changeShowType.bind(this,1)}></AtIcon>
              </View>
              <View style={{width:'90%',float:"left"}}>
                <AtSearchBar
                  value={this.state.cond}
                  onChange={this.onChange.bind(this)}
                  placeholder="输入商品名字"
                  onActionClick = {this.onScrollToUpper}
                />
              </View>
              
          </View>
          <View className="content">
            <View className={this.state.isLoadingReset?"":"hide"}>
              <AtLoadMore
                status="loading"
              />
            </View>
            {
              this.state.data.length>0?<ScrollView
              className='scrollview'
              scrollY
              scrollWithAnimation
              scrollTop='0'
              style='height: 100%;'
              lowerThreshold='50'
              upperThreshold='80'
              onScrolltoupper={this.onScrolltoupper}
              onScrollToLower={this.onScrollToLower}>
              {
                  this.state.data.map((e, i) => {
                      let price = 0;
                      let p_id = 0;
                      if (e.commodityPrices !== null && e.commodityPrices.length > 0) {
                          price = e.commodityPrices[0].c_price;
                          p_id = e.commodityPrices[0].c_itemid;
                      }
                      price = Number(price).toFixed(2);
                      const createItem = () => {
                        
                      }
                      return (<View className="sinple">
                                <View style={{"width":"25%","float":"left"}} onClick={this.toDetail.bind(this,e.commodity_id)}>
                                    <Image className="shopImg" alt="商品图片" src={e.c_pic ? e.c_pic : c_img_default} />
                                </View>
                                <View style={{"width":"75%","float":"left"}}>
                                    <View className="shopInfo" onClick={this.toDetail.bind(this,e.commodity_id)}>
                                        <View className="c_name">{e.c_name}</View>
                                        <View className="specification">{e.specification ? "规格：" + e.specification : ""}</View>
                                        <View className="label">
                                            <Text className={e.isnew === 1 ? "lab new" : "hide"}>新品</Text>
                                            <Text className={e.issales === 1 ? "lab sales" : "hide"}>促销</Text>
                                        </View>
                                    </View>
                                    <View className="showDiff flexAlignMiddle" style={{"alignItems":"flex-end"}}>
                                        <Text className="shopPrice" style={{"flex":"1"}}>{"￥" + price}</Text>
                                        <View className="addCartBtn" style={{"flex":"1"}}>
                                          <AtIcon value='shopping-cart' onclick={this.addNum.bind(this,e.commodity_id, p_id)}  size='30' color='#F00'></AtIcon>
                                        </View>
                                    </View>
                                </View>
                              </View>)
                      
                  })
              }
              <View className={this.state.isLoadingMore?"":"hide"}>
                <AtLoadMore
                  status="loading"
                />
              </View>
              <AtModal isOpened = {this.state.isOpened}> 
                <AtModalHeader>请输入商品数量</AtModalHeader>
                <AtModalContent>
                   <AtInput
                      type='digit'
                      value={this.state.num}
                      onChange={this.onChangeNum.bind(this)}
                    />
                </AtModalContent>
                <AtModalAction>
                  <Button onClick={this.handleCancel}>取消</Button>
                  <Button onClick={this.handleConfirm}>确定</Button>
                </AtModalAction>
              </AtModal>
            </ScrollView>:<View>暂无商品</View>
            }
            
          </View>
      </View>
    )
  }
}

export default Index
