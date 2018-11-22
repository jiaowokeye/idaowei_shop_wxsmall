import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import {_getaddress,_deladdress,_getprovice,_addaddress,_updateaddress} from "./../../util/api.js"
import { AtInput, AtForm,Picker,AtButton } from 'taro-ui'
import './index.scss'
class Index extends Component {
  config = {
    navigationBarTitleText: '收货地址'
  }
  state = {
    addressList:[],
    type:1,//1 显示列表  2-修改新增
    receiving_name:"",//
    phone:"",
    address:"",
    address_id:"",
    provincedata:[],//省
    city:[],//市
    country:[],//区县
    provinceObj:{},
    provinceStr:"",
    address_id:"",
    pickerValue:[],
    updateAddress:false
  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  componentDidMount(){
    this.getaddressList();
    this.getprovince();
  }
  
  //获取收货地址
  getaddressList = ()=>{
    let params = {
        pageSize: 99999,
        pageNo: 1,
    }
    _getaddress(params).then((res)=>{
        this.setState({
          addressList:res.data.paginationData?res.data.paginationData:[]
        })
    });
  }
 //编辑地址
  editaddress = (index) => {
      let e = this.state.addressList[index];
      let receiving_name = e.receiving_name;
      let phone = e.phone;
      let address = e.address;
      let address_id = e.address_id;
      let province_id = e.province_id;
      let city_id = e.city_id;
      let country_id = e.country_id;
      let provincedata = this.state.provincedata;
      let pickerValue = [];
      let cityData = [];
      let countryData = [];
      let provinceStr = "";
      for(let i=0;i<provincedata.length;i++){
        if(provincedata[i].province_id==province_id){
          cityData = provincedata[i]["cityList"];
          pickerValue.push(i);
          provinceStr += provincedata[i]["name"];
          break;
        }
      }
      for(let i=0;i<cityData.length;i++){
        if(cityData[i].id==city_id){
          countryData = cityData[i]["countryList"];
          pickerValue.push(i);
          provinceStr += cityData[i]["name"];
          break;
        }
      }
      for(let i=0;i<countryData.length;i++){
        if(countryData[i].id==country_id){
          pickerValue.push(i);
          provinceStr += countryData[i]["name"];
          break;
        }
      }
      let provinceObj = {
        province_id: province_id,
        city_id: city_id,
        country_id: country_id
      }
      // let provincearr = JSON.stringify([e.province_id, e.city_id, e.country_id]);
      // e.nativeEvent.stopImmediatePropagation()
      this.setState({
          receiving_name: receiving_name,
          phone: phone,
          address: address,
          address_id: address_id,
          updateAddress: true,
          city:cityData,//市
          country:countryData,//区县
          pickerValue:pickerValue,
          provinceStr:provinceStr,
          provinceObj:provinceObj
      })
      this.toType2();
  }
  //删除地址
  delAddress = (index)=>{
    let address_id = this.state.addressList[index].address_id;
    let params = {
        address_id: address_id
    }
    Taro.showModal({
      title: '删除确认',
      content: '是否删除这条地址',
      success:(res)=> {
        if (res.confirm) {
          _deladdress(params).then((res)=>{
              this.getaddressList();
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
    
  }
  //跳转修改
  toType2(){
    this.setState({
      type:2
    })
  }
  //取消
  toType1(){
    this.setState({
      type:1,
      receiving_name: "",
      phone: "",
      address: "",
      address_id: "",
      updateAddress: false,
      city:this.state.provincedata[0]["cityList"],//市
      country:this.state.provincedata[0]["cityList"][0]["countryList"],//区县
      pickerValue:[],
      provinceStr:"",
      provinceObj:[]
    })
  }
  //获取省市区列表
  getprovince = () => {
      let params = {
          iswebsite: 1
      }
      _getprovice(params).then((res)=>{
        this.setState({
            provincedata: res.data,
            city:res.data[0]["cityList"],
            country:res.data[0]["cityList"][0]["countryList"]
        })
      })
  }
  //更改某一列
  onColumnchange = (e)=>{
    let column = e.detail.column;
    let value = e.detail.value;
    switch (column) {
      case 0://改变省
        this.setState({
          city:this.state.provincedata[value]["cityList"],
          country:this.state.provincedata[value]["cityList"][0]["countryList"],//区县
        });
        break;
      case 1://改变市
        this.setState({
          country:this.state.city[value]["countryList"],
        });
        break;
      default:
        // statements_def
        break;
    }
  }
  //点击省市区确定
  provinceChange = (e)=>{
    let value = e.detail.value;
    let provinceObj = {
      province_id: this.state.provincedata[value[0]]["province_id"],
      city_id: this.state.city[value[1]]["id"],
      country_id: this.state.country[value[2]]["id"],
    }
    let provinceStr = this.state.provincedata[value[0]]["name"]+"-"+this.state.city[value[1]]["name"]+"-"+ this.state.country[value[2]]["name"];
    this.setState({
      provinceObj: provinceObj,
      provinceStr:provinceStr
    })
  }
  //处理输入
  handleInput (stateName, value) {
    this.setState({
      [stateName]: value
    })
  }
  //新增或者修改地址
  addOrUpdataAddress = ()=>{
    if (this.state.receiving_name === "") {
        Taro.showToast({
          "icon":"none",
          "title":"收货姓名必填"
        })
        return;
    }
    if (this.state.phone === "") {
        Taro.showToast({
          "icon":"none",
          "title":"联系人电话必填"
        })
        return;
    }
    if (Object.keys(this.state.provinceObj).length === 0) {
        Taro.showToast({
          "icon":"none",
          "title":"所在地区必填"
        })
        return;
    }
    if (this.state.address === "") {
        Taro.showToast({
          "icon":"none",
          "title":"详细地址必填"
        })
        return;
    }
    let params = {
        receiving_name: this.state.receiving_name,
        phone: this.state.phone,
        province_id: this.state.provinceObj["province_id"],
        city_id: this.state.provinceObj["city_id"],
        country_id: this.state.provinceObj["country_id"],
        address: this.state.address
    }
    if (this.state.updateAddress) {
        params.address_id = this.state.address_id;
        _updateaddress(params).then((res)=>{
          this.toType1();
          this.getaddressList();
        });
    }else{
        _addaddress(params).then((res)=>{
          this.toType1();
          this.getaddressList();
        });
    }

  }
  render () {
    let objArr = [];
    objArr.push(this.state.provincedata);
    objArr.push(this.state.city);
    objArr.push(this.state.country);
    return (
      <View className='addressPage'>
          <View className={this.state.type==1?"":"hide"}>
            <View className='addressList'>
              {
                this.state.addressList.map((e,i)=>{
                  let receiving_name = e.receiving_name;
                  let phone = e.phone;
                  let address = e.address;
                  let address_id = e.address_id;
                  let provincearr = JSON.stringify([e.province_id, e.city_id, e.country_id]);
                  return (
                      <View className="addressItem" key={i}>
                          <View style={{position:"relative"}}>
                            <View className="perinfo" >{e.receiving_name}<span style={{marginLeft:"10px"}}>{e.phone}</span></View>
                            <View className="btns">
                                <Text className="EditIcon" onClick={this.editaddress.bind(this,i)}></Text>
                                <Text className="DeleteIcon" onClick={this.delAddress.bind(this,i)} ></Text>
                            </View>
                          </View>
                          
                          <View className="address" span={24}>地址：{e.province.name + e.city.name + e.country.name + e.address}</View>
                      </View>
                  )
                })
              }
            </View>
            <View className="addAddress" onClick={this.toType2}>
                <Text className="iconfont icon-tianjia"></Text>添加收货地址
            </View>
          </View>
          <View className={this.state.type==2?"":"hide"}>
            <AtForm>
                <AtInput name='name' title='收货姓名' type='text' placeholder='请输入收货人姓名' value={this.state.receiving_name} onChange={this.handleInput.bind(this, 'receiving_name')} />
                <AtInput name='name' title='联系电话' type='number' placeholder='请输入联系人电话' value={this.state.phone} onChange={this.handleInput.bind(this, 'phone')} />
                <View className='pickerWrap'>
                    <View className="label">所在地区</View>
                    <Picker className='right' value={this.state.pickerValue} mode='multiSelector' rangeKey="name" range={objArr} onColumnchange={this.onColumnchange} onChange={this.provinceChange}>
                        <View className='picker'>
                            {
                              Object.keys(this.state.provinceObj).length==0?"选择现居城市":this.state.provinceStr
                            }
                        </View>
                    </Picker>

                </View>
                <AtInput name='address' title='详细地址' type='text' placeholder='请输入详细地址' value={this.state.address} onChange={this.handleInput.bind(this, 'address')} />
            </AtForm>
            <View className="saveBtn">
                <View className='btn-wrap'>
                  <AtButton type='secondary' onClick={this.toType1} size="normal">取消</AtButton>
                </View>
                <View className='btn-wrap'>  
                  <AtButton type='primary' size="normal" onClick={this.addOrUpdataAddress}>保存</AtButton>
                </View>
            </View>

          </View>
      </View>
    )
  }
}

export default Index
