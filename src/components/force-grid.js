import React from 'react'
import '../css/layout.css'
import '../../node_modules/react-grid-layout/css/styles.css'
import '../../node_modules/react-resizable/css/styles.css'
import GridLayout from 'react-grid-layout'

export default class ForceGrid extends GridLayout {
    constructor(props) {
        super(props);
        // if (props.forceSetState){
        //     this.setState = this.setState.bind(this);
        //     props.forceSetState.push(this.setState)
        // }
    }
}