import * as React from 'react'
import { DragSource, DropTarget } from 'react-dnd';
import { ItemTypes } from './constants';

const plotSpec = {
    beginDrag(props){
        return{
            name: props.label
        }
    },
    endDrag(props, monitor, component){
        if (monitor.didDrop()){
            const dragItem = monitor.getItem(); // from beginDrag
            const dropResult = monitor.getDropResult();
            // Move action goes here
            // console.log("You dropped ", dragItem.name, ' into '+ dropResult.name)
        }else{
            return;
        }
    }
};

// phone DragSource collect
let collect = ( connect, monitor ) =>{
    return{
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }
};

class DraggableTreeNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            label:this.props.label,
            // childNodes:this.props.childNodes
        };
    }
    render() {
        const {isDragging, connectDragSource, connectDragTarget} = this.props;
        return connectDragSource(
            <div>
                {this.state.label}
            </div>
        )
    }
}


export default DragSource(ItemTypes.PLOT, plotSpec, collect)(DraggableTreeNode)
