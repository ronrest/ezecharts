// #############################################################################
// SUPPORT
// #############################################################################
function get_or_create(obj, key, default_val=null){
    // Gets a value from a object. If it does not exist
    // then assign a default, and return that default
    if (!(key in obj)){
        obj[key] = default_val;
    };
    return obj[key];
};

function get(obj, key, default_val=null){
    // Gets a value from a object if it exists, otherwise returns a
    // default. NOTE: it does not modify the object
    return (key in obj) ? obj[key] : default_val;
};

function getOrThrow(obj, key){
    if (key in obj){ return obj[key]} else {throw "Missing property: " + key};
    // return (key in obj) ? obj[key] : throw "Missing property: " + key;
}



// #############################################################################
// DATAFRAE FUNCTIONS
// #############################################################################
class DF{
    // Initialized in the constructor func
    constructor(data, schema) {
        this.data = data;
        this.schema = schema;
        this.columns = data[0];
        // this.shape = TODO
    }

    colname2idx(colname){
        var idx = this.columns.indexOf(colname);
        if (idx == -1){
            return null;
        } else {
            return idx;
        }
    }

    colnames2idx(colnames){
        var indices;
        colnames.forEach(function(x){
            indices.push(this.colname2idx(x));
        });
    }

    idx2colname(idx){
        return this.columns[idx]
    }

    // TODO: slice by column names, column indices, and multiple
    //       columns at once

}
