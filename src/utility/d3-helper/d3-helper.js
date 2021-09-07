import * as d3 from "d3";

export class Index {
    constructor() {
        this.obj_lookup = new WeakMap();
        this.str_lookup = {};
        this.elements = new Set();
        this.nodes = new Set();
        this.projections = new Set();
        this.recurrent_projections = new Set();
        this.labels = new Set();
    }

    get_leftmost_node() {
        var min_x, min_node;
        min_x = Number.MAX_SAFE_INTEGER;
        min_node = null;
        this.nodes.forEach(
            (node) => {
                if (node.data.x < min_x) {
                    min_node = node;
                    min_x = node.data.x;
                }
            }
        );
        return min_node;
    }

    get_topmost_node() {
        var min_y, min_node;
        min_y = Number.MAX_SAFE_INTEGER;
        min_node = null;
        this.nodes.forEach(
            (node) => {
                if (node.data.y < min_y) {
                    min_node = node;
                    min_y = node.data.y;
                }
            }
        );
        return min_node;
    }

    addD3Group(d3_group, type) {
        if (!['node', 'label', 'projection'].includes(type)) {
            throw 'must specify group type when adding d3 group to index'
        }
        if (type === 'node') {
            d3_group._groups[0].forEach(
                (n) => {
                    this.add_node(new Node(n))
                }
            );
        } else if (type === 'label') {
            d3_group._groups[0].forEach(
                (l) => {
                    this.add_label(new Label(l))
                }
            );
        }
        else if (type === 'projection') {
            d3_group._groups[0].forEach(
                (p) => {
                    this.add_projection(new Projection(p))
                }
            );
        }
    }

    add_label(label) {
        var pnlv_label, associated_node;
        pnlv_label = label._is_pnlv_obj ? label : new Label(label);
        this.add_to_elements(pnlv_label);
        this.add_to_lookup(pnlv_label);
        associated_node = this.lookup(label.name);
        if (associated_node) {
            associated_node.label = pnlv_label;
            this.node = associated_node;
        }
        this.labels.add(pnlv_label)
    }

    add_node(node) {

        console.log("add_node() added: " + node.name);

        var pnlv_node, afferent, efferent;
        pnlv_node = node._is_pnlv_obj ? node : new Node(node);
        this.add_to_elements(pnlv_node);
        this.add_to_lookup(pnlv_node);
        this.nodes.add(pnlv_node);
        this.projections.forEach(
            (projection)=>{
                if (projection.data.headNode===pnlv_node.data){
                    afferent = this.lookup(projection.data.headNode);
                    projection.headNode = pnlv_node;
                    pnlv_node.afferents.add(projection);
                }
                if (projection.data.tailNode===pnlv_node.data){
                    efferent = this.lookup(projection.data.tailNode);
                    projection.tailNode = pnlv_node;
                    pnlv_node.efferents.add(projection);
                }
            }
        )
    }

    add_projection(projection) {
        var pnlv_projection, head, tail;
        pnlv_projection = projection._is_pnlv_obj ? projection : new Projection(projection);
        this.add_to_elements(pnlv_projection);
        this.add_to_lookup(pnlv_projection);
        head = this.lookup(pnlv_projection.data.headNode);
        if (head){
            pnlv_projection.headNode = head
        }
        tail = this.lookup(pnlv_projection.data.tailNode);
        if (tail){
            pnlv_projection.tailNode = tail
        }
        this.projections.add(pnlv_projection);
        if (pnlv_projection.isRecurrent()){
            this.recurrent_projections.add(pnlv_projection)
        }
    }

    add_to_elements(element) {
        if (!this.elements.has(element)) {
            this.elements.add(element)
        }
    }

    add_to_lookup(element) {
        this.obj_lookup.set(element, element);
        this.obj_lookup.set(element.dom, element);
        this.obj_lookup.set(element.selection, element);
        if (['node', 'projection'].includes(element.element_type)) {
            this.obj_lookup.set(element.data, element);
            this.str_lookup[element.data.name] = element;
        }
    }

    lookup(query) {
        var result;
        if (typeof query === 'string') {
            result = this.str_lookup[query]
        } else {
            result = this.obj_lookup.get(query)
        }
        return result
    }
}

export class GraphElement {
    constructor(svg_element) {
        this.dom = svg_element;
        this.data = svg_element.__data__;
        this.selection = d3.select(this.dom);
        this._is_pnlv_obj = true;
        this.name = this.data.name;
    }
}

export class Node extends GraphElement {
    constructor(svg_element) {
        super(svg_element);
        this.element_type = 'node';
        this.afferents = new Set();
        this.efferents = new Set();
    }
}

export class Label extends GraphElement {
    constructor(svg_element) {
        super(svg_element);
        this.element_type = 'label'
    }
}

export class Projection extends GraphElement {
    constructor(svg_element) {
        super(svg_element);
        this.element_type = 'projection';
        this.headNode = null;
        this.tailNode = null;
    }

    isRecurrent(){
        return this.data.headNode===this.data.tailNode
    }
}

export class Shape {
    constructor() {
    }
}

export class Ellipse extends Shape {
    constructor() {
        super()
    }
}