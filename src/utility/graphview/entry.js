class Entry{
    constructor(name, parent=null, explicit=false, rank=Number.MIN_SAFE_INTEGER){
        this.name = name;
        this.explicit = explicit;
        this.rank = rank;
    }

    get_map(){
        return {[this.name]:this}
    }
}

exports.Entry = Entry;