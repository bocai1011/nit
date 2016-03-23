import Highcharts from 'highcharts/highstock';
import Colors from 'common/utils/colors';
import Cycler from 'common/utils/cycler';

var colors = [
    Colors.primary,
    Colors.green,
    Colors.secondary,
    Colors.gold,
    Colors.primary_alt,
    Colors.green_lighter,
    Colors.secondary_light,
    Colors.gold_lighter,
    Colors.visited
];

Highcharts.theme = {
    colors: colors,
    title: {
        style: {
            color: Colors.base,
            font: 'bold 16px "Source Sans Pro", Helvetica, sans-serif'
        }
    },
    subtitle: {
        style: {
            color: Colors.base,
            font: 'bold 12px "Source Sans Pro", Helvetica, sans-serif'
        }
    },

    legend: {
        itemStyle: {
            font: '9pt "Source Sans Pro", Helvetica, sans-serif',
            color: Colors.base
        },
        itemHoverStyle:{
            color: Colors.gray
        }
    }
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);

class HighchartsCycler extends Cycler {
    constructor() {
        super();
        this.theme = {
            _color: colors
        };
    }
}

export default HighchartsCycler;
