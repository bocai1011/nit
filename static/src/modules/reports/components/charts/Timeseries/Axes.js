import _ from 'lodash';
import util from 'common/utils/util';
import Colors from 'common/utils/colors';
import Default from 'reports/components/charts/Timeseries/Default';
import HighchartsCycler from 'common/utils/highcharts';

/**
 * Return an array of numbers, which map series indices to yAxes indices.
 * Modifies the series parameter such that items are resorted to match
 * the order of their axes.
 */
export function _mapSeriesToAxes(series, idGroups) {
    // handle no ids being provided
    if (idGroups.length === 0) {
        return _.range(0, series.length, 0);
    }

    var axesIndices = [];
    var unmapped = _.clone(series);

    /**
     * We want to keep the series array intact as we want to modify the series
     * order for the caller. To that end we clear out the contents of the array
     * using splice.
     */
    series.splice(0, series.length);

    _.forEach(idGroups, function(idGroup, axesIndex) {
        _.forEach(idGroup, function(id) {
            // find the series object based on the id property
            _.forEach(_.clone(unmapped), function(_seriesitem) {
                if (_seriesitem.id === id) {
                    _.remove(unmapped, _seriesitem);
                    series.push(_seriesitem);
                    axesIndices.push(axesIndex);
                }
            });

        });
    });

    // handle unmapped series by adding to 1st axis
    while (unmapped.length > 0) {
        series.unshift(unmapped.shift());
        axesIndices.unshift(0);
    }

    return axesIndices;
}

/**
 * Create and return an individual Axis highcharts configuration object
 */
export function _buildAxis(seriesItem, axesOptions,
    top, height, offset, isOnly, highchartsCycler) {

    var axis = {
        offset: offset,
        top: top+'%',
        height: height+'%'
    };

    if (offset === 0) {
        _.assign(axis, {
            lineWidth: 1,
            lineColor: Colors.gray_dark,
            tickColor: Colors.gray_dark,
            tickWidth: 1,
            tickLength: 5
        });
    }

    //
    // defaultsDeep

    var optsArr = ['default'];

    if (_.isArray(axesOptions)) {
        optsArr = axesOptions;
    }

    axis = Default.buildOptions(axis, optsArr, 'axesOptions');

    //
    // pick color to use

    var color = highchartsCycler.get('theme').color;

    if (!_.isUndefined(seriesItem.color)) {
        color = seriesItem.color;
    } else {
        seriesItem.color = color;
    }

    //
    // set title and labels if not already set
    var titleColor = color;
    if (isOnly) {
        titleColor = Colors.base;
    }

    axis = _.defaultsDeep(axis, {
        title: {
            text: util.formatName(seriesItem.variable),
            style: { color: titleColor }
        },
        labels: {
            align: 'left',
            style: { color: color }
        }
    });

    return axis;
}

/**
 * Builds the axes array for the highcharts configuration.
 * @param {array} series - Array of series objects, the ordering in the array
 *   can be modified, as well as the individual series elements within
 * @param {object} props - React props
 * @returns {array} - array of axes objects for highcharts
 */
export function buildAxes(series, props) {
    var highchartsCycler = new HighchartsCycler();
    var axesConfig = props.axesConfig || [];
    var axesIds = _.map(axesConfig, function(configItem) {
        /**
         * If user configured a partial sharing of axes between series we
         * sort the ids so that shared ids are first in the list. This is
         * a simple way to support partial sharing and assumed there is only
         * one subset of series that can share an axis. Otherwise we'd need to
         * maintain mappings of each subset and their respective axes.
         */
        if (_.isArray(configItem.isShared)) {
            return _.concat(configItem.isShared,
                _.difference(configItem.ids, configItem.isShared));
        }

        return configItem.ids;
    });
    var axesIndices = _mapSeriesToAxes(series, axesIds);
    var axesHeights = _.map(axesConfig, 'height');
    if (axesHeights.length === 0) {
        axesHeights = [100];
    }
    var axesTops = util.accumulate(axesHeights);

    while (axesConfig.length < axesHeights.length) {
        axesConfig.push({});
    }

    var axes = [];
    var groupHasAxis = _.range(0, axesHeights.length, false);
    var offsets = _.range(0, axesHeights.length, 0);
    var seriesCntByAxis = _.countBy(axesIndices);

    _.forEach(series, function(seriesItem, i) {
        var axesIndex = axesIndices[i];
        var _axesConfig = axesConfig[axesIndex];
        var isLast = (axesIndex === axesHeights.length-1);

        //
        // check sharing of y axis

        var isShared = false;

        if (_.isBoolean(_axesConfig.isShared)) {
            isShared = _axesConfig.isShared;
        } else if (_.isArray(_axesConfig.isShared)) {
            isShared = _.includes(_axesConfig.isShared, seriesItem.id);
        }

        if (props.shared_y === true) {
            isShared = props.shared_y;
        }

        if (!isShared || !groupHasAxis[axesIndex]) {
            var top = axesTops[axesIndex];
            var height = axesHeights[axesIndex] - (isLast?0:5);
            var isOnly = (seriesCntByAxis[axesIndex]===1);

            // get current offset and increment for next series
            var offset = offsets[axesIndex];

            // flag series dont take up any space in series title
            if (seriesItem.type !== 'flags') {
                offsets[axesIndex] += 70;
            }

            var axis = _buildAxis(seriesItem, _axesConfig.axesOptions,
                top, height, offset, isOnly, highchartsCycler);

            groupHasAxis[axesIndex] = true;
            axes.push(axis);
        }

        seriesItem.yAxis = axes.length-1;
    });

    return axes;
}
