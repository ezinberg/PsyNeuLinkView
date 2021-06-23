import * as React from 'react'
import { Spinner, Icon } from '@blueprintjs/core'
import '../css/indicatorlight.css'

export default class IndicatorLight extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: this.props.status,
            className: this.props.className
        };
        this.statusBindings = {
            'loading':
                <Spinner
                    small={true}
                    size={Spinner.SIZE_SMALL}
                    className={this.state.className}
                />
            ,
            'bad':
                <Icon
                    icon={'error'}
                    color={'red'}
                    className={this.state.className}
                />
            ,
            'good':
                <Icon
                    icon={'tick-circle'}
                    color={'green'}
                    className={this.state.className}
                />
            ,
            'unsure':
                <Icon
                    icon={'help'}
                    color={'gray'}
                    className={this.state.className}
                />
        };
        this.render = this.render.bind(this)
    }

    render() {
        var statusIcon = this.statusBindings[this.props.status];
        if (!statusIcon){
            statusIcon = this.statusBindings['unsure'];
        }
        return (
            statusIcon
        )
    }
}