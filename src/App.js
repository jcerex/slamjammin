const React = require('react');
import './App.css';
// const Main = require('./Main').default;
import Main from './Main';
// const About = require('./About').default;
import About from './About';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showMain: true,
    };
  }

  toggleShowMain() {
    if (!this.state.showMain) {
      this.setState({ showMain: true });
    } else {
      this.setState({ showMain: false });
    }
  }

  render() {
    return (
      <div className="root">
        <div className="container header">
          <h4><b>Slam Jamm.in</b> - We create music out of your rage</h4>
        </div>
        <div className="main-container">
          {this.state.showMain ? <Main /> : <About />}
        </div>
        <div className="container">
          <a className="btn-about" onClick={() => this.setState({ showMain: false })}>About this project</a>
        </div>
      </div>
    );
  }
}

export default App;
