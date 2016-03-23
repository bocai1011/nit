import React from 'react';
import { Label, Glyphicon } from 'react-bootstrap';
import AppButtons from 'common/components/AppButtons';

/**
 * Component for rendering a button reference.
 * Use this in text descriptions when you want to refer
 * to a button in the application.
 * @component
 * @exports lib\Components\ButtonReference
 */
const ButtonReference = React.createClass({

    propTypes: {
        name: React.PropTypes.string,
        suffix: React.PropTypes.string,
    },

    render: function() {
        var text = AppButtons[this.props.name];

        if (this.props.suffix) {
            text += ' ' + this.props.suffix;
        }

        if (typeof text === 'object' && text.glyph) {
            return (
                <Glyphicon
                    glyph={text.glyph}
                    style={{display:'inline',fontSize:'12pt'}}
                />
            );
        } else {
            return (
                <Label className='button-reference'>{text}</Label>
            );
        }
    },

});

export default ButtonReference;
