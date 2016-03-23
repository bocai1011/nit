import keyUtils from 'common/utils/keyUtils';

var sandbox = sinon.sandbox.create();

describe('keyUtils', function () {

    afterEach(function () {
        sandbox.restore();
    });

    it('should register a "keyDown" handler on a DOM element');

    it('should make a table DOM element tabbable', function () {
        var tableContainer = document.createElement('div');
        var table = document.createElement('table');
        var tr = document.createElement('tr');

        var tds = [];
        [1, 2, 3].forEach(function () {
            var td = document.createElement('td');
            tds.push(td);
            tr.appendChild(td);
        });

        table.appendChild(tr);
        tableContainer.appendChild(table);

        keyUtils.addTabbableNavigation(tableContainer, true);

        expect(tr.tabIndex).to.equal(0);
        tds.forEach(function (td) {
            expect(td.tabIndex).to.equal(0);
        });

    });

    it('click the active DOM element when ENTER is pressed', function () {
        var clickSpy = sandbox.spy();
        document.activeElement.addEventListener('click', clickSpy);
        keyUtils.respondToEnterKey({ keyCode: 13 });
        expect(clickSpy).been.called;
        document.activeElement.removeEventListener('click', clickSpy);
    });

});
