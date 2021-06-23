import * as React from 'react'
import { Classes, Tree } from '@blueprintjs/core'
import '../css/sidebar.css'
import { Resizable } from "re-resizable"
import {connect} from "react-redux";
import {DropTarget} from 'react-dnd';
import { ItemTypes } from './constants';
import DraggableTreeNode from "./tree-node";

const mapStateToProps = ({core}) => {
    return {
        activeView: core.activeView,
    }
};

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

// DnD Spec
const PlotSpec = {
    drop(){
    }
};

// DnD DropTarget - collect
let collect = ( connect, monitor )=>{
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
};

class PlotterSideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: PLOTVIEW_NODES,
            class: props.className !== undefined ? `${Classes.ELEVATION_0} ${props.className}`:Classes.ELEVATION_0
        }
    }

    componentDidUpdate() {
    }

    render() {
        const connectDropTarget = this.props.connectDropTarget;
        var nodes = this.state.nodes;
        return connectDropTarget(
            <div>
                <Resizable
                    style={style}
                    onResize={this.props.onResize}
                    onResizeStart={this.props.onResizeStart}
                    onResizeStop={this.props.onResizeStop}
                    enable={{
                        top: false,
                        right: true,
                        bottom: true,
                        left: false,
                        topRight: false,
                        bottomRight: true,
                        bottomLeft: false,
                        topLeft: false
                    }}
                    className='sidebar'
                    size={
                        this.props.size
                    }
                    minHeight={
                        40
                    }
                    minWidth={
                        40
                    }
                    maxWidth={
                        this.props.maxWidth
                    }
                    maxHeight={
                        this.props.maxHeight
                    }
                >

                    <Tree
                        contents={nodes}
                        onNodeClick={(nodeData, _nodePath, e) =>
                            this.handleNodeClick(nodes, nodeData, _nodePath, e)
                        }
                        onNodeCollapse={this.handleNodeCollapse}
                        onNodeExpand={this.handleNodeExpand}
                        className={this.state.class}
                    />
                </Resizable>
            </div>
        )
    }

    handleNodeClick = (nodeList, nodeData, _nodePath, e) => {
        const originallySelected = nodeData.isSelected;
        if (!e.shiftKey) {
            this.forEachNode(this.state.nodes, n => (n.isSelected = false))
        }
        nodeData.isSelected = originallySelected == null ? true : !originallySelected
        this.setState(this.state)
    };

    handleNodeCollapse = (nodeData) => {
        nodeData.isExpanded = false;
        this.setState(this.state)
    };

    handleNodeExpand = (nodeData) => {
        nodeData.isExpanded = true;
        this.setState(this.state)
    };

    forEachNode(nodes, callback) {
        if (nodes == null) {
            return
        }

        for (const node of nodes) {
            this.forEachNode(node.childNodes, callback);
            callback(node)
        }
    }
}

var PLOTVIEW_NODES = [
    {
        id: 0,
        label: <DraggableTreeNode
            id={0}
            label={'Line Graph'}/>
    },
    {
        id: 1,
        label:  <DraggableTreeNode
            id={1}
            label={'Bar Graph'}/>
    }
];

export default DropTarget(ItemTypes.PLOT, PlotSpec, collect)(connect(mapStateToProps)(PlotterSideBar))