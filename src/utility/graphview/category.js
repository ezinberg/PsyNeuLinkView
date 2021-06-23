const ent = require('entry');

class Category extends ent.Entry{
    constructor(name, parent=null, explicit=false, rank=Number.MIN_SAFE_INTEGER){
        super(name, parent, explicit, rank);
        this.parent = parent;
        this.children = [];
    }
    add_child(child){
        if (!(child instanceof Category)) {
            throw "Can only add a child to a Category that is itself a Category"
        }
        var children_set = new Set(this.children);
        if (!(children_set.has(child))){
            children_set.add(child)
        }
    }

    get_parent(){
        return this.parent
    }

    get_root(){
        var parent = this.get_parent(),
            root;
        if (parent){
            root = parent.get_root()
        }
        else {
            root = this;
        }
        return root
    }
}

exports.Category = Category