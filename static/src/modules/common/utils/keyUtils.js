import $ from 'jquery';

// function findIndexInParent(child, parent) {
//     var index;
//     var _parent = parent || child.parentNode;
//     var parentNodes = _parent.getElementsByTagName(child.tagName);
//     for (var c = 0; c < parentNodes.length; c++) {
//         if (parentNodes[c] === child) {
//             index = c;
//         }
//     }
//     return index;
// };

function respondToEnterKey (e){
    var keyEvent = e.which || e.keyCode;
    if (keyEvent === 13) {
        var activeEl = document.activeElement;
        var clickableElement;
        // Assign click to first anchor in the element, if any exist.
        var childAnchor =  activeEl.getElementsByTagName('BUTTON')[0] || $(activeEl).find('a').get(0);
        clickableElement = childAnchor || activeEl;
        clickableElement.click();
    }
}



/* This is the beginning of optional keyboard navigation within a table.
    Not necessary for 508 compliance, and may interfere with 508 navigation standards */
/*var tableKeyNavigation = function(e) {
    var keyEvent = e.which || e.keyCode;
    var shiftOn = false;
    var activeTR, activeTD;

    if (keyEvent == 9) {  // Tab key
       //console.log('hitting tab key');
    }
    else if (e.shiftKey && keyEvent == 9) {  // shift-Tab
        //console.log('hitting shift-tab key');
    }
    else {
        switch (keyEvent) {
            case 40: //down arrow
                //doKeyDownArrow();
            break;
            case 38: //up arrow
            break;
            case 37: //left arrow
            break;
            case 39: //right arrow
                //doKeyRightArrow();
            break;

            default:
            break;
        }
        e.preventDefault();
    }
    function escapeTable() {
        //window.alert('end of table');
        tableElement.removeEventListener(tableKeyNavigation);
        tableElement.removeEventListener(respondToEnterKey);
        isElementFocused = false;
        tableElement.blur();

    }
    function doKeyUpArrow() {
        console.log('up arrow');
    }
    function doKeyDownArrow() {
        var activeEl = document.activeElement;
         // If we're in the table, but haven't moved into any subelement yet
        if (activeEl.tagName == "TABLE") {
            // if there's a proper thead
            if (tHead != null) {
                var firstTH = activeEl.getElementsByTagName('TH')[0];
                if (!!firstTH) {
                    firstTH.focus();
                    activeEl = firstTH;
                }
                else {
                    tHead.focus();
                    activeEl = tHead;
                }
            }
             // No thead found, look for the first available td
            else {
                var firstTD = firstTR.getElementsByTagName('TD')[0];
                firstTR.className += "lit"; //optional
                firstTD.focus();
                activeEl = firstTD;
            }
        }
         // if we're in the header
        else if  (activeEl.tagName == "TH"){
            var currentTR, currentIndex;
             // If (though unlikely) there's more than one table row in the table header
            if (tableElement.getElementsByTagName('THEAD')[0].getElementsByTagName('TR').length > 1) {
                console.log('theres more than one row in the header');
            }
            else {
                currentIndex = findIndexInParent(document.activeElement) || 0;
                var nextItemDown = tableRows[0].getElementsByTagName('TD')[currentIndex];
                console.log('nextItemDown = ' + nextItemDown.innerHTML);
                // activeEl = nextItemDown;
                nextItemDown.focus();
            }
        }
         // If we are in a table row
        else if  (activeEl.tagName == "TD"){
            currentIndex = findIndexInParent(document.activeElement) || 0;
            var parentRow = document.activeElement.parentNode;
            currentRowIndex = parseInt(findIndexInParent(parentRow));
            var nextItemDown = tableRows[(currentRowIndex + 1)].getElementsByTagName('TD')[currentIndex];
            // activeEl = nextItemDown;
            nextItemDown.focus();
        }
         // Not in any distinguishable part of the table
        else {
            //get out of the table
        }
    }
    function doKeyLeftArrow() {
        var activeEl = document.activeElement;
        console.log('left arrow');
    }
    function doKeyRightArrow() {
        var activeEl = document.activeElement;
        var nextItemOver;
          // if we're in the header
        if  (activeEl.tagName == "TH") {
            nextItemOver = activeEl.nextElementSibling || tableRows[0].children[0];
        }
         // if we're in the table body
        else {
            nextItemOver = activeEl.nextElementSibling || (function() {
                return (activeEl.parentNode.nextElementSibling) ? activeEl.parentNode.nextElementSibling.children[0] : escapeTable()
            })();
        }
        activeEl.tabIndex = 0;
        nextItemOver.tabIndex = -1;
        nextItemOver.focus();
    }
}*/

const keyUtils = {
    returnEnterKeyListener: function() {
        return respondToEnterKey;
    },

    registerEnterKeyListener: function(targetElement) {
        targetElement.addEventListener('keydown', respondToEnterKey );
    },

    addTabbableNavigation: function(targetElement, markTRs) {
        var targetEl = targetElement;
        var setChildrenTabIndices = function(_table) {
            var _tds = _table.getElementsByTagName('TD');
            for (var d =0; d < _tds.length; d++) {
                _tds[d].tabIndex = 0;
            }
            if (markTRs === true) {
                var _trs = _table.getElementsByTagName('TR');
                for (var r =0; r < _trs.length; r++) {
                    _trs[r].tabIndex = 0;
                }
            }
        }
        if (targetEl.tagName === 'TABLE') {
            setChildrenTabIndices(targetEl);
        }
        else {
            var _tables = targetEl.getElementsByTagName('TABLE');
            for (var t = 0; t < _tables.length; t++) {
                setChildrenTabIndices(_tables[t]);
            }
        }
    },

    respondToEnterKey: respondToEnterKey,

/* This is the beginning of optional keyboard navigation within a table.
    Not necessary for 508 compliance, and may interfere with 508 navigation standards */
/*  addTableKeyNavigation: function(event){
        var e = event || window.event;
         // get the DOM element
        var activeEl = document.activeElement;

        return function() {
            if (!isElementFocused) {

                 // store its structure in variables once, for convenience
                tableElement = document.activeElement;
                tHead = document.activeElement.getElementsByTagName('THEAD')[0];
                tableRows = tableElement.getElementsByTagName('TR');

                 // define the tableRows array as only being those in the table body, not the thead
                if (tHead != null && tHead.getElementsByTagName('TR').length > 0) {
                    var numTRowsInTHead = tHead.getElementsByTagName('TR').length;
                    function findBodyRows() {
                        var rowArray = [];
                        for (var t = numTRowsInTHead; t < tableRows.length; t++) {
                            rowArray.push(tableRows[t]);
                        }
                        return rowArray;
                    }
                    tableRows = findBodyRows();
                }
                else {

                }

                 // add the EventListener
                activeEl.addEventListener("keydown", tableKeyNavigation );
                isElementFocused = true;
            }
        activeEl.addEventListener("keydown", respondToEnterKey);
        }
    },
    removeTableKeyNavigation: function(){
        return function() {
            document.removeEventListener(tableKeyNavigation, activeEl);
        }
    }*/
};

export default keyUtils;
