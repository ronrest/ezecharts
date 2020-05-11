# Docs

# Figure class

**settings**

```python
# OPTIONAL SETTINGS
grid:           [nrows, ncols] (default=[1,5])
gridCellGap:    [xgap, ygap]
figMargins:     {left: 5, right: 2, top: 12, bottom: 7}
```


```python
# METHODS
linkAxisPointers(axIndices, kind="both")

    axIndices:  (list of ints) indices of axes you want to link up
    kind:       (str) "x", "y", or "both"
                link up just a single axis, or both




fig.addDataSlider(side, settings)
    Add a slider that allows you to zoom in to a portion of the data along the
    x or y axis.
    By defualt, apply an x axis slider that is synced to all cells

    side:       (str) "x", "y", "both". which axis to use a slider for.
    settings:   (obj)
        axes:        (array) list of axes indices which the slider will control
        showSlider:  (bool) show the slider widget? (default=true)
        xSliderPositionX: x position of x slider from left side
        xSliderPositionY: y position of x slider from bottom side
        ySliderPositionX: x position of y slider from left side
        ySliderPositionY: y position of y slider from bottom side
```



# Axes class


```python
fig:        Figure object to assign the axes to
settings:

# OPTIONAL SETTINGS
gridIndex:  (int) which grid cell to assign the axes to
autolink:   (bool) (defualt=true) should it automatically link the axes object to
            all the relevant figure settings?
x:          {} xAxis object to pass to echarts options object
y:          {} xAxis object to pass to echarts options object
xLabel:     (str) label to use for x axis
yLabel:     (str) label to use for y axis


```
