import '@tarojs/async-await'
import Taro, {Component} from '@tarojs/taro'
import {Provider} from '@tarojs/redux'

import Index from './pages/index'

import configStore from './store'

import './app.scss'
import './assets/css/core-wx-icon.css'
if (process.env.TARO_ENV === "weapp") {
  require("taro-ui/dist/weapp/css/index.css")
} else if (process.env.TARO_ENV === "h5") {
  require("taro-ui/dist/h5/css/index.css")
}


const store = configStore()

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/shopDetail/index',
      'pages/cart/index',
      'pages/fillOrder/index',
      'pages/mysetting/index',
      'pages/active/index',
      'pages/address/index',
      'pages/order/index',
      'pages/orderDetail/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    "tabBar": {
      "list": [{
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath":"./assets/image/Home.png",
        "selectedIconPath":"./assets/image/HomeH.png"
      }, {
        "pagePath": "pages/cart/index",
        "text": "购物车",
        "iconPath":"./assets/image/Cart.png",
        "selectedIconPath":"./assets/image/CartH.png"
      }, {
        "pagePath": "pages/mysetting/index",
        "text": "我的",
        "iconPath":"./assets/image/Home.png",
        "selectedIconPath":"./assets/image/HomeH.png"
      }],
      selectedColor:'rgb(56, 177, 212)'
    },
  }

  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentCatchError() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return ( <
      Provider store = {
        store
      } >
      <
      Index / >
      <
      /Provider>
    )
  }
}

Taro.render( < App / > , document.getElementById('app'))