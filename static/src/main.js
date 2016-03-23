import routes from 'app/routes/Routes';
import React from 'react';
import Router, { HistoryLocation } from 'react-router';
import NeatApp from 'app/utils/NeatApp';
import util from 'common/utils/util';
import $ from 'jquery';

// Need to load default highcharts configuration
import 'common/utils/highcharts';

// Make sure we close NEAT when the browser tab closes.
window.onbeforeunload = NeatApp.closeApp;

// Make sure always send Neat-Client-Url header
$.ajaxSetup({
    beforeSend: function(xhr){
        xhr.setRequestHeader('Neat-Client-Url', util.getPath());
    }
});

// Startup the single-page webapp frontend.
Router.run(routes, HistoryLocation, function (Handler, state) {
    var params = state.params;
    var container = document.getElementById('neat');
    React.render(<Handler params={params} />, container);
});
