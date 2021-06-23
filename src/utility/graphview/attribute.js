const cat = require('category');

class Attribute extends cat.Category{
    constructor(name, value, parent, explicit=false, rank=Number.MIN_SAFE_INTEGER){
        super(name,parent,explicit,rank);
        this.name = name;
        this.value = value;
        this.explicit = explicit;
        this.rank = rank;
    }

    add_child(){
        throw "Attributes are only valid as the bottom node of an Entry graph."
    }
}

exports.Attribute = Attribute;