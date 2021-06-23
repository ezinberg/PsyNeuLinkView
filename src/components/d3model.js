import React from 'react'
import '../css/d3model.css'
import * as d3 from 'd3'
import {Resizable} from 're-resizable'
import {Spinner} from '@blueprintjs/core'
import {Index} from '../utility/d3-helper/d3-helper'
import * as _ from 'lodash'
import {connect} from "react-redux";
import {store} from "../state/store";
import {setModelAspectRatio, setStyleSheet} from "../state/core/actions";

const mapStateToProps = ({core}) => {
    return {
        graphStyle: core.stylesheet,
        styleSheet: core.stylesheet,
        aspectRatio: core.modelAspectRatio
    }
};

const contextMenu = [
    {
        onClick: {},
        text: 'Placeholder 1'
    },
    {
        onClick: {},
        text: 'Placeholder 2'
    }
];

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

var fs = window.interfaces.filesystem,
    interp = window.interfaces.interpreter,
    rpcClient = window.interfaces.rpc;

class D3model extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            class: `graph-view ${this.props.className}`,
            mounted: false,
            nodeWidth: 20,
            nodeHeight: 15,
            graph: this.props.graph,
            spinnerVisible: false
        };
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
        this.debounceFunctions();
        this.setAspectRatio();
        this.flags = {
            dirty: false,
            reloadLoactions: false,
            updateLocations: false
        };
    }

    debounceFunctions(){
        this.updateScript = _.debounce(this.updateScript, 100)
        this.setDirtyFlagToFalse = _.debounce(this.setDirtyFlagToFalse, 200)
        this.onResize = _.debounce(this.onResize, 100)
    }

    // lifecycle methods

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!(this.props.graph === prevProps.graph)) {
            if (this.props.graph === "loading") {
                d3.selectAll('svg').remove();
                this.setState({"spinnerVisible": true})
            } else if (!(this.props.graph === null)) {
                d3.selectAll('svg').remove();
                this.setState({"spinnerVisible": false});
                this.stylesheet = null;
                this.setGraph();
            }
        }
        var sizeUpdated = (!_.isEqual(this.props.size, prevProps.size) && this.svg);
        // viewbox must be redimensioned before node positioning is set
        if (sizeUpdated) {
            this.reDimensionViewbox();
        }
        if (this.flags.reloadLoactions) {
            this.setNodePositioningFromStylesheet();
            this.flags.reloadLoactions = false;
        }
        if (this.flags.updateLocations) {
            this.commitAllNodesToStylesheet();
            this.updateScript();
            this.flags.updateLocations = false;
        }
        this.updateGraphFromStylesheet(prevProps);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('wheel', this.onMouseWheel);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('mousemove', this.mouseMove);
        var win = document.querySelector('.graph-view');
        if (win) {
            win.removeEventListener('scroll', this.updateScroll);
        }
        this.setState({mounted: false})
        this.updateScript();
        this.efferentCopies = [];
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.mouseMove)
        window.addEventListener('resize', this.onResize);
        window.addEventListener('wheel', this.onMouseWheel, {passive: false});
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        if (!(this.state.mounted)) {
            if (this.props.graph === "loading") {
                d3.selectAll('svg').remove();
                this.setState({"spinnerVisible": true})
            } else if (!(this.props.graph === null)) {
                d3.selectAll('svg').remove();
                this.setState({"spinnerVisible": false});
                this.stylesheet = null;
                this.setGraph();
            }
        }
        this.efferentCopies = [];
    }

    mouseMove(e) {
        e.preventDefault();
    }

    setNonReactState() {
        this.index = new Index();
        this.selected = new Set();
        this.mouseOffset = {x: 0, y: 0};
        this.scalingFactor = 1;
        this.fillProportion = 1;
    }

    bindThisToFunctions() {
        this.debounceFunctions = this.debounceFunctions.bind(this);
        this.updateGraphFromStylesheet = this.updateGraphFromStylesheet.bind(this);
        this.reDimensionViewbox = this.reDimensionViewbox.bind(this);
        this.setAspectRatio = this.setAspectRatio.bind(this);
        this.commitAllNodesToStylesheet = this.commitAllNodesToStylesheet.bind(this);
        this.validateStylesheet = this.validateStylesheet.bind(this);
        this.setCanvasStateFromStylesheet = this.setCanvasStateFromStylesheet.bind(this);
        this.setNodePositioningFromStylesheet = this.setNodePositioningFromStylesheet.bind(this);
        this.commitToStylesheetAndUpdateScript = this.commitToStylesheetAndUpdateScript.bind(this);
        this.onResize = this.onResize.bind(this);
        this.setNonReactState = this.setNonReactState.bind(this);
        this.centerGraph = this.centerGraph.bind(this);
        this.setGraph = this.setGraph.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.scaleGraph = this.scaleGraph.bind(this);
        this.scaleGraphInPlace = this.scaleGraphInPlace.bind(this);
        this.scaleGraphToFit = this.scaleGraphToFit.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.updateScroll = this.updateScroll.bind(this);
        this.updateScript = this.updateScript.bind(this);
        this.moveNode = this.moveNode.bind(this);
        this.onZoom = this.onZoom.bind(this);
        this.moveGraph = this.moveGraph.bind(this);
        this.refreshEdgesForNode = this.refreshEdgesForNode.bind(this);
        this.moveLabelToCorrespondingNode = this.moveLabelToCorrespondingNode.bind(this);
        this.handleStyleDiff = this.handleStyleDiff.bind(this);
        this.handleDimensionDiff = this.handleDimensionDiff.bind(this);
        this.handleStyleDiff = this.handleStyleDiff.bind(this);
        this.handleScaleDiff = this.handleScaleDiff.bind(this);
        this.handleZoomDiff = this.handleZoomDiff.bind(this);
        this.handleNodeDiff = this.handleNodeDiff.bind(this);
        this.associateVisualInformationWithGraphEdges = this.associateVisualInformationWithGraphEdges.bind(this);
        this.associateVisualInformationWithGraphNodes = this.associateVisualInformationWithGraphNodes.bind(this);
    }
    
    commitToStylesheetAndUpdateScript(callback = () => {
    }) {
        window.removeEventListener('mouseup', this.commitToStylesheetAndUpdateScript);
        this.reDimensionViewbox();
        this.commitAllNodesToStylesheet();
        this.commitCanvasSizeToStylesheet();
        this.commitZoomToStylesheet();
        this.updateScript();
    }

    onResize() {
        if (![null, 'loading'].includes(this.props.graph)) {
            this.commitToStylesheetAndUpdateScript()
        }
    }

    updateGraphFromStylesheet(prevProps) {
        var styleUpdated = (!(_.isEqual(this.props.graphStyle, prevProps.graphStyle))),
            prevAndCurrentStyleExist = (!_.isEmpty(prevProps.graphStyle) && !_.isEmpty(this.props.graphStyle));

        if (prevAndCurrentStyleExist) {
            var styleDiff = this.difference(this.props.graphStyle, prevProps.graphStyle);
            if (!_.isEmpty(styleDiff) &&
                !document.hasFocus() &&
                !this.flags.dirty
            ) {
                this.handleStyleDiff(styleDiff)
            }
        }
    }

    handleStyleDiff(styleDiff) {
        this.handleDimensionDiff(styleDiff);
        this.handleScaleDiff(styleDiff);
        this.handleZoomDiff(styleDiff);
        this.handleScrollDiff(styleDiff);
        this.handleNodeDiff(styleDiff);
    }

    handleDimensionDiff(styleDiff) {
        var self = this,
            canvasSS = self.stylesheet['Canvas Settings']
        if ('Canvas Settings' in styleDiff) {
            var canvasSD = styleDiff['Canvas Settings'],
                widthSD = canvasSD['Width'],
                widthSS = canvasSS['Width'],
                heightSD = canvasSD['Height'],
                heightSS = canvasSS['Height'];
            if ((widthSD && !(widthSD === widthSS))
                || (heightSD && !(heightSD === heightSS))) {
                var width = widthSD ? widthSD : widthSS,
                    height = heightSD ? heightSD : heightSS;
                canvasSS['Width'] = width;
                canvasSS['Height'] = height;
                this.props.graphSizeFx(width, height, () => {
                    self.flags.updateLocations = true;
                    self.forceUpdate();
                });
            }
        }
    }

    handleScaleDiff(styleDiff) {
        if ('Graph Settings' in styleDiff) {
            if ('Scale' in styleDiff['Graph Settings']) {
                var graphSD = styleDiff['Graph Settings'],
                    graphSS = this.stylesheet['Graph Settings'],
                    zoomSS = this.stylesheet['Canvas Settings']['Zoom'] / 100,
                    scaleSD = graphSD['Scale'];
                if (scaleSD) {
                    var scaleDiff = (scaleSD * zoomSS) / (this.scalingFactor * zoomSS);
                    this.scaleGraphInPlace(scaleDiff);
                    graphSS['Scale'] = scaleSD;
                    this.flags.updateLocations = true;
                    this.forceUpdate()
                }
                ;
            }
        }
    }

    handleZoomDiff(styleDiff) {
        var self = this,
            canvasSS = self.stylesheet['Canvas Settings'];
        if ('Canvas Settings' in styleDiff) {
            if ('Zoom' in styleDiff['Canvas Settings']) {
                var zoom = styleDiff['Canvas Settings']['Zoom'] / 100;
                canvasSS['Zoom'] = Math.round(zoom * 100);
                this.updateScript();
                var xScrollSS = canvasSS['xScroll'],
                    yScrollSS = canvasSS['yScroll'];
                this.svg.call(this.zoom.scaleTo, zoom);
                var scrollBounds = this.getScrollBounds(),
                    win = document.querySelector('.graph-view');
                win.scrollTo(
                    scrollBounds.x * (xScrollSS / 100),
                    scrollBounds.y * (yScrollSS / 100)
                )
            }
        }
    }

    handleScrollDiff(styleDiff) {
        var self = this,
            canvasSS = self.stylesheet['Canvas Settings'],
            scrollBounds = this.getScrollBounds(),
            win = document.querySelector('.graph-view');
        if ('Canvas Settings' in styleDiff) {
            if ('xScroll' in styleDiff['Canvas Settings']) {
                var xScrollSD = styleDiff['Canvas Settings']['xScroll'];
                canvasSS['xScroll'] = xScrollSD;
                win.scrollTo(scrollBounds.x * (xScrollSD / 100), win.scrollTop)
            }
            if ('yScroll' in styleDiff['Canvas Settings']) {
                var yScrollSD = styleDiff['Canvas Settings']['yScroll'];
                canvasSS['yScroll'] = yScrollSD;
                win.scrollTo(win.scrollLeft, scrollBounds.y * (yScrollSD / 100))
            }
        }
    }

    handleNodeDiff(styleDiff) {
        var graphSS = this.stylesheet['Graph Settings'],
            componentsProps = this.props.graphStyle['Graph Settings']['Components'];
        if ('Graph Settings' in styleDiff) {
            if ('Components' in styleDiff['Graph Settings']) {
                graphSS['Components'] = componentsProps;
                this.setNodePositioningFromStylesheet();
            }
        }
    }

    difference(object, base) {
        function changes(object, base) {
            return _.transform(object, function (result, value, key) {
                if (!_.isEqual(value, base[key])) {
                    result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
                }
            });
        }

        return changes(object, base);
    }

    validateStylesheet() {
        if (!(this.stylesheet)) {
            this.stylesheet = _.cloneDeep(this.props.graphStyle)
        }
        if (!(this.stylesheet)) {
            this.stylesheet = {}
        }
        if (!('Window Settings' in this.stylesheet)) {
            this.stylesheet['Window Settings'] =
                {
                    Width: '',
                    Height: ''
                }
        }
        if (!('Canvas Settings' in this.stylesheet)) {
            this.stylesheet['Canvas Settings'] = {
                Width: '',
                Height: '',
                Zoom: 100,
                xScroll: 0,
                yScroll: 0
            };
            this.commitCanvasSizeToStylesheet();
        }

        if (!('Graph Settings' in this.stylesheet)) {
            this.stylesheet['Graph Settings'] = {}
        }

        if (!('Scale' in this.stylesheet['Graph Settings'])) {
            this.stylesheet['Graph Settings']['Scale'] = this.scalingFactor
        }

        if (!('Components' in this.stylesheet['Graph Settings'])) {
            this.stylesheet['Graph Settings']['Components'] = {}
        }
        if (!('Nodes' in this.stylesheet['Graph Settings']['Components'])) {
            this.stylesheet['Graph Settings']['Components']['Nodes'] = {}
        }
    }

    onKeyDown(e) {
        if (this.state.mounted){
            if (e.metaKey || e.ctrlKey) {
                if (e.key === '+' || e.key === '=') {
                    this.nudgeGraphLarger();
                } else if (e.key === '-') {
                    this.nudgeGraphSmaller();
                }
                if (e.key === 'r') {
                    this.resetGraph()
                }
                if (e.key === 'a') {
                    this.index.nodes.forEach(
                        (node) => {
                            this.selectNode(node)
                        }
                    )
                }
            }
            if (e.key.includes('Arrow') && this.selected.size > 0) {
                var increment;
                var self = this;
                e.preventDefault();
                increment = (e.metaKey || e.ctrlKey ? 25 : 1);
                if (e.key === 'ArrowUp') {
                    this.moveNodes(0, -increment);
                }
                if (e.key === 'ArrowDown') {
                    this.moveNodes(0, increment);
                }
                if (e.key === 'ArrowRight') {
                    this.moveNodes(increment, 0);
                }
                if (e.key === 'ArrowLeft') {
                    this.moveNodes(-increment, 0);
                }
            }
            if (e.key === 'Escape') {
                this.unselectAll()
            }
        }
    }

    onKeyUp() {
        if (this.state.mounted) {
            this.updateScript();
        }
    }

    onScrollEnd(e) {
        window.removeEventListener('mouseup', this.onScrollEnd)
        this.commitToStylesheetAndUpdateScript();
    }

    updateScript(callback = () => {}) {
        var self = this;
        var efferentCopy = {...this.stylesheet}
        this.efferentCopies.push(efferentCopy);
        if (this.props.filepath) {
            store.dispatch(setStyleSheet(efferentCopy));
            rpcClient.updateStylesheet(efferentCopy);
        }
    }

    resetGraph() {
        this.svg.call(this.zoom.transform, d3.zoomIdentity);
    }

    onMouseWheel(e) {
        if (e.metaKey || e.ctrlKey) {
            this.mouseOffset = {
                x: e.offsetX,
                y: e.offsetY
            };
            e.preventDefault();
            if (e.deltaY < 0) {
                this.svg.call(this.zoom.scaleBy, 1.02, [e.offsetX, e.offsetY]);
            } else {
                this.svg.call(this.zoom.scaleBy, 0.98, [e.offsetX, e.offsetY]);
            }
        }
    }

    mouseInsideCanvasBounds(e) {
        var canvasBounds = this.getCanvasBoundingBox();
        if (
            e.clientX >= canvasBounds.x && e.clientX <= canvasBounds.x + canvasBounds.width &&
            e.clientY >= canvasBounds.y && e.clientY <= canvasBounds.y + canvasBounds.height
        ) {
            return true
        } else {
            return false
        }
    }

    mouseInsideGraphBounds(e) {
        var graphBounds = this.getGraphBoundingBox();
        if (
            e.offsetX >= graphBounds.x && e.offsetX <= graphBounds.x + graphBounds.width &&
            e.offsetY >= graphBounds.y && e.offsetY <= graphBounds.y + graphBounds.height
        ) {
            return true
        } else {
            return false
        }
    }

    nudgeGraphLarger() {
        this.scaleGraphInPlace(1.02);
        this.commitToStylesheetAndUpdateScript();
        this.updateScript();
    }

    nudgeGraphSmaller() {
        this.scaleGraphInPlace(.98);
        this.commitToStylesheetAndUpdateScript();
        this.updateScript();
    }

    createSVG() {
        var svg, svgRect, container;
        svg = d3.select('.graph-view')
            .append('svg')
            .attr('class', 'graph')
            .attr('height', '100%')
            .attr('width', '100%')
            .attr('preserveAspectRatio', 'xMidYMid');
        svgRect = document.querySelector('svg').getBoundingClientRect();
        svg
            .attr("viewBox", [0, 0, svgRect.width, svgRect.height]);
        this.appendDefs(svg);
        this.applySelectBoxes(svg);
        this.applyZoom(svg);
        this.bindScrollUpdating();
        this.svg = svg;
        container = this.createContainer(svg);
        return container
    }

    createContainer(svg) {
        var container = svg
            .append('g')
            .attr('class', 'container');
        return container
    }

    appendDefs(svg) {
        var colors = ['black', 'orange', 'blue'];
        var svg = svg;
        colors.forEach(
            color => {
                svg.append("svg:defs").append("svg:marker")
                    .attr("id", `triangle_${color}`)
                    .attr("refX", 4)
                    .attr("refY", 4)
                    .attr("markerWidth", 8)
                    .attr("markerHeight", 8)
                    .attr("orient", "auto")
                    .append("path")
                    .attr("d", "M 1 0 8 4 1 8 1 4")
                    .attr("fill", color);
            }
        );
    }

    associateVisualInformationWithGraphNodes() {
        this.props.graph.objects.forEach(function (d) {
                d.x = parseInt(Math.abs(d.text.x));
                d.y = parseInt(Math.abs(d.text.y));
                if ('ellipse' in d) {
                    d.color = d.ellipse.stroke;
                    if ('stroke-width' in d.ellipse) {
                        d.strokeWidth = parseInt(d.ellipse['stroke-width'])
                    } else {
                        d.strokeWidth = 1
                    }
                } else {
                    d.color = d.polygon.stroke;
                }
                d.name = d.title;
            }
        );
    }

    associateVisualInformationWithGraphEdges() {
        var self = this;
        this.props.graph.edges.forEach(function (d) {
            d.tailNode = self.props.graph.objects[d.tail];
            d.headNode = self.props.graph.objects[d.head];
            d.color = d.path.stroke;
        });
    }

    drawProjections(container) {
        var self = this;
        self.associateVisualInformationWithGraphEdges();
        var id = 0;
        var edge = container.append('g')
            .attr('class', 'edge')
            .selectAll('line')
            .data(self.props.graph.edges)
            .enter()
            .append('line')
            .attr('id', function (d) {
                id += 1;
                return `p${id - 1}`
            })
            .attr('x1', function (d) {
                return d.tailNode.x
            })
            .attr('y1', function (d) {
                return d.tailNode.y
            })
            .attr('x2', function (d) {
                return d.headNode.x
            })
            .attr('y2', function (d) {
                return d.headNode.y
            })
            .attr('stroke-width', 1)
            .attr('stroke', function (d) {
                return d.color
            })
            .attr('marker-end', function (d) {
                var color = d.color;
                var colorMap = {
                    '#000000': 'black',
                    '#ffa500': 'orange',
                    '#0000ff': 'blue'
                };
                color = color in colorMap ? colorMap[color] : color;
                return `url(#triangle_${color})`;
            });
        this.index.addD3Group(edge, 'projection');
        this.edge = edge;
        this.drawRecurrentProjections(container);
    }

    drawRecurrentProjections(container) {
        var self = this;
        var recurrentProjs = [];
        var id = 0;
        d3.selectAll('g.edge line')
            .each(function (e) {
                if (e.headNode === e.tailNode) {
                    recurrentProjs.push(e);
                }
            });
        var recurrent = container.append('g')
            .attr('class', 'recurrent')
            .selectAll('path')
            .data(recurrentProjs)
            .enter()
            .append('path')
            .attr('id', function (d) {
                id += 1;
                return `r${id - 1}`
            })
            // .attr('d', ()=>{
            //     return self.generate_arc()
            // })
            .attr('fill', 'white')
            .attr('fill-opacity', '0')
            .attr('stroke', 'black')
            .attr('stroke-width', 1);
        self.recurrent = recurrent;
        self.index.addD3Group(recurrent, 'projection');
    }

    drawNodes(container, nodeDragFunction) {
        var self = this;
        var nodeWidth = self.state.nodeWidth;
        var nodeHeight = self.state.nodeHeight;
        self.associateVisualInformationWithGraphNodes();
        var id = 0;
        var node = container.append('g')
            .attr('class', 'node')
            .selectAll('ellipse')
            .data(this.props.graph.objects)
            .enter()
            .append('ellipse')
            .attr('id', function (d) {
                id += 1;
                return `n${id - 1}`
            })
            .attr('rx', function (d) {
                d.rx = nodeWidth;
                return d.rx
            })
            .attr('ry', function (d) {
                d.ry = nodeHeight;
                return d.ry
            })
            .attr('cx', function (d) {
                return d.x
            })
            .attr('cy', function (d) {
                return d.y
            })
            .attr('fill', 'white')
            .attr('stroke-width', function (d) {
                d.strokeWidth = d.strokeWidth ? d.strokeWidth : 1;
                return d.strokeWidth
            })
            .attr('stroke', function (d) {
                return d.color
            })
            .attr('class', function () {
            })
            .call(d3.drag()
                .on('drag', nodeDragFunction)
                .on('end', () => {
                    self.updateScript()
                })
            )
            .on('click', (d) => {
                this.unselectAll();
                this.selectNode(this.index.lookup(d))
            });
        this.index.addD3Group(node, 'node');
        this.node = node
    }

    drawLabels(container, labelDragFunction) {
        var self = this;
        var offsetFromTopOfNode = 3;
        var label = container.append('g')
            .attr('class', 'label')
            .selectAll('text')
            .data(this.props.graph.objects)
            .enter()
            .append('text')
            .attr("text-anchor", "middle")
            .attr('x', function (d) {
                return d.x
            })
            .attr('y', function (d) {
                return d.y + offsetFromTopOfNode
            })
            .attr('font-size', function (d) {
                d.text['font-size'] = 10;
                return '10px'
            })
            .text(function (d) {
                return d.name
            })
            .call(d3.drag()
                .on('drag', labelDragFunction)
                .on('end', () => {
                    self.updateScript()
                })
            )
            .on('click', (d) => {
                this.unselectAll();
                this.selectNode(this.index.lookup(d))
            });
        this.label = label;
        this.index.addD3Group(label, 'label');
    }

    getOffsetBetweenEllipses(x1, y1, x2, y2, nodeXRad, nodeYRad, strokeWidth) {
        if (!strokeWidth) {
            strokeWidth = 1
        }
        var adjustedX = x2 - x1;
        var adjustedY = y2 - y1;
        var distBetweenCenters = Math.sqrt(adjustedX ** 2 + adjustedY ** 2);
        var phi = Math.atan2(adjustedY, adjustedX);
        var a = parseFloat(nodeXRad) + Math.round(strokeWidth / 2);
        var b = parseFloat(nodeYRad) + Math.round(strokeWidth / 2);
        var radiusAtPoint = a * b / Math.sqrt(a ** 2 * Math.sin(phi) ** 2 + b ** 2 * Math.cos(phi) ** 2);
        var eRadius = distBetweenCenters - radiusAtPoint - nodeYRad / 4;
        var newX = (eRadius * Math.cos(phi) + x1);
        var newY = (eRadius * Math.sin(phi) + y1);
        return {
            x: newX,
            y: newY
        }
    }

    fitGraphToWorkspace() {
        var self = this;
        var viewRect = document.querySelector('.graph-view')
            .getBoundingClientRect();
        this.index.nodes.forEach(
            function (node) {
                node.data.x = (viewRect.width * 0.95) * (node.data.x / (self.props.graph.maxX));
                node.data.y += (viewRect.height * 0.95) * (node.data.y / (self.props.graph.maxY));
                node.selection
                    .attr('cx', node.data.x)
                    .attr('cy', node.data.y);
            }
        );
    }

    moveGraph(dx = 0, dy = 0) {
        // var styleSheet, graph_rect;
        this.index.nodes.forEach(
            (node) => {
                node.data.x += dx;
                node.data.y += dy;
                node.selection
                    .attr('cx', node.data.x)
                    .attr('cy', node.data.y);
                this.moveLabelToCorrespondingNode(node);
                this.refreshEdgesForNode(node);
            }
        );
    }

    resizeNodesToLabelText() {
        this.index.nodes.forEach(
            (node) => {
                var labelRadius = Math.floor((node.label.dom.getBoundingClientRect().width / 2) + 10);
                node.data.rx = labelRadius;
                node.selection.attr('rx', labelRadius);
            }
        );
    }

    updateScroll() {
        var win = document.querySelector('.graph-view');
        // this.set_zoom_config(null,win.scrollLeft,win.scrollTop);
    }

    applySelectBoxes() {
        var self = this;
        var svg = d3.select('svg');
        //TODO: On select, save rect of selected nodes for more efficient collision detection when dragging
        svg
            .on('mousedown', function () {
                    // don't fire if command is pressed. command unlocks different options
                    if (!(d3.event.metaKey || d3.event.ctrlKey)) {
                        var anchorPt = d3.mouse(this);
                        var processedAnchorPt = [
                            {anchor: {x: anchorPt[0], y: anchorPt[1]}}
                        ];
                        self.unselectAll();
                        svg.append('rect')
                            .attr('rx', 6)
                            .attr('ry', 6)
                            .attr('class', 'selection')
                            .data(processedAnchorPt);
                    }
                }
            )
            .on("mousemove", function () {
                var anchorX, anchorY, currentX, currentY,
                    s = svg.select("rect.selection"),
                    currentPt = d3.mouse(this),
                    e = d3.event;
                e.preventDefault();
                s
                    .attr('x', (d) => {
                        anchorX = d.anchor.x;
                        currentX = currentPt[0];
                        if (currentX > anchorX) {
                            return anchorX
                        } else {
                            return currentX
                        }
                    })
                    .attr('y', (d) => {
                        anchorY = d.anchor.y;
                        currentY = currentPt[1];
                        if (currentY > anchorY) {
                            return anchorY
                        } else {
                            return currentY
                        }
                    })
                    .attr('width', (d) => {
                        anchorX = d.anchor.x;
                        currentX = currentPt[0];
                        return Math.abs(anchorX - currentX)
                    })
                    .attr('height', (d) => {
                        anchorY = d.anchor.y;
                        currentY = currentPt[1];
                        return Math.abs(anchorY - currentY)
                    });
                var selectionBox = document.querySelector('rect.selection');
                if (selectionBox) {
                    var selectionBoxBoundingRect = selectionBox.getBoundingClientRect();
                    var selX1, selY1, selX2, selY2;
                    selX1 = selectionBoxBoundingRect.x;
                    selY1 = selectionBoxBoundingRect.y;
                    selX2 = selX1 + selectionBoxBoundingRect.width;
                    selY2 = selY1 + selectionBoxBoundingRect.height;
                    self.index.nodes.forEach((node) => {
                        var nodeRect = node.dom.getBoundingClientRect();
                        var nodeX1, nodeX2, nodeY1, nodeY2;
                        nodeX1 = nodeRect.x;
                        nodeX2 = nodeX1 + nodeRect.width;
                        nodeY1 = nodeRect.y;
                        nodeY2 = nodeY1 + nodeRect.height;
                        var selUl, selLr, nodeUl, nodeLr;
                        selUl = {x: selX1, y: selY1};
                        selLr = {x: selX2, y: selY2};
                        nodeUl = {x: nodeX1, y: nodeY1};
                        nodeLr = {x: nodeX2, y: nodeY2};
                        if (
                            selLr.x < nodeUl.x ||
                            nodeLr.x < selUl.x ||
                            selLr.y < nodeUl.y ||
                            nodeLr.y < selUl.y

                        ) {
                            self.unselectNode(node)
                        } else {
                            self.selectNode(node)
                        }
                    })

                }
            })
            .on("mouseup", function () {
                // // Remove selection frame
                svg.selectAll("rect.selection").remove();
            })
            .on("mouseout", function () {
                // if mouse enters an area of the screen not belonging to the SVG or one of its child elements
                var toElement = d3.event.toElement;
                if (!toElement ||
                    !(toElement === svg.node() ||
                        ('ownerSVGElement' in toElement && toElement.ownerSVGElement === svg.node()))) {
                    svg.selectAll("rect.selection").remove();
                }
            })
    }

    selectNode(node) {
        this.selected.add(node);
        node.selection.classed('selected', true);
    }

    unselectNode(node) {
        this.selected.delete(node);
        node.selection.classed('selected', false);
    }

    unselectAll() {
        this.index.nodes.forEach(
            (n) => {
                n.selection.classed('selected', false)
            }
        );
        this.selected = new Set()
    }

    correctProjectionLengthsForEllipseSizes() {
        var offsetPt, self;
        self = this;
        this.index.projections.forEach(
            (projection) => {
                offsetPt = self.getOffsetPointsForProjection(projection);
                projection.selection
                    .attr('x2', offsetPt.x)
                    .attr('y2', offsetPt.y)
            }
        )
    }

    getOffsetPointsForProjection(projection) {
        return this.getOffsetBetweenEllipses(
            projection.tailNode.data.x,
            projection.tailNode.data.y,
            projection.headNode.data.x,
            projection.headNode.data.y,
            projection.headNode.data.rx,
            projection.headNode.data.ry,
            projection.headNode.data.strokeWidth)
    }

    getViewportOffset() {
        var viewbox = this.getViewBox(),
            canvasbox = this.getCanvasBoundingBox()
        return {
            x: (canvasbox.width - viewbox.width),
            y: (canvasbox.height - viewbox.height)
        }
    }

    adjustNodeMovement(node, dx, dy) {
        var canvasbox = this.getCanvasBoundingBox(),
            viewportOffset = this.getViewportOffset(),
            wCorrection = viewportOffset.x / 2,
            hCorrection = viewportOffset.y / 2,
            minBoundW = -Math.abs(wCorrection),
            minBoundH = -Math.abs(hCorrection),
            maxBoundW = canvasbox.width - wCorrection,
            maxBoundH = canvasbox.height - hCorrection,
            nodeLeftX = node.data.x - node.data.rx - node.data.strokeWidth / 2,
            nodeTopY = node.data.y - node.data.ry - node.data.strokeWidth / 2,
            nodeRightX = node.data.x + node.data.rx + node.data.strokeWidth / 2,
            nodeBottomY = node.data.y + node.data.ry + node.data.strokeWidth / 2;
        if ((dx < 0) && (nodeLeftX + dx < minBoundW)) {
            dx = minBoundW - nodeLeftX
        } else if ((dx > 0) && (nodeRightX + dx > maxBoundW)) {
            dx = maxBoundW - nodeRightX
        }

        if ((dy < 0) && (nodeTopY + dy < minBoundH)) {
            dy = minBoundH - nodeTopY
        } else if ((dy > 0) && (nodeBottomY + dy > maxBoundH)) {
            dy = maxBoundH - nodeBottomY
        }
        return (
            {
                dx: dx,
                dy: dy,
            }
        );
    };

    nodeMovementWithinCanvasBounds(node, dx, dy) {
        var canvasbox = this.getCanvasBoundingBox(),
            viewportOffset = this.getViewportOffset(),
            wCorrection = viewportOffset.x / 2,
            hCorrection = viewportOffset.y / 2,
            minBoundW = 0 - wCorrection,
            minBoundH = 0 - hCorrection,
            maxBoundW = canvasbox.width - wCorrection,
            maxBoundH = canvasbox.height - hCorrection;
        return (
            {
                x: (node.data.x - node.data.rx - node.data.strokeWidth / 2 + dx >= minBoundW &&
                    node.data.x + node.data.rx + node.data.strokeWidth / 2 + dx <= maxBoundW),
                y: (node.data.y - node.data.ry - node.data.strokeWidth / 2 + dy >= minBoundH &&
                    node.data.y + node.data.ry + node.data.strokeWidth / 2 + dy <= maxBoundH),
            }
        );
    }

    moveNodes(dx, dy) {
        var adjustedMovement;
        var self = this;
        self.selected.forEach(
            (s) => {
                adjustedMovement = self.adjustNodeMovement(s, dx, dy)
                dx = adjustedMovement.dx;
                dy = adjustedMovement.dy;
            }
        );
        self.selected.forEach(
            (s) => {
                self.moveNode(s, dx, dy)
            }
        );
        this.updateScript();
    }

    getViewBox() {
        var svg = document.querySelector('svg'),
            viewBox = svg.getAttribute('viewBox').split(',');
        return {
            minX: parseInt(viewBox[0]),
            minY: parseInt(viewBox[1]),
            width: parseInt(viewBox[2]),
            height: parseInt(viewBox[3])
        }
    }

    commitCanvasSizeToStylesheet() {
        var fullCanvasRect = document.querySelector('.graphview').getBoundingClientRect(),
            xRes = window.innerWidth,
            yRes = window.innerHeight;
        this.stylesheet['Canvas Settings']['Width'] = parseFloat((fullCanvasRect.width / xRes * 100).toFixed(2));
        this.stylesheet['Canvas Settings']['Height'] = parseFloat((fullCanvasRect.height / yRes * 100).toFixed(2));
    }

    commitAllNodesToStylesheet() {
        this.index.nodes.forEach(
            (node) => {
                this.commitNodeToStylesheet(node);
            }
        )
    }

    commitNodeToStylesheet(node) {
        var viewbox = this.getViewBox(),
            viewportOffset = this.getViewportOffset(),
            wCorrection = viewportOffset.x,
            hCorrection = viewportOffset.y;
        this.stylesheet['Graph Settings']['Components']['Nodes'][node.name] =
            {
                'x': +(((node.data.x - node.data.rx - (node.data.strokeWidth * this.scalingFactor / 2) + wCorrection / 2) / (viewbox.width + wCorrection)) * 100).toFixed(2),
                'y': +(((node.data.y - node.data.ry - node.data.strokeWidth * this.scalingFactor / 2 + hCorrection / 2) / (viewbox.height + hCorrection)) * 100).toFixed(2)
            };
    }

    moveNode(node, dx, dy) {
        node.data.x += dx;
        node.data.y += dy;
        node.data.x = +(node.data.x).toFixed(0);
        node.data.y = +(node.data.y).toFixed(0);
        node.selection
            .attr('cx', node.data.x)
            .attr('cy', node.data.y);
        this.commitNodeToStylesheet(node);
        this.moveLabelToCorrespondingNode(node);
        this.refreshEdgesForNode(node);
        this.commitToStylesheetAndUpdateScript()
    }

    dragSelected(origin) {
        var originDragNode = this.index.lookup(origin),
            self = this;
        if (!self.selected.has(originDragNode)) {
            self.unselectAll();
            self.selectNode(originDragNode);
        }
        var dx = d3.event.dx,
            dy = d3.event.dy;
        self.moveNodes(dx, dy);
    }

    moveLabelToCorrespondingNode(node) {
        node.label.selection
            .attr('x', node.data.x)
            .attr('y', node.data.y + node.data.ry / 5);
    }

    genArc(phi1, phi2, innerRad, outerRad) {
        return d3.arc()
            .startAngle(phi1)
            .endAngle(phi2)
            .innerRadius(innerRad)
            .outerRadius(outerRad)()
    }

    calculateCircleCenter(A, B, C) {
        var ax = (A.x + B.x) / 2,
            ay = (A.y + B.y) / 2,
            ux = (A.y - B.y),
            uy = (B.x - A.x),
            bx = (B.x + C.x) / 2,
            by = (B.y + C.y) / 2,
            vx = (B.y - C.y),
            vy = (C.x - B.x),
            dx = ax - bx,
            dy = ay - by,
            vu = vx * uy - vy * ux,
            g = (dx * uy - dy * ux) / vu,
            center = {
                x: bx + g * vx,
                y: by + g * vy
            };
        if (vu == 0)
            return false; // Points are collinear, so no unique solution
        return center;
    }

    refreshEdgesForNode(node) {
        var self, offsetPt, recurrentProjs;
        recurrentProjs = new Set();
        self = this;
        node.efferents.forEach(
            (projection) => {
                offsetPt = self.getOffsetPointsForProjection(projection);
                projection.selection
                    .attr('x1', projection.data.tailNode.x)
                    .attr('y1', projection.data.tailNode.y)
                    .attr('x2', offsetPt.x)
                    .attr('y2', offsetPt.y);
                if (projection.isRecurrent()) {
                    recurrentProjs.add(projection)
                }
            }
        );
        node.afferents.forEach(
            (projection) => {
                offsetPt = self.getOffsetPointsForProjection(projection);
                projection.selection
                    .attr('x2', offsetPt.x)
                    .attr('y2', offsetPt.y);
                if (projection.isRecurrent()) {
                    recurrentProjs.add(projection)
                }
            }
        );
        recurrentProjs.forEach(
            (projection) => {
                var startPhi = -2.5;
                var xrad = projection.headNode.data.rx;
                var yrad = projection.headNode.data.ry;
                var radiusAtPoint = xrad * yrad / Math.sqrt(xrad ** 2 * Math.sin(startPhi) ** 2 + yrad ** 2 * Math.cos(startPhi) ** 2);
                radiusAtPoint += projection.headNode.data.strokeWidth / 2;
                var stpt = {
                    x: radiusAtPoint * Math.cos(startPhi),
                    y: radiusAtPoint * Math.sin(startPhi)
                };
                var endpt = {
                    x: stpt.x,
                    y: stpt.y * -1
                };
                var lftedgeOffset = projection.headNode.dom.getBoundingClientRect().height / 2
                var lftedge = {
                    x: -projection.headNode.data.rx - lftedgeOffset - projection.headNode.data.strokeWidth,
                    y: 0
                };
                var ctpt = this.calculateCircleCenter(stpt, endpt, lftedge);
                var radius = ctpt.x - lftedge.x;
                if (projection.dom.constructor.name === 'SVGPathElement') {
                    var arcStartAngle = Math.atan2(stpt.y - ctpt.y, stpt.x - ctpt.x);
                    var arcEndAngle = Math.atan2(endpt.y - ctpt.y, endpt.x - ctpt.x);
                    var testArc = this.genArc(arcEndAngle, 2 * Math.PI + arcStartAngle, radius, radius)
                    var path = testArc.toString()
                    projection.selection.attr('d', path);
                    projection.selection
                        .attr('transform', `translate(${projection.data.headNode.x + ctpt.x},${projection.data.headNode.y}) rotate(90)`)
                } else {
                    var circ = 2 * Math.PI * radius;
                    var radPerPx = 2 * Math.PI / circ;
                    var adjustment = projection.data.headNode.ry / 4.2;
                    var arcEndAngle = Math.atan2(stpt.y - ctpt.y, stpt.x - ctpt.x) - (radPerPx * adjustment);
                    var x1 = (radius * Math.cos(arcEndAngle - 0.01));
                    var y1 = (radius * Math.sin(arcEndAngle - 0.01));
                    var x2 = (radius * Math.cos(arcEndAngle));
                    var y2 = (radius * Math.sin(arcEndAngle));
                    projection.selection
                        .attr('x1', projection.data.headNode.x + ctpt.x + x1)
                        .attr('y1', projection.data.headNode.y - y1)
                        .attr('x2', projection.data.headNode.x + ctpt.x + x2)
                        .attr('y2', projection.data.headNode.y - y2)
                }
            }
        );
    }

    scrollGraphIntoView() {
        var horizontalOffset, verticalOffset, graphBoundingBox;
        graphBoundingBox = this.getGraphBoundingBox();
        if (graphBoundingBox.x < 0) {
            horizontalOffset = Math.abs(0 - graphBoundingBox.x)
        } else {
            horizontalOffset = 0
        }
        if (graphBoundingBox.y < 0) {
            verticalOffset = Math.abs(0 - graphBoundingBox.y)
        } else {
            verticalOffset = 0
        }
        this.moveGraph(horizontalOffset, verticalOffset)
    }

    scaleGraph(scaleBy) {
        this.scalingFactor *= scaleBy;
        this.validateStylesheet();
        this.stylesheet['Graph Settings']['Scale'] = +(this.scalingFactor).toFixed(2);
        var self = this;
        this.index.nodes.forEach(
            (node) => {
                var cx = node.selection.attr('cx') * scaleBy,
                    cy = node.selection.attr('cy') * scaleBy,
                    rx = node.selection.attr('rx') * scaleBy,
                    ry = node.selection.attr('ry') * scaleBy,
                    strokeWidth = node.selection.attr('stroke-width') * scaleBy,
                    fontSize = node.label.data.text['font-size'] * scaleBy;
                node.data.x = cx;
                node.data.y = cy;
                node.data.rx = rx;
                node.data.ry = ry;
                node.data.strokeWidth = strokeWidth;
                node.selection.attr('cx', cx);
                node.selection.attr('cy', cy);
                node.selection.attr('rx', rx);
                node.selection.attr('ry', ry);
                node.selection.attr('stroke-width', strokeWidth);
                node.label.data.text['font-size'] = fontSize;
                node.label.selection.attr('font-size', fontSize);
                self.moveLabelToCorrespondingNode(node);
                self.refreshEdgesForNode(node);
            }
        );
        this.index.projections.forEach(
            (projection) => {
                var strokeWidth = projection.dom.getAttribute('stroke-width') * scaleBy;
                projection.data.strokeWidth = strokeWidth
                projection.selection.attr('stroke-width', strokeWidth);
            }
        );
    }

    scaleGraphInPlace(scalingFactor) {
        var preScaleGraphRect = document.querySelector('g.container').getBoundingClientRect(),
            preScaleCenterpoint = {
                x: (preScaleGraphRect.x + preScaleGraphRect.width / 2),
                y: (preScaleGraphRect.y + preScaleGraphRect.height / 2)
            };
        this.scaleGraph(scalingFactor);
        var postScaleGraphRect = document.querySelector('g.container').getBoundingClientRect(),
            postScaleCenterpoint = {
                x: (postScaleGraphRect.x + postScaleGraphRect.width / 2),
                y: (postScaleGraphRect.y + postScaleGraphRect.height / 2)
            },
            dx = preScaleCenterpoint.x - postScaleCenterpoint.x,
            dy = preScaleCenterpoint.y - postScaleCenterpoint.y;
        this.moveGraph(dx, dy)
    }

    scaleGraphToFit(proportion) {
        var canvasBoundingBox, graphBoundingBox, targetWidth, targetHeight, scalingFactor;
        this.fillProportion = proportion;
        this.scaleGraph(1);
        canvasBoundingBox = this.getCanvasBoundingBox();
        graphBoundingBox = this.getGraphBoundingBox();
        targetWidth = Math.floor(canvasBoundingBox.width * proportion * .97);
        targetHeight = Math.floor(canvasBoundingBox.height * proportion * .97);
        scalingFactor = Math.min(
            Math.floor(((targetWidth / graphBoundingBox.width) * 100)) / 100,
            Math.floor(((targetHeight / graphBoundingBox.height) * 100)) / 100,
        );
        this.scaleGraph(scalingFactor);
    }

    getCanvasBoundingBox() {
        var canvasRect = document.querySelector('.graph').getBoundingClientRect();
        return canvasRect;
    }

    getGraphBoundingBox() {
        var gContainer, graphRect, canvasRect, x, y, width, height, centerPoint;
        gContainer = document.querySelector('g.container');
        graphRect = gContainer.getBoundingClientRect();
        canvasRect = this.getCanvasBoundingBox()
        x = graphRect.x - canvasRect.x;
        y = graphRect.y - canvasRect.y;
        width = graphRect.width;
        height = graphRect.height;
        centerPoint = {
            x: width / 2 + x,
            y: height / 2 + y
        };
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            centerpoint: centerPoint
        }
    }

    centerGraph() {
        var centerPoint, graphBoundingBox, canvasBoundingBox, verticalOffset, horizontalOffset;
        graphBoundingBox = this.getGraphBoundingBox();
        canvasBoundingBox = this.getCanvasBoundingBox();
        centerPoint = {x: canvasBoundingBox.width / 2, y: canvasBoundingBox.height / 2};
        horizontalOffset = centerPoint.x - graphBoundingBox.centerpoint.x;
        verticalOffset = centerPoint.y - graphBoundingBox.centerpoint.y;
        this.moveGraph(horizontalOffset, verticalOffset)
    }

    setDirtyFlagToFalse() {
        this.flags.dirty = false;
    }

    onZoom() {
        this.flags.dirty = true;
        var d3e = d3.select('svg.graph');
        var win = document.querySelector('.graph-view')
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'mousemove') {
            if (d3.event.sourceEvent.metaKey || d3.event.sourceEvent.ctrlKey) {
                var xscroll = win.scrollLeft - d3.event.sourceEvent.movementX;
                var yscroll = win.scrollTop - d3.event.sourceEvent.movementY;
            } else {
                var xScroll = win.scrollLeft;
                var yScroll = win.scrollTop;
            }
        } else {
            var fullGPre = document.querySelector('svg.graph');
            var fullGBoxPre = fullGPre.getBoundingClientRect();
            var preScaleXProportion = this.mouseOffset.x / fullGBoxPre.width;
            var preScaleYProportion = this.mouseOffset.y / fullGBoxPre.height;
            var newScale = 100 * d3.event.transform.k;
            d3e
                .attr('width', `${newScale}%`)
                .attr('height', `${newScale}%`);
            var fullGPost = document.querySelector('svg.graph');
            var fullGBoxPost = fullGPost.getBoundingClientRect();
            var xScrollOffset = fullGBoxPost.width * preScaleXProportion - this.mouseOffset.x;
            var xScroll = win.scrollLeft + xScrollOffset;
            var yScrollOffset = fullGBoxPost.height * preScaleYProportion - this.mouseOffset.y;
            var yScroll = win.scrollTop + yScrollOffset;
        }
        if (xScroll < 0) {
            xScroll = 0
        }
        ;
        if (yScroll < 0) {
            yScroll = 0
        }
        ;
        win.scrollTo(xScroll, yScroll);
        this.reDimensionViewbox();
        this.setDirtyFlagToFalse();
    }

    getScrollBounds() {
        var win = document.querySelector('.graph-view'),
            xmax = win.scrollWidth - win.clientWidth,
            ymax = win.scrollHeight - win.clientHeight
        return {
            x: xmax,
            y: ymax
        }
    }

    commitZoomToStylesheet() {
        var win = document.querySelector('.graph-view'),
            svg = document.querySelector('svg'),
            k = parseInt(svg.getAttribute('width')),
            scrollBounds = this.getScrollBounds(),
            xScroll = win.scrollLeft,
            xMax = scrollBounds.x,
            xPro = Math.round(xScroll / xMax * 100),
            xPro = isNaN(xPro) ? 0 : xPro,
            yScroll = win.scrollTop,
            yMax = scrollBounds.y,
            yPro = Math.round(yScroll / yMax * 100),
            yPro = isNaN(yPro) ? 0 : yPro,
            // scale = parseFloat((this.scalingFactor/(k/100)).toFixed(2));
            scale = +this.scalingFactor.toFixed(2);
        this.stylesheet['Canvas Settings']['Zoom'] = k;
        this.stylesheet['Graph Settings']['Scale'] = scale;
        this.stylesheet['Canvas Settings']['xScroll'] = xPro;
        this.stylesheet['Canvas Settings']['yScroll'] = yPro;
    }

    applyZoom() {
        var zoom = d3.zoom();
        this.zoom = zoom
            .scaleExtent([1, 3])
            .filter(() => {
                return d3.event.type.includes("mouse")
                    && (
                        d3.event.ctrlKey
                        || d3.event.metaKey
                        || (d3.event.sourceEvent && !d3.event.sourceEvent.type === "wheel")
                    )
            });
        var d3e = d3.select('svg.graph');
        d3e.call(this.zoom
            .on("zoom", this.onZoom)
        );
    }

    bindScrollUpdating() {
        var win = document.querySelector('.graph-view');
        var self = this;
        var delayedExec = function (after, fn) {
            var timer;
            return function () {
                timer && clearTimeout(timer);
                timer = setTimeout(fn, after);
            };
        };
        var scrollStopper = delayedExec(500, function () {
            self.commitToStylesheetAndUpdateScript();
        });
        win.addEventListener('scroll', scrollStopper);
    }

    parseStylesheet() {
        var self, stylesheet;
        self = this;
        self.validateStylesheet();
        self.setCanvasStateFromStylesheet();
    }

    setCanvasStateFromStylesheet() {
        var self = this,
            width = self.stylesheet['Canvas Settings']['Width'],
            height = self.stylesheet['Canvas Settings']['Height'],
            zoom = self.stylesheet['Canvas Settings']['Zoom'],
            win = document.querySelector('.graph-view');
        this.svg.call(this.zoom.scaleTo, zoom / 100);
        self.props.graphSizeFx(width, height, () => {
            self.flags.reloadLoactions = true;
            var scrollBounds = self.getScrollBounds(),
                xScroll = self.stylesheet['Canvas Settings']['xScroll'],
                yScroll = self.stylesheet['Canvas Settings']['yScroll'];
            win.scrollTo(scrollBounds.x * (xScroll / 100), scrollBounds.y * (yScroll / 100));
            self.forceUpdate();
        });
    }

    setNodePositioningFromStylesheet() {
        var self = this,
            stylesheet = self.stylesheet,
            pnlvNode, nodes, cx, cy, scale, zoom;
        if (Object.keys(self.props.graphStyle).length > 0) {
            nodes = Object.keys(stylesheet['Graph Settings']['Components']['Nodes']);
            zoom = stylesheet['Canvas Settings']['Zoom'];
            scale = self.props.graphStyle['Graph Settings']['Scale']
            // *(zoom/100);
            this.scaleGraphInPlace(scale / this.scalingFactor);
            var viewbox = this.getViewBox(),
                viewboxW = viewbox.width,
                viewboxH = viewbox.height,
                viewportOffset = this.getViewportOffset(),
                wCorrection = viewportOffset.x,
                hCorrection = viewportOffset.y;
            nodes.forEach(
                (node) => {
                    pnlvNode = self.index.lookup(node);

                    // if (pnlvNode === null) console.log("null node");

                    cx =
                        stylesheet['Graph Settings']['Components']['Nodes'][node].x * (viewboxW + wCorrection) / 100
                        + pnlvNode.data.rx
                        + pnlvNode.data.strokeWidth / 2
                        - wCorrection / 2;
                    cy =
                        stylesheet['Graph Settings']['Components']['Nodes'][node].y * (viewboxH + hCorrection) / 100
                        + pnlvNode.data.ry
                        + pnlvNode.data.strokeWidth / 2
                        - hCorrection / 2;
                    pnlvNode.data.x = cx;
                    pnlvNode.data.y = cy;
                    pnlvNode.selection
                        .attr('cx', pnlvNode.data.x)
                        .attr('cy', pnlvNode.data.y);
                    self.moveLabelToCorrespondingNode(pnlvNode);
                    self.refreshEdgesForNode(pnlvNode);
                }
            );
        }
    }

    setIndex() {
        this.index = new Index();
        return this.index;
    }

    drawElements() {
        var container = this.createSVG(),
            self = this;
        this.setAspectRatio();
        this.drawProjections(container);
        this.drawNodes(container, (node) => {
            self.dragSelected(node)
        });
        this.drawLabels(container, (label) => {
            self.dragSelected(label)
        });
        this.postProcess();
    }

    reDimensionViewbox() {
        let svg = document.querySelector('svg');
        if (!svg){return};
        let viewBox = svg.getAttribute('viewBox').split(','),
            viewBoxW = parseInt(viewBox[2]),
            viewBoxH = parseInt(viewBox[3]),
            svgW = Math.round(svg.getBoundingClientRect().width),
            svgH = Math.round(svg.getBoundingClientRect().height),
            aspectRatio = this.props.aspectRatio,
            wDifference = svgW - viewBoxW,
            hDifference = svgH - viewBoxH,
            viewBoxWMod,
            viewBoxHMod,
            proportion;
        if (svgW !== viewBoxW || svgH !== viewBoxH) {
            if (wDifference < hDifference) {
                viewBoxWMod = svgW;
                viewBoxHMod = svgW / aspectRatio;
            } else {
                viewBoxHMod = svgH;
                viewBoxWMod = svgH * aspectRatio;
            }
            var wProportion = viewBoxWMod / viewBoxW,
                hProportion = viewBoxHMod / viewBoxH;
            proportion = Math.min(wProportion, hProportion);
            svg.setAttribute('viewBox', [0, 0, viewBoxWMod, viewBoxHMod]);
            this.scaleGraph(proportion);
            this.forceUpdate();
        }
    }

    postProcess() {
        this.validateStylesheet();
        this.resizeNodesToLabelText();
        this.correctProjectionLengthsForEllipseSizes();
        this.scaleGraphToFit(this.fillProportion);
        this.centerGraph();
        this.setAspectRatio();
    }

    setAspectRatio() {
        if (!this.props.aspectRatio){
            store.dispatch(setModelAspectRatio(this.props.size.width / this.props.size.height));
        }
    }

    setGraph() {
        this.setNonReactState();
        this.setIndex();
        this.drawElements();
        // this.parseStylesheet();
        this.setState({mounted: true});
        window.this = this
    }

    render() {
        return (
            <Resizable
                style={style}
                onResize={this.props.onResize}
                onResizeStart={this.props.onResizeStart}
                onResizeStop={this.props.onResizeStop}
                enable={{
                    top: false,
                    right: false,
                    bottom: true,
                    left: true,
                    topRight: false,
                    bottomRight: false,
                    bottomLeft: true,
                    topLeft: false
                }}
                className='graphview'
                defaultSize={
                    this.props.defaultSize
                }
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
                <div className={this.state.class}/>
                <div className={'spinner'}
                     style={
                         {
                             "position": "absolute",
                         }
                     }
                >
                    {
                        this.state.spinnerVisible ?
                            <Spinner
                                className={"graph_loading_spinner"}/> :
                            <div/>
                    }
                </div>
            </Resizable>
        )
    }
}

export default connect(mapStateToProps, {setStyleSheet, setModelAspectRatio})(D3model)
