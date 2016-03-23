import _ from 'lodash';
import format from 'string-format';
import moment from 'moment';
import util from 'common/utils/util';
import Colors from 'common/utils/colors';
import Cycler from 'common/utils/cycler';

var linescatter = {
    type: 'line',
    allowPointSelect: true,
    lineWidth: 0,
    marker: {
        enabled: true,
        radius: 4,
        lineWidth: 2,
        lineColor: Colors.base,
        fillColor: 'white'
    },
    color: Colors.base,
};

var uplinescatter = _.defaultsDeep(_.cloneDeep(linescatter), {
    marker: {
        symbol: 'triangle'
    }
});

var downlinescatter = _.defaultsDeep(_.cloneDeep(linescatter), {
    marker: {
        symbol: 'triangle-down'
    }
});

class Default extends Cycler {

    constructor() {
        super();

        this.axesOptions = {
            default: {
                allowDecimals: false,
                gridLineWidth: 0.5,
                gridLineColor: Colors.gray_lightest
            },
            zeroline: {
                gridLineWidth: 0,
                plotLines: [{
                    color: Colors.gray_dark,
                    width: 1,
                    value: 0,
                    zIndex: 10
                }]
            },
            compare: {
                _title: [{
                    align: 'high',
                    rotation: 0,
                    offset: 14,
                    style: { color: Colors.base }
                }, null]
            }
        };

        this.seriesOptions = {
            area: {
                type: 'area',
                _color: [Colors.green_light, Colors.primary_alt],
                _negativeColor: [Colors.secondary, Colors.secondary_light]
            },
            column: {
                type: 'column'
            },
            compare: {
                _color: [Colors.cool_blue_light, Colors.green_light]
            },
            ohlc: {
                type: 'ohlc',
                lineWidth: 2,
                color: Colors.secondary,
                upColor: Colors.green_light
            },
            linescatter: linescatter,
            uplinescatter: uplinescatter,
            downlinescatter: downlinescatter,
            candlestick: {
                type: 'candlestick',
                color: Colors.secondary,
                upColor: Colors.green_light
            }
        };

        this.flagOptions = {
            default: {
                shape: 'circlepin',
                width: 16
            },
            mna: {
                shape: 'squarepin',
                width: 24,
                title: 'M&A'
            }
        };
    }

    highchartsOptions(zipped, legend, yAxes) {
        return {
            credits: { enabled : false },
            chart: {
                animation : false,
                events: {
                    redraw: function () {
                        this.tooltip.hide();
                    },
                },
                style: {
                    overflow: 'visible',
                    'z-index': 1
                }
            },
            legend: legend,
            yAxis: yAxes,
            tooltip: {
                hideDelay: 0,
                formatter: function () {
                    var key;
                    if (_.isUndefined(this.series)) {
                        var points = this.points;
                        key = this.points[0].key;
                        var temp = (
                            format('{}<br />', moment(key).format('dddd, MMMM Do YYYY')) +
                            points.map(function (point) {
                                var s = point.series;
                                return format('<span style="color: {}">\u25cf</span> {}: <b>{}</b>',
                                    s.color, s.name, util.parseNum(point.y, point.series.options.variable));
                            }).join('<br />')
                        );
                        return temp
                    } else {
                        key = moment(this.key).format('dddd, MMMM Do YYYY');
                        return format('{}<br />{}', key, this.point.text);
                    }
                }
            },
            exporting: {
                enabled: false,
            },
            series: zipped
        };
    }
};

var _default = new Default();

export default _default;
