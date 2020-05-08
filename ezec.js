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
function sliceDF(df, cols){
    // Given tabular data as a list of lists, with first row
    // containing column names, and a list of column names to
    // extract, it returns just those columns from the data
    var colnames = df[0]; // column names in original data
    var colname2id = colnames.reduce((total, x, i) => Object.assign(total, {[x]: i}), {});

    var colIds = cols.map(x => colname2id[x]); // ids of desired cols
    return df.map(x => colIds.map(i => x[i]))
};

function getDFcolumn(df, col, include_header=true){
    // Given tabular data as a list of lists, with first row
    // containing column names, column name to extract, it
    // returns just that row as a flat list
    // Optionally you can exclude the header label
    var colnames = df[0]; // column names in original data
    var colname2id = colnames.reduce((total, x, i) => Object.assign(total, {[x]: i}), {});

    var colId = colname2id[col]; // id of desired col
    var output = df.map(x => x[colId]);
    if (include_header){
        return output;
    } else {
        return output.slice(1);
    }
};

function getUniqueValsInColumn(df, col, numerical=false){
    // gets unique values in column, and tries to sort them in order
    // set numerical=true to sort them properly as numbers
    // if the values in column are numerical
    var x = getDFcolumn(df=df, col=col, include_header=false);
    x = Array.from(new Set(x));

    if (numerical){
        x.sort(function(a, b){return a - b});
    }else{
        x.sort();
    };
    return x
};


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
