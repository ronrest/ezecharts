// #############################################################################
// CHARTING SUPPORT
// #############################################################################
class Axes{
    constructor(fig, settings={}){
        // settings:  x={scale: true}, y={scale: true}, id=null
        // specify the x, and y axes and the figure it belongs to
        this.fig = fig;

        this.gridIndex = get(settings, "gridIndex", 0);
        this.x = get(settings, "x", {scale: true, name: ""}); //min:"2020-03-01"
        this.y = get(settings, "y", {scale: true, name: ""});
        var autolink = get(settings, "autolink", true);

        // assign gridIndex
        this.x.gridIndex = this.gridIndex;
        this.y.gridIndex = this.gridIndex;

        this.x.name = get(settings, "xLabel", "");
        this.y.name = get(settings, "yLabel", "");

        var xAxisTick = get_or_create(this.x, "axisTick", {});
        var xAxisLabel = get_or_create(this.x, "axisLabel", {});
        xAxisTick.show = true;
        xAxisTick.inside = true;
        xAxisLabel.show = true;
        xAxisLabel.inside = false;

        var yAxisTick = get_or_create(this.y, "axisTick", {});
        var yAxisLabel = get_or_create(this.y, "axisLabel", {});
        yAxisTick.show = true;
        yAxisTick.inside = true;
        yAxisLabel.show = true;
        yAxisLabel.inside = true;


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
        var ax = new Axes(this.fig, {autolink: false, x: this.x, gridIndex:this.gridIndex})
        ax.axIndex = this.fig.axes.length;
        ax.xAxisIndex = this.xAxisIndex;
        ax.yAxisIndex = this.fig.options.yAxis.length;

        ax.fig.axes.push(ax);
        ax.fig.options.yAxis.push(ax.y);
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
    constructor(settings={}) {
        /*
         * Args:
         *   settings:
         *      - title
         *      - subtitle
         *      - grid: (list of 2 integers)  [nRows, nCols] (default=[1,1])
         *      - figMargins
         *      - gridCellGap
         *
         *      OPTIONAL SETTINGS
         *      - df
        */
        // GRID SETTINGS
        var gridDims = get(settings, "grid", [1,1]);
        var nrows = gridDims[0];
        var ncols = gridDims[1];

        var gridCellGap = get(settings, "gridCellGap", [1,5]);
        var xGridCellGap = gridCellGap[0];
        var yGridCellGap = gridCellGap[1];
        // var yGridCellGap = 1;
        var figMargins = get(settings, "figMargins", {});
        var FIG_LEFT_MARGIN = get(figMargins, "left", 5);
        var FIG_RIGHT_MARGIN = get(figMargins, "right", 2);
        var FIG_TOP_MARGIN = get(figMargins, "top", 12);
        var FIG_BOTTOM_MARGIN = get(figMargins, "bottom", 7);

        var CELL_WIDTH = (100 - FIG_LEFT_MARGIN - FIG_RIGHT_MARGIN - xGridCellGap) / ncols - xGridCellGap;
        var CELL_HEIGHT = (100 - FIG_TOP_MARGIN - FIG_BOTTOM_MARGIN - yGridCellGap) / nrows - yGridCellGap;

        this.syncedAxisRanges = {x: [], y: []};

        this.options = {
            animation: false,
            title: {
                text: null,
                subtext: null,
                left: '0%',
                align: 'right'
            },
            legend: {
                // data: ['a', 'b'],
                left: "right",
                top: "center",
                // bottom: 20,
                orient: "vertical",
                // align: "right",
                // padding: 5
                // itemGap: 0, // Gap between each legend item
                // itemHeight: 5, // height of legend item icon
                // itemWidth: 10, // Width of legend item icon
                // formatter: function(name){return name.toUpperCase()} // format legend item text
            },

            tooltip: {
                axisPointer: {type: "cross", label:{}},
            },
            toolbox: {
               right: "0%",
               top: "0%",
               height: "auto",
               feature: {
                   dataZoom: {
                       // filterMode: "filter",
                       // yAxisIndex: false, // to prevent zooming along y axis
                   },
                   brush: {
                       type: ['lineX', 'lineY', "rect","polygon", "keep", 'clear']
                   },
                   restore: {},
                   saveAsImage: {},
                   tooltip: {},
                   // dataView: {},// to view and edit data
                   // magicType: {type: ['line', 'bar', 'stack', 'tiled']}, // for switching between diferent representations
               }
            },
            brush: {
                xAxisIndex: [],
                yAxisIndex: [],
                // brushLink: 'all';  // link up all cells
                // inBrush: {opacity: 1},
                // outOfBrush: {colorAlpha: 0.1},
            },
            dataZoom: [],
            dataset: {},
            grid: [],
            xAxis: [],
            yAxis: [],
            series: [],
        };

        // TITLE
        this.setTitle(get(settings, "title"), get(settings, "subtitle"));

        var tooltip = get_or_create(this.options, "tooltip", {});
        get_or_create(tooltip, "trigger", 'item');

        // SET AXES
        this.axes = [];
        var cell_count = 0;
        var grid = this.options.grid;
        for (var irow = 0; irow < nrows;  irow++){
            for (var icol = 0; icol < ncols;  icol++){
                cell_count++;
                grid.push({
                    top: FIG_TOP_MARGIN + irow * (CELL_HEIGHT + yGridCellGap) + '%',
                    left: FIG_LEFT_MARGIN + icol * (CELL_WIDTH + xGridCellGap) + '%',
                    width: CELL_WIDTH + '%',
                    height: CELL_HEIGHT + '%',
                    containLabel: false,
                });
                new Axes(this, {gridIndex:cell_count-1});
            };
        };

        // SET DATA
        if (get(settings, "df") != null){
            this.setData(settings.df)
        } else {
            this.df = null;
            this.schema = {};
            // this.options.dataset.source = null;
        }

    }

    setTitle(title, subtitle=null){
        this.options.title.text = title;
        this.options.title.subtext = subtitle;
    }

    setData(df){
        this.df = df;
        this.options.dataset.source = df.data;
        this.schema = df.schema;
        // TODO: add a schema to the options.dimensions section like this
        // dimensions: [{name: "date", type: "time"},
        // {name: "cases"},
        // {name:"deaths"},
        // {name:"recovered"}],
    }

    linkAxisPointers(axIndices, kind="both"){
        /* Link/Sync the axis pointer (eg crosshairs) accross several
           axes cells, by passing a list of axes indices you want to link
           together, and if you want to link "x", "y", or "both" axis.
        */
        var axisPointer = get_or_create(this.options, "axisPointer", {});
        var axisPointerLink = get_or_create(axisPointer, "link", []);
        var axes = this.axes;

        if ((kind === "both") || (kind === "x")){
            var links = [];
            axIndices.forEach(function (item) {
                links.push(axes[item].xAxisIndex);
            });
            axisPointerLink.push({xAxisIndex: links});
        }
        if ((kind === "both") || (kind === "y")){
            var links = [];
            axIndices.forEach(function (item) {
                links.push(axes[item].yAxisIndex);
            });
            axisPointerLink.push({yAxisIndex: links});
        }
    }

    addDataSlider(side="x", settings={}){
        // By defualt, apply to x axis, and all cells
        // side:        "x", "y", or "both"
        // axes:        (array) list of axes indices which the slider will control
        // showSlider:  (bool) show the slider widget? (default=true)
        // xSliderPositionX: x position of x slider from left side
        // xSliderPositionY: y position of x slider from bottom side
        // ySliderPositionX: x position of y slider from left side
        // ySliderPositionY: y position of y slider from bottom side
        var axes = get(settings, "axes", [...Array(this.axes.length).keys()]);
        var showSlider = get(settings, "showSlider", true);
        var xSliderPositionY = get(settings, "xSliderPositionY", "0%");
        var xSliderPositionX = get(settings, "xSliderPositionX", null);
        var ySliderPositionX = get(settings, "ysliderPositionX", "0%");
        var ySliderPositionY = get(settings, "ysliderPositionY", null);
        var dataZoom = get_or_create(this.options, "dataZoom", []);
        var fig = this;

        if ((side === "x") || (side === "both")){
            var axisIndices = [];
            axes.forEach(function (item){
                axisIndices.push(fig.axes[item].xAxisIndex)
            });
            dataZoom.push({type: 'inside', xAxisIndex: axisIndices})
            dataZoom.push({type: 'slider', show: showSlider, xAxisIndex: axisIndices, bottom: xSliderPositionY, left: xSliderPositionX})
        };
        if ((side === "y") || (side === "both")){
            var axisIndices = [];
            axes.forEach(function (item){
                axisIndices.push(fig.axes[item].yAxisIndex)
            });
            dataZoom.push({type: 'inside', yAxisIndex: axisIndices})
            dataZoom.push({type: 'slider', show: showSlider, yAxisIndex: axisIndices, bottom: ySliderPositionY, left: ySliderPositionX})
        }
    }


    syncXrange(indices){
        /* Create flag to Sync up range of values for Axes indices along x axis */
        this._createSyncRangeFlags("x", indices);
    }

    syncYrange(indices){
        /* Create flag to Sync up range of values for Axes indices along y axis */
        this._createSyncRangeFlags("y", indices);
    }

    _createSyncRangeFlags(side, indices){
        /* Create flag to Sync up range of values for Axes indices along desired
         * axis side (x, or y)
         *
         * Args:
         *      side:       (str) "x" or "y"
         *      indices:    (list of ints) indices of the axes objects you want
         *                  synchronize.
         */
        var fig = this;
        var axisIndices = [];
        indices.forEach(function(idx){
            let axisIndexAttribute = side + "AxisIndex"
            axisIndices.push(fig.axes[idx][axisIndexAttribute]);
        })
        this.syncedAxisRanges[side].push(axisIndices);
    }

    _configureSyncedRanges(){
        var directions = ["x","y"];
        var fig = this;
        directions.forEach(function(direction){
            fig._configureSyncedRange(direction);
        })
    }

    _configureSyncedRange(direction){
        // Actually sync up the min and max x values for the axes in this.syncX
        // check each series
        var fig = this;

        fig.syncedAxisRanges[direction].forEach(function(syncedAxes){
            // var syncedAxes = fig.syncedAxisRanges[direction][0];

            // var syncedAxes = fig["sync"+direction.toUpperCase()][0];
            var synced_cols = new Set();


            // if the series is assigned to x axis of interest, then get the column it uses
            // store each column in a set.
            fig.options.series.forEach(function(series_item){
                if (syncedAxes.includes(series_item[direction + "AxisIndex"])){
                    synced_cols.add(series_item.encode[direction])
                };
            })
            // find the min of mins. and max of maxes
            var minVal = null;
            var maxVal = null;
            for (let colname of synced_cols){
                // for each column, find the min value,, and max
                var curMinVal = fig.df.min(colname);
                var curMaxVal = fig.df.max(colname);
                if ((minVal === null) || (curMinVal < minVal)){
                    minVal = curMinVal;
                }
                if ((maxVal === null) || (curMaxVal > maxVal)){
                    maxVal = curMaxVal;
                }
            };

            // Set the xAxis.min property for each axis to be linked
            // xAxis.min
            syncedAxes.forEach(function(axesIndex){
                fig.axes[axesIndex][direction].min = minVal;
                fig.axes[axesIndex][direction].max = maxVal;
            })
        })


    }

    printOptions(){
        console.log(JSON.stringify(this.options, null, 4))
    }

    plot(container_id){
        /* Given an id name of an HTML DIV tag element, it renders the plot
           specified by this figure inside of there.
        */
        var fig = this;

        // SYNCING OF AXIS RANGES IF NEEDED
        fig._configureSyncedRanges();

        // ACTUALLY PLOT
        var chart = echarts.init(document.getElementById(container_id));
        chart.setOption(this.options);
        return chart;
    }
}



// #############################################################################
// GENERIC PLOT FUNCTIONS
// #############################################################################
function genericXYplot(kind, settings){
    /*
     * Args:
     *  kind:
     *
     *  setings:
     *      - x
     *      - y
     *      - ax
     *      - df
     *      - color
     *      -
     *      - pointSize
     *      - showPoints
     *      -
     *      - showXticks
     *      - showYticks
     *      - showXticklabels
     *      - showYticklabels
     *      -
     *      - stepType: when kind is a stepplot
    */
    //  CHECK THE REQUIRED SETTINGS ARE INCLUDED
    if ((settings == null) || (settings === undefined)){
        throw "lineplots requires settings argument"
    }

    // var df = getOrThrow(settings, "df");
    // var kind = get(settings, "kind");
    var xCol = getOrThrow(settings, "x");
    var yCol = getOrThrow(settings, "y");
    var ax = getOrThrow(settings, "ax");
    var fig = ax.fig;

    var showXticks = get(settings, "showXticks", true);
    var showYticks = get(settings, "showYticks", true);
    var showXticklabels = get(settings, "showXticklabels", true);
    var showYticklabels = get(settings, "showYticklabels", true);

    // CHECK TO SEE IF A DATAFRAME SPECIFIC PLOT HAS BEEN PASSED
    // OR IF TO USE THE DEFUALT DATAFRAME IN THE FIGURE
    var df = fig.df;
    var overrideDefaultDF = false;
    if (get(settings, "df", null) !== null){
        df = settings.df;
        overrideDefaultDF = true;
    }


    // Extract attributes
    var xAxis = ax.x;
    var yAxis = ax.y;
    var xAxisIndex = ax.xAxisIndex;
    var yAxisIndex = ax.yAxisIndex;
    var series = get_or_create(fig.options, "series", []);

    // map DF schema types to xAxis types
    var dfTypeMapper = {categorical: "category", time: "time", continuous: "value", string: "category"}

    // SET X AND Y TYPE SETTINGS if they dont already exist
    xAxis.type = xAxis.type || get(dfTypeMapper, df.schema[xCol], "value");
    yAxis.type = yAxis.type || get(dfTypeMapper, df.schema[yCol], "value");

    if (kind.startsWith("step")){
        // valid values: step, step_start, step_middle, step_end
        step = get(settings, "stepType", "end");
        kind = "line";

    } else {
        step = false;
    }

    xAxis.axisLabel.show= showXticklabels;
    yAxis.axisLabel.show= showYticklabels;

    // SERIES SETTINGS
    var seriesSettings = {
        label: {show: false, position: "insideTop"},
        symbolSize: get(settings, "pointSize", 5),
        showSymbol: get(settings, "showPoints", true),
        visualMap: [],
        type: kind,
        step: step,
        clip: true,
        xAxisIndex: xAxisIndex,
        yAxisIndex: yAxisIndex,
        encode: {x: xCol, y: yCol, seriesName: yCol},
    };

    // Override default dataframe
    if (overrideDefaultDF){
        console.log("overiding figure's default dataframe");
        seriesSettings.dimensions = df.columns;
        seriesSettings.data = df.data;
    }

    // Aesthetics Settings
    if ("color" in settings){
        let lineStyle = get_or_create(seriesSettings, "lineStyle", {});
        let itemStyle = get_or_create(seriesSettings, "itemStyle", {});
        lineStyle.color = settings.color;
        itemStyle.color = settings.color;
    }

    // Force symbol to not be visible if size is 0
    if (seriesSettings.symbolSize === 0){
        seriesSettings.showSymbol = false;
    }

    // ADD THE SERIES
    fig.options.series.push(seriesSettings);
    return fig.options;
}


function genericUnivariatePlot(kind, settings){
    /*
     * Args:
     *  kind: (str) "hist"
     *  setings:
     *      - x
     *      - y
     *      - ax
     *      - df
     *      - color
     *      - symbolSize
     *      -
     *      - showXticks
     *      - showYticks
     *      - showXticklabels
     *      - showYticklabels
     *
     */
    //  CHECK THE REQUIRED SETTINGS ARE INCLUDED
    if ((settings == null) || (settings === undefined)){
        throw "genericUnivariate requires settings argument"
    }

    // var df = getOrThrow(settings, "df");
    var xCol = getOrThrow(settings, "x");
    var ax = getOrThrow(settings, "ax");

    var showXticks = get(settings, "showXticks", true);
    var showYticks = get(settings, "showYticks", true);
    var showXticklabels = get(settings, "showXticklabels", true);
    var showYticklabels = get(settings, "showYticklabels", true);

    // Extract attributes
    var fig = ax.fig;
    var df = fig.df;
    var xAxis = ax.x;
    var yAxis = ax.y;
    var xAxisIndex = ax.xAxisIndex;
    var yAxisIndex = ax.yAxisIndex;
    var series = get_or_create(fig.options, "series", []);

    // map DF schema types to xAxis types
    var dfTypeMapper = {categorical: "category", time: "time", continuous: "value", string: "category"}

    // SET X AND Y TYPE SETTINGS if they dont already exist
    xAxis.type = xAxis.type || get(dfTypeMapper, df.schema[xCol], "value");
    // yAxis.type = yAxis.type || get(dfTypeMapper, df.schema[yCol], "value");

    // var kind = "hist";
    var step = false;

    if (kind === "hist"){
        kind = "custom";
        var plotConfig = hist_config(df, xCol, settings=settings);
        var seriesName = xCol;
        yAxis.scale = false; // Make y axis start at 0 for histograms
    } else {
        throw "only supports kind of hist at the moment"

    }


    xAxis.axisLabel.show= showXticklabels;
    yAxis.axisLabel.show= showYticklabels;

    // SERIES SETTINGS
    var seriesSettings = {
        type: kind,
        label: {show: plotConfig.showItemLabel, position: "insideTop"},
        renderItem: plotConfig.renderItem,
        step: step,
        clip: true,
        data: plotConfig.data,
        xAxisIndex: xAxisIndex,
        yAxisIndex: yAxisIndex,
        encode: {x: plotConfig.encodeX, y: plotConfig.encodeY, seriesName: seriesName, tooltip: plotConfig.encodeTooltip, label: plotConfig.encodeLabel},
    }

    // Aesthetics Settings
    if ("color" in settings){
        console.log(settings);
        let lineStyle = get_or_create(seriesSettings, "lineStyle", {});
        let itemStyle = get_or_create(seriesSettings, "itemStyle", {});
        console.log(seriesSettings);
        lineStyle.color = settings.color;
        itemStyle.color = settings.color;
    }

    // ADD THE SERIES
    fig.options.series.push(seriesSettings);
    return fig.options;
}



function hist_config(df, colname, settings={}){
    /*
     * binMethod: (str) one of squareRoot, scott, freedmanDiaconis, sturges
     * showItemLabel: (bool) show the labels for each of the bars?
     * TOOD: option to manually set the number of bins
     *
    */

    var values = df.getColumn(colname, {includeHeader:false});

    // CREATE BINS
    var binMethod = get(settings, "binMethod", "squareRoot");
    var showItemLabel = get(settings, "showItemLabel", false);
    var bins = ecStat.histogram(values, binMethod);

    // FORMAT THE BINS INTO ARRAY OF ARRAYS LIKE [bin_left, bin_right, amount]
    var interval;
    var min = Infinity;
    var max = -Infinity;
    var histogram_data = echarts.util.map(bins.data, function (item, index) {
        var x0 = bins.bins[index].x0;
        var x1 = bins.bins[index].x1;
        interval = x1 - x0;
        min = Math.min(min, x0);
        max = Math.max(max, x1);
        return [x0, x1, item[1]];
    });

    // CUSTOM FUNCTION TO RENDER THE HISTOGRAM BARS
    function histogramRenderBar(params, api) {
        var yValue = api.value(2);
        var start = api.coord([api.value(0), yValue]);
        var size = api.size([api.value(1) - api.value(0), yValue]);
        var style = api.style();

        return {
            type: 'rect',
            shape: {
                x: start[0] + 1,
                y: start[1],
                width: size[0] - 2,
                height: size[1]
            },
            style: style
        };
    }

    var config = {
        renderItem: histogramRenderBar,
        min: min,
        max: max,
        data: histogram_data,

        encodeX: [0,1],
        encodeY: 2,
        encodeTooltip: 2,
        encodeLabel: 2,
        showItemLabel: showItemLabel,

    };
    return config;
}



// #############################################################################
// HIGH LEVEL PLOT FUNCTIONS
// #############################################################################
function lineplot(settings){
    /* Creates a lineplot
     * Args:
     *     settings: (obj) requires the following items:
     *               - ax: Axes object to put the plot into.
     *               - x  (str) name of column to use for x axis
     *               - y  (str) name of column to use for y axis
     *
     *               optional settings
     *               - df
     *               - pointSize
     *               - showPoints
     *               - color
    */
    // make the lineplot scalable by default by not showing the points,
    // (which slow things down)
    get_or_create(settings, "pointSize", 0);
    genericXYplot("line", settings)
};


function scatterplot(settings){
    /* Creates a scatterplot
     * Args:
     *     settings: (obj) requires the following items:
     *               - ax: Axes object to put the plot into.
     *               - x  (str) name of column to use for x axis
     *               - y  (str) name of column to use for y axis
     *               - pointSize  (num) suze of the points
    */
    get_or_create(settings, "pointSize", 5);
    genericXYplot("scatter", settings)
};

function stepplot(settings){
    /* Creates a stepplot
     * Args:
     *     settings: (obj) requires the following items:
     *               - stepType: (str)(default = "end") "start", "end", "middle"
     *               - ax: Axes object to put the plot into.
     *               - x  (str) name of column to use for x axis
     *               - y  (str) name of column to use for y axis
    */
    // TODO: check that stepType is a legal value

    // make the stepplot scalable by default by not showing the points,
    // (which slow things down)
    get_or_create(settings, "pointSize", 0);
    genericXYplot("step", settings)
};

function barplot(settings){
    /* Creates a barplot
     * Args:
     *     settings: (obj) requires the following items:
     *               - ax: Axes object to put the plot into.
     *               - x  (str) name of column to use for x axis
     *               - y  (str) name of column to use for y axis
    */
    genericXYplot("bar", settings)
};

function histogram(settings){
    /* Creates a histogram
     * Args:
     *     settings: (obj) requires the following items:
     *              - ax: Axes object to put the plot into.
     *              - x  (str) name of column contianing data you want to plot
     *              - binMethod: (str) one of squareRoot, scott, freedmanDiaconis, sturges
     *              - showItemLabel: (bool) show the labels for each of the bars?
     *
     * TODO: option to manually set the number of bins
    */
    get_or_create(settings, "binMethod", "squareRoot");
    genericUnivariatePlot("hist", settings);
};



function heatmap(settings){
    /* Creates a heatmap
     * Args:
     *     settings: (obj) requires the following items:
     *              - ax: Axes object to put the plot into.
     *              -
     * BUG: includes header column when a df is passed.
    */
    var options = genericXYplot("heatmap", settings);
    options.visualMap = [{min: 0, max: 20, show: false}];
    return options;


    // // data = settings.df.data;
    //
    // var data = [
    //     ["a",0,20],
    //     ["b",0,10],
    //     ["c",0,5],
    //
    //     ["a",1,0],
    //     ["b",1,3],
    //     ["c",1,15],
    // ];
    // var xLabels = ["a","b","c"];
    // var yLabels = [1,2];
    //
    // // RELEVANT ECHARS DOCS: https://echarts.apache.org/en/option.html#series-heatmap
    // option = {
    //     tooltip: {
    //         position: 'top'
    //     },
    //     animation: false,
    //     grid: {
    //         height: '50%',
    //         top: '10%'
    //     },
    //     xAxis: {
    //         type: 'category',
    //         data: xLabels,
    //         splitArea: {
    //             show: true
    //         }
    //     },
    //     yAxis: {
    //         type: 'category',
    //         data: yLabels,
    //         splitArea: {
    //             show: true
    //         }
    //     },
    //     visualMap: [{min: 0, max: 20, show: false}]
    //     // {
    //         // min: 100,
    //         // max: 200,
    //         // calculable: true,
    //         // orient: 'horizontal',
    //         // left: 'center',
    //         // bottom: '15%'
    //     // },
    //     ,
    //     series: [{
    //         name: '',
    //         type: 'heatmap',
    //         data: data,
    //         label: {
    //             show: true
    //         },
    //         // encode: {x: 0, y: 1},
    //         // emphasis: {
    //         //     itemStyle: {
    //         //         shadowBlur: 10,
    //         //         shadowColor: 'rgba(0, 0, 0, 0.5)'
    //         //     }
    //         // }
    //     }]
    // };
    //
    // var myChart = echarts.init(document.getElementById('mychart'));
    // myChart.setOption(option);

};




function scatterMatrix(df, settings={}){
    /*
     * Args:
     *    df: dataframe
     *    settings: object
     *      cols: (str) columns to use
     *      showXticks
     *      showYticks
     *      showXticklabels
     *      symbolSize
     *
     *
    */
    var colnames = get(settings, "cols", df.columns);
    var nCols = colnames.length;
    var fig = new Figure({grid: [nCols, nCols], gridCellGap: [1,1]});
    fig.setData(df);

    var axes = fig.axes;
    var showXticks = get(settings, "showXticks", false);
    var showYticks = get(settings, "showYticks", false);
    var showXticklabels = get(settings, "showXticklabels", true);
    var showYticklabels = get(settings, "showYticklabels", true);
    var symbolSize = get(settings, "symbolSize", 4);


    // ------------------------------------------
    // LOWER TRIANGLE
    // ------------------------------------------
    var linkedCellsX = new Array(nCols);
    linkedCellsX = linkedCellsX.fill(0).map(function(){return []});
    for (let irow=0; irow<nCols; irow++){
        var linkedCellsY = [];
        for (let icol=0; icol<nCols; icol++){
            var cellIdx = irow*nCols + icol;
            var cell = fig.axes[cellIdx];
            linkedCellsX[icol].push(cellIdx)
            if (icol >= irow){
                continue;
            }

            linkedCellsY.push(cellIdx)

            // SET THE TICKS AND AXIS LABELS
            cell.y.axisLabel.show= (icol === 0) && (showYticklabels);
            cell.x.axisLabel.show= (irow === nCols-1) && (showXticklabels);


            // cell.x.axisPointer.show = false;
            // cell.x.axisPointer = {show: false};
            if (icol === 0){
                cell.y.name = colnames[irow];
                cell.y.nameLocation = "middle";

            }
            if (irow === nCols-1){
                cell.x.axisLabel.inside = false;
                cell.x.name = colnames[icol];
                cell.x.nameLocation = "middle";
            }

            // TODO: SHOW HOVER OF X,Y VALUES ONLY ALONG THE EDGES OF THE FIGURE
            fig.options.tooltip.axisPointer.label.show = false;
            // var showTooltipTickHover = false;
            // var xAxisTooltip = get_or_create(cell.x, "tooltip", {});
            // var tooltipAxisPointer = get_or_create(xAxisTooltip, "axisPointer", {type: 'cross', label:{show: showTooltipTickHover}});
            // get_or_create(ax.x.tooltip.axisPointer.label.show, {type: 'cross', label:{show: showTooltipTickHover}});

            // ACTUALLY DO SCATTERPLOT
            var col1 = colnames[icol];
            var col2 = colnames[irow];
            scatterplot({ax: cell, x: col1, y: col2, symbolSize: 5});
        }
        fig.linkAxisPointers(linkedCellsY, kind="y");
    }
    console.log(linkedCellsX)
    linkedCellsX.forEach(function(cells){
        console.log(cells);
        // fig.syncXrange(cells);  // TODO: sync x Range of diagonal items without clipping final bar in histogram
        fig.linkAxisPointers(cells, kind="x");
    })
    // scatterplot({ax: fig.axes[0], x: "feat1", y: "feat2"});


    // ------------------------------------------
    // DIAGONAL
    // ------------------------------------------
    for (let i=0; i<nCols; i++){
        var col = colnames[i];
        var cell = fig.axes[i * nCols + i];
        // var showXticklabels = false;
        // var showYticklabels = false;
        histogram({ax: cell, x: col, showItemLabel: false, showXticklabels: false, showYticklabels:false});
        cell.y.axisLabel.show= (i === 0) && (showYticklabels);
        cell.x.axisLabel.show= (i === nCols-1) && (showXticklabels);
    }


    // ------------------------------------------
    // UPPER TRIANGLE
    // ------------------------------------------
    // HEATMAP

    return fig;
}


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
// function sliceDF(df, cols){
//     // Given tabular data as a list of lists, with first row
//     // containing column names, and a list of column names to
//     // extract, it returns just those columns from the data
//     var colnames = df[0]; // column names in original data
//     var colname2id = colnames.reduce((total, x, i) => Object.assign(total, {[x]: i}), {});
//
//     var colIds = cols.map(x => colname2id[x]); // ids of desired cols
//     return df.map(x => colIds.map(i => x[i]))
// };

// function getDFcolumn(df, col, include_header=true){
//     // Given tabular data as a list of lists, with first row
//     // containing column names, column name to extract, it
//     // returns just that row as a flat list
//     // Optionally you can exclude the header label
//     var colnames = df[0]; // column names in original data
//     var colname2id = colnames.reduce((total, x, i) => Object.assign(total, {[x]: i}), {});
//
//     var colId = colname2id[col]; // id of desired col
//     var output = df.map(x => x[colId]);
//     if (include_header){
//         return output;
//     } else {
//         return output.slice(1);
//     }
// };
//
// function getUniqueValsInColumn(df, col, numerical=false){
//     // gets unique values in column, and tries to sort them in order
//     // set numerical=true to sort them properly as numbers
//     // if the values in column are numerical
//     var x = getDFcolumn(df=df, col=col, include_header=false);
//     x = Array.from(new Set(x));
//
//     if (numerical){
//         x.sort(function(a, b){return a - b});
//     }else{
//         x.sort();
//     };
//     return x
// };


class DF{
    // Initialized in the constructor func
    constructor(data, schema) {
        this.data = data;
        this.schema = schema;
        this.columns = data[0];
        // this.shape = TODO
    }

    shape(){
        return [this.data.length, this.data[0].length];
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

    getColumn(colname, settings={}){
        /* Gets one column frm te dataframe as an array.
         * Optionally you can include the column name in settings option
         * `includeHeader`, setting it to true
         * TODO: make use of the preserveShape setting
        */
        var colId = this.colname2idx(colname);
        var includeHeader = get(settings, "includeHeader", false);
        var preserveShape = get(settings, "preserveShape", false);

        var output = this.data.map(x => x[colId]);
        if (includeHeader){
            return output;
        } else {
            return output.slice(1);
        }
    }

    min(colname){
        // Get the min value of a column
        // TODO: fix this for date types, it returns min as an integer,
        //  not the date string
        var x = this.getColumn(colname, {includeHeader:false});
        var dtype = this.schema[colname];

        if (dtype === "time"){
            x = x.map(xx => new Date(xx));
            // return x;
        };
        return Math.min(...x);
    }
    max(colname){
        // Get the min value of a column
        // TODO: fix this for date types, it returns min as an integer,
        //  not the date string
        var x = this.getColumn(colname, {includeHeader:false});
        var dtype = this.schema[colname];

        if (dtype === "time"){
            x = x.map(xx => new Date(xx));
            // return x;
        };
        return Math.max(...x);
    }

    // TODO: slice by column names, column indices, and multiple
    //       columns at once

}
