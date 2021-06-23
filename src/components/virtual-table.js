import React, {createRef} from 'react';
import 'antd/dist/antd.css';
import {VariableSizeGrid as Grid} from 'react-window';
import ResizeObserver from 'rc-resize-observer';
import classNames from 'classnames';
import {Checkbox, Table} from 'antd';
import '../css/paramform.css'
import {connect} from 'react-redux'
import {getMapParentIdToTabFocus} from "../state/subplot-config-form/selectors";

const mapStateToProps = ({subplotConfigForm}) => {
    return {
        mapParentIdToTabFocus:getMapParentIdToTabFocus(subplotConfigForm),
    }
};

function onChange(e) {
}

class VirtualTable extends React.Component{
    constructor() {
        super();
        this.gridRef = createRef();
        this.state = {
            tableWidth: 0,
            setTableWidth: 0,
            connectOjbect: this.getConnectObjectInitialState()
        };
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions()
    }
    bindThisToFunctions(){
        this.renderVirtualList = this.renderVirtualList.bind(this);
        this.getConnectObjectInitialState = this.getConnectObjectInitialState.bind(this);
        this.resetVirtualGrid = this.resetVirtualGrid.bind(this);
        this.renderVirtualList = this.renderVirtualList.bind(this);
    }

    getConnectObjectInitialState(){
        const obj = {};
        const gridRef = this.gridRef;
        Object.defineProperty(obj, 'scrollLeft', {
            get: () => null,
            set: scrollLeft => {
                if (gridRef.current) {
                    gridRef.current.scrollTo({
                        scrollLeft,
                    });
                }
            },
        });
        return obj;
    }
    componentDidMount(){
        this.resetVirtualGrid();
    }

    componentDidUpdate(){
        this.resetVirtualGrid();
    }

    componentWillUnmount(){
        this.resetVirtualGrid();
    }

    resetVirtualGrid () {
        const gridRef = this.gridRef;
        gridRef.current.resetAfterIndices({
            columnIndex: 0,
            shouldForceUpdate: true,
        });
    };

    mergedColumns() {
        const {columns} = this.props;
        const {tableWidth} = this.state;
        const widthColumnCount = columns.filter(({width}) => !width).length;
        return columns.map(
            column => {
                if (column.width) {
                    return column;
                }
                return {...column, width: Math.floor(tableWidth / widthColumnCount), height:this.getInputSize()}
            }
        )
    }

    onChange(e, row){
        this.props.onChange(e, row)
    }

    renderVirtualList (rawData, { scrollbarSize, ref, onScroll }){
        ref.current = this.state.connectOjbect;
        var mergedColumns = this.mergedColumns();
        return (
            <Grid
                ref={this.gridRef}
                className="virtual-grid"
                columnCount={mergedColumns.length}
                columnWidth={index => {
                    const { width } = mergedColumns[index];
                    return index === mergedColumns.length - 1 ? width - scrollbarSize - 1 : width;
                }}
                height={this.props.scroll.y}
                rowCount={rawData.length}
                rowHeight={() => 54}
                width={this.state.tableWidth}
                onScroll={({ scrollLeft }) => {
                    onScroll({
                        scrollLeft,
                    });
                }}
            >
                {({ columnIndex, rowIndex, style }) => (
                    <div
                        className={classNames('virtual-table-cell', {
                            'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
                        })}
                        style={style}
                    >
                        {this.props.cellCheckbox ?
                            <Checkbox
                                  style={{marginRight:'30px'}}
                                  checked={rawData[rowIndex].selected}
                                  onChange={(e)=>{this.onChange(e, rawData[rowIndex])}}/> : ''}

                        {rawData[rowIndex][mergedColumns[columnIndex].key]}

                    </div>
                )}
            </Grid>
        );

    }

    getInputSize(){
        if (this.props.size === 'small'){
            return '24px'
        }
        else if (this.props.size === 'large'){
            return '40px'
        }
        else {
            return '32px'
        }
    }

    render() {
        return (
            <ResizeObserver
                onResize={({ width }) => {
                    this.setState({tableWidth: width});
                }}
            >
                <Table
                    {...this.props}
                    className="virtual-table"
                    columns={this.mergedColumns()}
                    pagination={false}
                    components={{
                        body: this.renderVirtualList,
                    }}
                />
            </ResizeObserver>
        );
    }
}

export default connect(mapStateToProps)(VirtualTable)