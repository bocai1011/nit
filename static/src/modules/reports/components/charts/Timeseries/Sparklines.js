import $ from 'jquery';
import _ from 'lodash';

var Sparklines = {
    _onChartLoad: function () {
        var chart = this;

        var previousMin, previousMax, lastMove;

        var currentZoom = function () {
            var vals = chart.xAxis[0].getExtremes();
            return (vals.max - vals.min) / (vals.dataMax - vals.dataMin);
        };

        var extremes = function () {
            return chart.xAxis[0].getExtremes();
        };

        var mouseToVal = function(e){
            var normalized = chart.pointer.normalize(e);
            return chart.xAxis[0].toValue(normalized.chartX);
        };

        $(chart.container).bind('mousewheel', function(e, delta) {
            var vals = extremes();

            var range = vals.dataMax - vals.dataMin;
            var zoom = (vals.max - vals.min) / range;

            var mid = (vals.max + vals.min) / 2;
            var mouseValX = mid;

            if (!_.isUndefined(lastMove)) {
                mouseValX = mouseToVal(lastMove);
            }

            var left = mouseValX - vals.min;
            var right = vals.max - mouseValX;

            if (delta > 0) {
                zoom /= 1.17;
                left /= 1.17;
                right /= 1.17;
            }
            else if (delta < 0) {
                zoom *= 1.17;
                left *= 1.17;
                right *= 1.17;
            }

            // Centered zooming, zoom around the center of the currently visible data.
            //var new_min = Math.max(vals.dataMin, mid - range * zoom / 2);
            //var new_max = Math.min(vals.dataMax, mid + range * zoom / 2);

            // Point zooming, zoom around the location of the mouse.
            var new_min = Math.max(vals.dataMin, mouseValX - left);
            var new_max = Math.min(vals.dataMax, mouseValX + right);

            chart.xAxis[0].setExtremes(new_min, new_max);
            previousMin = undefined;
            previousMax = undefined;

            chart.tooltip.hide();
        });

        $(chart.container).bind('mousemove', function (e) {
            lastMove = e;
        });

        chart.container.addEventListener('dblclick', function(e) {
            var zoom = currentZoom();
            if (zoom < 0.98 || _.isUndefined(previousMin) || _.isUndefined(previousMax)) {
                var vals = extremes();
                previousMin = vals.min;
                previousMax = vals.max;

                chart.zoomOut();
            } else {
                chart.xAxis[0].setExtremes(previousMin, previousMax);
            }

            e.preventDefault();
        }, false);
    },

    highchartsOptions: function() {
        return {
            chart: {
                type: 'area',
                margin: [2, 0, 2, 0],
                skipClone: true,
                width: 120,
                height: 50,
                events: { load: Sparklines._onChartLoad }
            },
            navigator : { enabled : false },
            scrollbar : { enabled : false },
            rangeSelector : { enabled: false },
            xAxis: {
                labels: { enabled : false },
                tickPositions: []
            },
            plotOptions: {
                series: {
                    animation: false,
                    marker: {
                        radius: 1,
                        states: {
                            hover: {
                                radiusPlus: 1
                            }
                        }
                    },
                    fillOpacity: 0.25
                },
                column: {
                    negativeColor: '#910000',
                    borderColor: 'silver'
                }
            }
        };
    }
};

export default Sparklines;
