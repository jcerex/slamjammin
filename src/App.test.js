import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import AudioRecorder from './Recorder/AudioRecorder';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AudioRecorder />, div);
});
