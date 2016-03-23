import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default React.createClass({

    render: function () {
        var layout = this.props.layout;
        var widgets = this.props.children;

        if (layout.length == 1) {
            widgets = [widgets];
        } else {
            if (layout.length !== widgets.length) {
                console.log(layout);
                console.log(widgets);
                throw new TypeError("data and widgets are not the same length");
            }
        }

        // layout = [[8, 4], [12]];  // use this to experiment with layoutss
        return (
            <Row> {
                widgets.map(function (widget, j) {
                    return (
                        <Col md={layout[j]} key={j}>
                            {widget}
                        </Col>
                    );
                })
            }
            </Row>
        );
    }
});
