import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import './index.scss'

class Index extends Component {

  config = {
    navigationBarTitleText: '活动页'
  }
  state={
    num:0
  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  componentDidMount(){
    console.log("完成");
    let numx = 1;//x轴
    let numy = 1;//y轴
    let numz = 1;//z轴
    let stsw = true;
    Taro.onAccelerometerChange((res)=>{
      console.log(res);
      if(numx<res.x&&numy<res.y){//一次正数算摇一次的  左右晃动
        this.setState({
          num:this.state.num+1
        })
      }
      if(numz<res.z&&numy<res.y){//一次正数算摇一次的  上下晃动
        this.setState({
          num:this.state.num+1
        })
      }
      if(this.state.num=="10"){
          Taro.stopAccelerometer()
      }

    })
    Taro.startAccelerometer({
      interval: 'game'
    })
  }
  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    console.log(this.state);
    return (
      <View className='index'>
          摇一摇次数:{this.state.num}
      </View>
    )
  }
}

export default Index
