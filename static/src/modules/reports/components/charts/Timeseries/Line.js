import _ from 'lodash';
import util from 'common/utils/util';
import Colors from 'common/utils/colors';

var Line = {
    highchartsOptions: function(zipped, raw) {
        return {
            chart: { zoomType: 'x' },
            xAxis: {
                offset: 0,
                lineWidth: 1,
                lineColor: Colors.gray_dark,
                gridLineWidth: 1,
                gridLineColor: Colors.gray_warm_light,
                tickColor: Colors.gray_dark,
                tickWidth: 1,
                startOnTick: true,
                endOnTick: true,
                title: {
                    text: util.formatName(raw.pandas.axes.columns.values[0])
                }
            },
            title: {
                text: util.formatName((_.uniq(_.map(zipped, 'variable')).length <= 1) ? zipped[0].variable : '')
            },
            tooltip: {
                borderWidth: 0,
                shadow: false,
                padding: 0,
                positioner: function (w, h, point) {
                    var x = point.plotX - w / 2;

                    if (x < -5) {
                        x = point.plotX - w / 4;

                        if (x < -5) {
                            x = point.plotX;
                        }
                    }

                    return {
                        x: x,
                        y: point.plotY - h - 20
                    };
                }
            }
        };
    }
};

export default Line;
