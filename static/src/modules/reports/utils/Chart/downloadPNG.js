/** @module reports/utils/Chart/downloadPNG */

import util from 'common/utils/util';

/**
 * Extracts an SVG from a DOM element and downloads it as a PNG, by way of
 * a <canvas> element.
 *
 * @param {DOMElement} domNode - A DOM node that contains an SVG to download.
 * @param {string} filename - An extensionless filename string for downloading.
 *
 * @see {@link http://stackoverflow.com/a/33273543}
 */
export default function downloadPNG(domNode, filename) {
    let
        img,
        blob,
        url,
        svg = domNode.querySelector('svg'),
        chartWidth = svg.clientWidth,
        chartHeight = svg.clientHeight
    ;

    // Serialize the entire SVG into a string, and turn it into a
    // data-url (data:image/svg+xml;charset=utf-8;...)
    svg = (new XMLSerializer()).serializeToString(svg);
    blob = new Blob([ svg ], { type: 'image/svg+xml;charset=utf-8' });

    // Create a URL that can be used as the `src` attribute
    // for an <img> element.
    url = URL.createObjectURL(blob);

    // Create an Image the same size as the chart DOM element.
    img = new Image();
    img.width = chartWidth;
    img.height = chartHeight;

    // Fired when the Image has loaded its URL.
    img.onload = function () {
        let
            canvasData,
            ctx,
            canvas = document.createElement('canvas')
        ;

        // Create a canvas the same size as the chart DOM element.
        canvas.width = chartWidth;
        canvas.height = chartHeight;
        ctx = canvas.getContext('2d');

        // Draw the Image onto the canvas.
        ctx.drawImage(img, 0, 0, chartWidth, chartHeight);

        // Clean up for security reasons.
        URL.revokeObjectURL(url);

        // Download the canvas image.
        util.downloadFile(filename, canvas.toDataURL('image/png'));

    }

    // This will start the loading of the image.
    img.src = url;

}
