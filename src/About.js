import React, { Component } from 'react';
import './App.css';

class About extends Component {
  render() {
    return (
      <div className="about-container text-center">
        <h1>About this Project <a href="/"><span className="btn-close">✕</span></a></h1>
        <p>Blah blah</p>
        <p>Only works on Chrome at this time.</p>
      </div>
    );
  }
}

export default About;
