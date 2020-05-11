# Docs

# Figure class

**settings**

```python
# OPTIONAL SETTINGS
grid:           [nrows, ncols] (default=[1,5])
gridCellGap:    [xgap, ygap]
figMargins:     {left: 5, right: 2, top: 12, bottom: 7}

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
