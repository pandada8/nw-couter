import React from "react";
import ReactDOM from "react-dom";
import Reflux from "reflux";
import {Tabs, Tab} from "material-ui/lib/tabs";
import Paper from "material-ui/lib/paper";
import Colors from "material-ui/lib/styles/colors";
import TextField from "material-ui/lib/text-field";
import Toggle from "material-ui/lib/toggle";
import _ from "lodash";
import Knob from "./knob.jsx"
import FlatButton from "material-ui/lib/flat-button";

let injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

// Store part
var css = require("./style.css");

let CounterActions = Reflux.createActions([
  "start",
  "reset",
  "pause",
  "toggle",
  "_config"
])

let CounterStore = Reflux.createStore({
  listenables: CounterStore,
  init: function(){
    this.config　= {
      alert30: true,
      alertfinish: true,
      time_class: 240 * 1000,
      time_free: 180 * 1000,
      time_ask: 60 * 1000
    }
    this.state = {
       status: "stopped",
       step: "class",
       now: 0,
    }
  },
  tick: function(){
    if(this.state){

    }
    setTimeout()
  },
  _config: function(config){
    this.config = _.extend(config, this.config)

  },
  _msg: function(){
    this.trigger({
      config: this.config,
      now: this.state.now,
      status: this.state.status,
      step: this.state.step,
      max: this.config["time_"+this.state.step],
    })
  },
  start: function(max){
    if(this.state.status == "running")
      return
    if(this.time >= 0){
      let step = 200;
      this.timer = setInterval(()=> {
        if(this.state.status == "running"){
          if(this.time >= 0){
            this.time -= step / 1000
            this.trigger(this)
          }
        }else{
          this.timer && window.clearInterval(this.timer)
        }
      }, step)
    }
  }
})

let Circle = React.createClass({
  render() {
    var props = this.props
    var strokeWidth = props.strokeWidth;
    var radius = (50 - strokeWidth / 2);
    var pathString = `M 50,50 m 0,-${radius}
     a ${radius},${radius} 0 1 1 0,${2 * radius}
     a ${radius},${radius} 0 1 1 0,-${2 * radius}`;
    var len = Math.PI * 2 * radius;
    var pathStyle = {
      'strokeDasharray': `${len}px ${len}px`,
      'strokeDashoffset': `${((100 - props.percent) / 100 * len)}px`,
      'transition': 'stroke-dashoffset 0.6s ease 0s, stroke 0.6s ease'
    };
    ['strokeWidth', 'strokeColor', 'trailWidth', 'trailColor'].forEach((item) => {
      if (item === 'trailWidth' && !props.trailWidth && props.strokeWidth) {
        props.trailWidth = props.strokeWidth;
        return;
      }
      if (!props[item]) {
        props[item] = defaultProps[item];
      }
    });

    return (
      <svg className='rc-progress-circle' viewBox='0 0 100 100'>
        <path className='rc-progress-circle-trail' d={pathString} stroke={props.trailColor}
          strokeWidth={props.trailWidth} fillOpacity='0'/>

        <path className='rc-progress-circle-path' d={pathString} strokeLinecap='round'
          stroke={props.strokeColor} strokeWidth={props.strokeWidth} fillOpacity='0' style={pathStyle} />
      </svg>
    );
  }
});


let Counter = React.createClass({
  mixins:[Reflux.listenTo(CounterStore, "onStatusChange")],
  onStatusChange: function(data){
    this.setState({
      now: data.now,
      status: data.status,
      step: data.step,
      config: data.config,
      degree: data.now / data.max * 360
    })
  },
  getInitialState: function(){
    return {
      config: CounterStore.config,
      status: CounterStore.state.status,
      step: CounterStore.state.step,
      now: CounterStore.config["time_"+CounterStore.state.step],
      max: CounterStore.config["time_"+CounterStore.state.step],
      degree: 180
    }
  },
  render: function(){
    return <div className="Knob" onClick={this.handleClick}>
        <div className="Knob-label">
          {this.state.now}
        </div>
        <div
          className="Knob-spinner"
          style={{
            transform: `rotate(${-45 + this.state.degree}deg)`
          }}
        >
        </div>
        <div>
          <audio ref="alarm30" src="static/30.mp3" preload="auto"></audio>
          <audio ref="alarmfinish" src="static/finish.mp3" preload="auto"></audio>
        </div>
        <FlatButton label="重置" />
      </div>
  }
})

let Settings = React.createClass({
  mixins: [Reflux.listenTo(CounterStore, "onConfigUpdate")],
  onConfigUpdate: function(data){
    console.log(data)
    this.state.config = data.config
  },
  render: function(){
    let style = {
      marginBottom: 16,
      paddingLeft: 16,
    }
    let input_style = {
      marginTop: -10,
      paddingLeft: 16,
    }
    return <Paper zIndex={2} style={{maxWidth: "600", margin: "auto", paddingTop: 8, marginTop: 10}}>
      <h3 style={style}>时间设置</h3>
      <div style={input_style}>
        <TextField hintText="以秒为单位" floatingLabelText="班级风采展示时间" onBlur={e=>{CounterActions._config({time_class:e.target.value})}} defaultValue={this.state.config.time_class}/>
      </div>
      <div style={input_style}>
        <TextField hintText="以秒为单位" floatingLabelText="自由展示时间" onBlur={e=>{CounterActions._config({time_free:e.target.value})}} defaultValue={this.state.config.time_free}/>
      </div>
      <div style={input_style}>
        <TextField hintText="以秒为单位" floatingLabelText="评委嘉宾提问时间" onBlur={e=>{CounterActions._config({time_ask:e.target.value})}} defaultValue={this.state.config.time_ask}/>
      </div>
      <h3 style={style}>提示设置</h3>
      <div style={style}>
        <Toggle defaultToggled={this.state.config.alert30} label="还有30秒时提示" onToggle={ (e, toggled)=> {CounterActions._config({alert30: toggled}) }}/>
      </div>
      <div style={style}>
        <Toggle defaultToggled={this.state.config.alertfinish} label="结束时提示" onToggle={ (e, toggled)=> {CounterActions._config({alertfinish: toggled}) }} />
      </div>
      <div style={{textAlign: "center", color: Colors.grey400, fontSize: "0.9em",padding: "20px 0"}}>Powered By: Pandada8</div>

    </Paper>
  },
  getInitialState: function(){
    return {
      config: {
        alert30: true,
        alertfinish: true,
        time_class: 240,
        time_free: 180,
        time_ask: 60
      }
    }
  }
})

let Root = React.createClass({
  render: function (){
    return <Tabs>
      <Tab label="倒计时" >
        <Counter />
      </Tab>
      <Tab label="设置" >
        <Settings />
      </Tab>
    </Tabs>
  }
})
ReactDOM.render(<Root />, document.getElementById('container'))

// bind the root