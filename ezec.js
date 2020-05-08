// #############################################################################
// CHARTING SUPPORT
// #############################################################################
class Axes{
    constructor(fig, settings={}){
        // settings:  x={scale: true}, y={scale: true}, id=null
        // specify the x, and y axes and the figure it belongs to
        this.fig = fig;
        this.x = get(settings, "x", {scale: true});
        this.y = get(settings, "y", {scale: true});
        var autolink = get(settings, "autolink", true);

        // this.name = this.id === null? this.axIndex: id;

        if (autolink === true){
            this.autolink();
        }
    }

    autolink(){
        // link the axes to all the figure section settings automatically
        this.axIndex = this.fig.axes.length;
        this.xAxisIndex = this.fig.options.xAxis.length;
        this.yAxisIndex = this.fig.options.yAxis.length;

        this.fig.axes.push(this);
        this.fig.options.xAxis.push(this.x)
        this.fig.options.yAxis.push(this.y)
    }

    sharex(){
        // Returns a new Axes object that shares the same x axis
        // as this Axes object
        // TODO: need to modify the figure.options.yAxis and fig.axes
        // return new Axes(this.fig, this.x, {});
        // throw "NotImplementedError: sharex() not implemented properly yet";
        var ax = new Axes(this.fig, {autolink: false, x: this.x})
        ax.axIndex = this.fig.axes.length;
        ax.xAxisIndex = this.xAxisIndex;
        ax.yAxisIndex = this.fig.options.yAxis.length;

        ax.fig.axes.push(this);
        ax.fig.options.yAxis.push(this.y)
        return ax;
    }
    sharey(){
        // Returns a new Axes object that shares the same y axis
        // as this Axes object
        // TODO: need to modify the figure.options.xAxis and fig.axes
        // return new Axes(this.fig, {}, this.y);
        throw "NotImplementedError: sharey() not implemented properly yet";
    }
}

class Figure{
    // FIgure object to store settings for figure similar to matplotlib
    constructor() {
        this.options = {
            title: {},
            legend: {},
            tooltip: {},
                // axisPointer: {type: "cross"},
            // },
            toolbox: {},
            dataZoom: [],
            dataset: {},
            grid: null,
            xAxis: [],
            yAxis: [],
            series: [],
        };

        this.axes = [];
        new Axes(this);

    }

    setData(df){
        this.options.dataset.source = df.data;
        this.schema = df.schema;
        // TODO: add a schema to the options.dimensions section like this
        // dimensions: [{name: "date", type: "time"},
        // {name: "cases"},
        // {name:"deaths"},
        // {name:"recovered"}],
    }
}



// #############################################################################
// PLOTS
// #############################################################################
function lineplot(settings){
    /* Creates a lineplot
     * Args:
     *     settings: (obj) requires the following items:
     *               - df dataframe with the data
     *               - x  (str) name of column to use for x axis
     *               - y  (str) name of column to use for y axis
    */
    //  CHECK THE REQUIRED SETTINGS ARE INCLUDED
    if ((settings == null) || (settings === undefined)){
        throw "lineplots requires settings argument"
    }
    var df = getOrThrow(settings, "df");
    var xCol = getOrThrow(settings, "x");
    var yCol = getOrThrow(settings, "y");
    var ax = getOrThrow(settings, "ax");


    // Extract attributes
    var xAxis = ax.x;
    var yAxis = ax.y;
    var xAxisIndex = ax.xAxisIndex;
    var yAxisIndex = ax.yAxisIndex;
    var fig = ax.fig;
    var series = get_or_create(fig.options, "series", []);
    // TODO: check if this same df is already in dataset, or
    //       if it is another dataset
    var dataset = get_or_create(fig.options, "dataset", {source: df.data});

    // map DF schema types to xAxis types
    var dfTypeMapper = {categorical: "category", time: "time", continuous: "value", string: "category"}

    // SET X AND Y TYPE SETTINGS if they dont already exist
    xAxis.type = xAxis.type || get(dfTypeMapper, df.schema[xCol], "value");
    yAxis.type = yAxis.type || get(dfTypeMapper, df.schema[yCol], "value");

    // ADD THE SERIES
    fig.options.series.push({
        type: 'line',
        xAxisIndex: xAxisIndex,
        yAxisIndex: yAxisIndex,
        encode: {x: xCol, y: yCol},
    });
    return ax;
};



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
