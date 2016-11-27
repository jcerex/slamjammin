import React, { Component, PropTypes } from 'react';
import encodeWAV from './wav-encoder.js';
import firebase from 'firebase';
import uuid from 'uuid';

class AudioRecorder extends Component {
  constructor(props) {
    super(props);

    this.buffers = [[], []];
    this.bufferLength = 0;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sampleRate = this.audioContext.sampleRate;
    this.recordingStream = null;
    this.playbackSource = null;

    this.state = {
      recording: false,
      playing: false,
      audio: props.audio,
      countdown: 20,
      finished: false,
    };

    const config = {
      apiKey: process.env.REACT_APP_FIREBASE_API,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    };
    firebase.initializeApp(config);
  }

  startRecording() {
    navigator.getUserMedia = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;
    navigator.getUserMedia({ audio: true }, (stream) => {
      const gain = this.audioContext.createGain();
      const audioSource = this.audioContext.createMediaStreamSource(stream);
      audioSource.connect(gain);

      const bufferSize = 2048;
      const recorder = this.audioContext.createScriptProcessor(bufferSize, 2, 2);
      recorder.onaudioprocess = (event) => {
        // save left and right buffers
        for(let i = 0; i < 2; i++) {
          const channel = event.inputBuffer.getChannelData(i);
          this.buffers[i].push(new Float32Array(channel));
          this.bufferLength += bufferSize;
        }
      };

      gain.connect(recorder);
      recorder.connect(this.audioContext.destination);
      this.recordingStream = stream;
    }, (err) => {

    });

    this.setState({
      recording: true
    });
    if (this.props.onRecordStart) {
      this.props.onRecordStart.call();
    };

    // doesn't stop full record properly
    // let time = 0;
    // setInterval(() => {
    //     time = time + 1;
    //     console.log(time);
    //     if (time === 2) {
    //       console.log('stop recording');
    //       this.stopRecording();
    //     };
    // }, 1000);
    // let timeLeft = 20;
    // setInterval(() => {
    //     timeLeft = timeLeft - 1;
    //     console.log(timeLeft);
    //     this.setState({
    //       countdown: timeLeft,
    //     });
    //     console.log('state', this.state.countdown);
    //     if (timeLeft === 0) {
    //       console.log('stop recording');
    //       this.stopRecording();
    //     };
    // }, 1000);
  }

  stopRecording() {
    this.recordingStream.getTracks()[0].stop();

    const audioData = encodeWAV(this.buffers, this.bufferLength, this.sampleRate);

    this.setState({
      recording: false,
      audio: audioData,
      finished: true
    });

    var storage = firebase.storage();

    var id = uuid.v1({
      node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
      clockseq: 0x1234,
      msecs: new Date().getTime(),
      nsecs: 5678
    });

    var file = audioData;
    storage.ref(`blobs/${id}`).put(file).then(function(snapshot) {
      console.log('Uploaded a clip!');
    });

    if (this.props.onChange) {
      this.props.onChange.call(null, {
        duration: this.bufferLength / this.sampleRate,
        blob: audioData
      });
    }

    this.props.reset();
  }

  startPlayback() {
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(this.state.audio);
    reader.onloadend = () => {
      this.audioContext.decodeAudioData(reader.result, (buffer) => {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.loop = this.props.loop;
        source.start(0);
        source.onended = this.onAudioEnded.bind(this);

        this.playbackSource = source;
      });

      this.setState({
        playing: true
      });

      if (this.props.onPlay) {
        this.props.onPlay.call();
      };
    };
  }

  stopPlayback(event) {
    if (this.state.playing) {
      event.preventDefault();

      this.setState({
        playing: false
      });

      if (this.props.onAbort) {
        this.props.onAbort.call();
      }
    }
  }

  removeAudio() {
    if (this.state.audio) {
      if (this.playbackSource) {
        this.playbackSource.stop();
        delete this.playbackSource;
      }

      this.setState({
        audio: null
      });

      if (this.props.onChange) {
        this.props.onChange.call();
      }
    }
  }

  downloadAudio() {
    const url = (window.URL || window.webkitURL).createObjectURL(this.state.audio);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'output.wav';
    const click = document.createEvent('Event');
    click.initEvent('click', true, true);
    link.dispatchEvent(click);
  }

  onAudioEnded() {
    if (this.state.playing) {
      this.setState({ playing: false });
    }

    if (this.props.onEnded) {
      this.props.onEnded.call();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.audio && nextProps.audio !== this.state.audio) {
      this.stopPlayback();
      this.setState({
        audio: nextProps.audio
      });
    }
  }

  render() {
    const strings = this.props.strings;

    let buttonText, buttonClass = ['AudioRecorder-button'], audioButtons;
    let clickHandler;
    if (this.state.audio) {
      buttonClass.push('hasAudio');

      if (this.state.playing) {
        buttonClass.push('isPlaying');
        buttonText = strings.playing;
        clickHandler = this.stopPlayback;
      } else {
        buttonText = strings.play;
        clickHandler = this.startPlayback;
      }

      audioButtons = [
        <button key="remove" className="AudioRecorder-remove" onClick={this.removeAudio.bind(this)}>{strings.remove}</button>
      ];

      if (this.props.download) {
        audioButtons.push(
          <button key="download" className="AudioRecorder-download" onClick={this.downloadAudio.bind(this)}>{strings.download}</button>
        );
      }

      if (this.state.finished) {
        audioButtons.push(
          <a className="AudioRecorder-button btn-reset" href="/">↻ Reset</a>
        );
      }

    } else {
      if (this.state.recording) {
        buttonClass.push('isRecording');
        buttonText = strings.recording;
        clickHandler = this.stopRecording;
      } else {
        buttonText = strings.record;
        clickHandler = this.startRecording;
      }
    }

    return (
      <div className="AudioRecorder">
        <button
          className={buttonClass.join(' ')}
          onClick={clickHandler && clickHandler.bind(this)}
          >
          {buttonText}
        </button>
        {audioButtons}
        {this.state.finished ? <h3>Thanks for contributing!</h3> : null}
      </div>
    );
  }
}

AudioRecorder.propTypes = {
  audio: PropTypes.instanceOf(Blob),
  download: PropTypes.bool,
  loop: PropTypes.bool,

  onAbort: PropTypes.func,
  onChange: PropTypes.func,
  onEnded: PropTypes.func,
  onPause: PropTypes.func,
  onPlay: PropTypes.func,
  onRecordStart: PropTypes.func,

  strings: React.PropTypes.shape({
    play: PropTypes.string,
    playing: PropTypes.string,
    record: PropTypes.string,
    recording: PropTypes.string,
    remove: PropTypes.string,
    download: PropTypes.string
  })
};

AudioRecorder.defaultProps = {
  download: true,
  loop: false,

  strings: {
    play: '▶ Play',
    playing: '❚❚ Pause',
    record: '● Record',
    recording: '● Recording',
    remove: '✖ Remove',
    download: '\ud83d\udcbe Save' // unicode floppy disk
  }
};

export default AudioRecorder;
