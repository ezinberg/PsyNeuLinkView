function randomString(len){
    return Math.random().toString(20).substr(2, len)
}

export function createId(idSet, prefix, len){
    var id = `${prefix}_${randomString(len)}`;
    while (idSet.has(id)){
        id = randomString(len)
    }
    return id;
}