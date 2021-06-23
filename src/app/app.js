// import packages
import React from 'react';
import "antd/dist/antd.css"
// import redux provider and store
import { Provider } from 'react-redux'
import { store } from '../state/store'
// import css
import '../css/app.css';
// import components
import WorkSpace from '../components/workspace'

var log = require('electron-log');
log.transports.console.level = "debug";

export default class App extends React.Component{
  render() {
    return (
        <div className = "app">
            <Provider store={store}>
              <WorkSpace/>
            </Provider>
        </div>
    );
  }
}

// export default App;
