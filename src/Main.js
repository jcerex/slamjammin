import React, { Component } from 'react';
import './App.css';
import AudioRecorder from './Recorder/AudioRecorder';

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      recorder: () => <AudioRecorder reset={this.revealReset} />,
      showReset: false,
      countdown: 20,
    };
  }

  decrementCountdown(nextCountdown) {
    this.setState({
      countdown: nextCountdown,
    })
  }

  resetRecorder() {
    this.setState({
      showReset: false,
    });
  }

  revealReset = () => {
    this.setState({
      showReset: true,
    });
  }

  render() {
    const ActiveRecorder = this.state.recorder;
    const image_url = process.env.REACT_APP_CLOUDINARY_URL + 'v1478826305/yell-311455_640_mslkqx.png';
    Array.prototype.sample = function(){
      return this[Math.floor(Math.random()*this.length)];
    };
    const headings = [
      "What grinds your gears?",
      "Have a whine",
      "What's wrong with the world?",
      "Do politicians even care?",
      "My boss is an idiot",
      "Hipsters have gone too far",
      "This app could be better"
    ];

    return (
      <div>
        <div className="container text-center">
          <h1>{headings.sample()}</h1>

          <ActiveRecorder />
          <img src={image_url} className="main-img" alt="Slam Jamm.in" />
        </div>
      </div>
    );
  }
}
