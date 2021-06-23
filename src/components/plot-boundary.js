import React from 'react';
import { DropTarget } from 'react-dnd';
import {ItemTypes} from "./constants";
import {setGridDropFocus} from "../state/subplot-grid/actions";
import {getGridDropFocus} from "../state/subplot-grid/selectors";
import {connect} from "react-redux";
import * as _ from 'lodash';
import $ from 'jquery';

const mapStateToProps = ({subplotGrid}) => {
    return {
        gridDropFocus: getGridDropFocus(subplotGrid)
    }
};

const mapDispatchToProps = dispatch => ({
    setGridDropFocus: (id, edge) => {dispatch(setGridDropFocus(id, edge))}
});

// DnD DropTarget - collect
const collect = ( connect, monitor )=>{
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
};

const PlotSpec = {
    drop(){
        return {dropped:true}
    },
    hover(props, monitor, component){
        var { isOver, canDrop } = component.props;
        console.log('isOver', isOver, 'canDrop', canDrop);
        component.setState({ isActive: isOver && canDrop });
    }
};

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

class PlotBoundary extends React.Component {
    state = {
        isActive:false
    };
    constructor(props) {
        super(props);
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.isActive !== this.state.isActive){
            const { setGridDropFocus, id, direction } = this.props,
                { isActive } = this.state;
            setGridDropFocus(id, isActive ? direction:null)
        }
    };
    updateActiveStatus() {

    };
    render() {
        const {isOver, canDrop, connectDropTarget, id, direction, gridDropFocus} = this.props,
            active = _.isEqual(gridDropFocus, [id, direction]) && canDrop;
        return connectDropTarget(
            <div
                id={`${id}-${direction}-boundary`}
                className={
                    `subplot_boundary ${direction} ${active? 'selected' : ''}`}/>
        );
    }
}

// connect DnD
PlotBoundary = DropTarget(ItemTypes.PLOT, PlotSpec, collect)(PlotBoundary);

// connect Redux
PlotBoundary = connect(mapStateToProps, mapDispatchToProps)(PlotBoundary);

class PlotBoundaries extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {id} = this.props;

    }

    render() {
        var id = this.props.id;
        return <div
            id={`${id}-boundaries`}
            className={'subplot_boundaries'}
            onMouseMove={(e)=>{
                // console.log($(`.${id}.plot`), e)
                // $(`.${id}.plot`).parent().mousemove(e.nativeEvent)
            }
            }>
            <PlotBoundary
                id={id}
                direction={'left'}
            />
            <PlotBoundary
                id={id}
                direction={'right'}
            />
            <PlotBoundary
                id={id}
                direction={'top'}
            />
            <PlotBoundary
                id={id}
                direction={'bottom'}
            />
            <PlotBoundary
                id={id}
                direction={null}
            />
        </div>;
    }
}

export default PlotBoundaries
