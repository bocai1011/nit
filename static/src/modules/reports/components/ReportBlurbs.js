import { Link } from 'react-router';
import JSXTransformer from 'JSXTransformer';
import Katex from 'common/components/Katex';

const blurbs = {
    'defaultReportBlurb': function () {
        return (
            <div>
                This report doesn't seem to have a summary, we're sorry! You should contact the NEAT dev team and tell them to work harder.
            </div>
        );
    },

    'defaultWidgetBlurb': function () {
        return (
            <div>
                This widget doesn't seem to have a summary, we're sorry! You should contact the NEAT dev team and tell them to work harder.
            </div>
        );
    },
};

var transformBlurb = function(s) {
    console.log('original');
    console.log(s);

    s = s.replace(/(?:\r\n|\r|\n)/g, '<br /><br />');
    s = s.split("\\n").join("<br /><br />");
    s = s.split("<Katex>").join("<Katex>{'");
    s = s.split("</Katex>").join("'}</Katex>");
    s = s.split('\\').join('\\\\');

    s = '<div>' + s + '</div>';

    console.log('pre transform');
    console.log(s);
    var code = JSXTransformer.transform(s).code;
    var result = eval(code);

    return result;
};

/**
 * Helper functions for report level and widget level blurbs.
 * @exports lib\Components\ReportBlurbs
 */
export default {
    getReport: function(title, summary) {
        var body;
        if (summary) {
            body = transformBlurb(summary);
        } else {
            body = blurbs['defaultReportBlurb']();
        }

        return (
            <div>
                <h1>{title}</h1>
                {body}
            </div>
        );
    },

    getWidget: function(title, summary) {
        console.log('getwidget');
        console.log(title);
        console.log(summary);

        var body;
        if (summary) {
            body = transformBlurb(summary);
        } else {
            body = blurbs['defaultWidgetBlurb']();
        }

        return (
            <div>
                <h1>{title}</h1>
                {body}
            </div>
        );
    },
};
