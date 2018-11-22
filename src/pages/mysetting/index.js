import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text,OpenData } from '@tarojs/components'
import { AtList, AtListItem } from "taro-ui"
import './index.scss'
class Index extends Component {
  config = {
    navigationBarTitleText: '设置'
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  
  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }
  navigator = (url)=>{
    Taro.navigateTo({
      url:url
    })
  }
  render () {
    return (
      <View className='settingPage'>
        <View className='top'>
            <View className='left'>
              <OpenData type='userAvatarUrl'  />
            </View>
            <View className='right'>
              <OpenData type='userNickName'  />
            </View>
        </View>
        <View className="content">
            <AtList>
              <AtListItem onClick={this.navigator.bind(this,"./../order/index")} title='我的订单' arrow='right' />
              <AtListItem onClick={this.navigator.bind(this,"./../address/index")} title='收货地址' arrow='right'/>
              <AtListItem title='分享给好友' arrow='right'/>
              <AtListItem title='联系客服' arrow='right' />
              <AtListItem onClick={this.navigator.bind(this,"./../active/index")} title='活动页面' arrow='right' />
            </AtList>
        </View>
      </View>
    )
  }
}

export default Index
