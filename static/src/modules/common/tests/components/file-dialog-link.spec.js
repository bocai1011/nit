import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import ErrorNotification from 'common/components/ErrorNotification';
import FileDialogLink from 'common/components/FileDialogLink';

var el,
    component,
    sandbox,
    findByClass = TestUtils.findRenderedDOMComponentWithClass,
    ntUtils = NeatTestUtils(React);

var resumableFile = { fileName: 'foo.csv' },
    filePath = 'C:/fakepath/foo.csv',
    serverResponse = JSON.stringify(filePath);

describe('FileDialogLink', function () {

    beforeEach(function () {
        sandbox = sinon.sandbox.create()

        ntUtils.stubCurrentCase(NeatApp);

        el = React.createElement(FileDialogLink, {
            targetRoute: '#',
            onFileUpload: sandbox.spy(),
        });

        component = TestUtils.renderIntoDocument(el);
    });

    afterEach(function () {
        sandbox.restore();
        ntUtils.unsetCase(NeatApp);
    });

    it('should call resumable.upload() when a file is added',
        function () {
            sandbox.stub(component.resumable, 'upload');
            component.resumable.fire('fileadded');
            expect(component.resumable.upload).to.have.been.called;
        }
    );

    it('should render a loading bar after upload() has been called',
        function () {
            var fileObj = { relativePath: 'foo.csv' };
            sandbox.stub(component.resumable, 'upload');
            component.resumable.files = [fileObj];
            component.resumable.fire('fileadded');

            // This Timeout gives React time to render the loading bars
            // after the file is added.
            setTimeout(function () {
                var progressBar = findByClass('progress');
                var spans = TestUtils.scryRenderedDOMComponentsWithTag(
                    progressBar, 'span'
                );

                var labelSpan = spans.pop().getDOMNode();
                expect(labelSpan.textContent)
                    .to
                    .equal(fileObj.relativePath);
            }, 5);
        }
    );

    it('should update the state with new progress upon file progress',
        function () {
            expect(component.state.uploadProgress).to.equal(0.0);
            expect(component.state.isLoading).to.be.false;
            component.resumable.fire('fileprogress', {
                progress: function () { return 0.5; }
            });
            expect(component.state.uploadProgress).to.equal(50.0);
            expect(component.state.isLoading).to.be.true;
        }
    );

    it('should remove the Resumable file upon successful file upload',
        function () {
            var removeFile = sandbox.stub(component.resumable,
                                          'removeFile');
            component.resumable.fire('filesuccess',
                                     resumableFile,
                                     serverResponse);
            expect(removeFile).to.have.been.calledWith(resumableFile);
        }
    );

    it('should call onFileUpload() upon successful file upload',
        function () {
            component.resumable.fire('filesuccess',
                                     resumableFile,
                                     serverResponse);
            expect(component.props.onFileUpload)
                .to
                .have
                .been
                .calledWith('C:/fakepath/foo.csv');
        }
    );

    it('should reset the state upon file upload completion', function () {
        component.setState({
            uploadProgress: 0.5,
            isLoading: true
        });
        expect(component.state.uploadProgress).to.equal(0.5);
        expect(component.state.isLoading).to.be.true;
        component.resumable.fire('complete');
        expect(component.state.uploadProgress).to.equal(0.0);
        expect(component.state.isLoading).to.be.false;
    });

    it('should reveal an ErrorNotification when it throws an error',
        function () {
            component.resumable.fire('fileerror',
                                     resumableFile,
                                     '{"message": "There is an error!"}');

            var errorNotes = TestUtils.scryRenderedComponentsWithType(
                component,
                ErrorNotification
            );

            expect(errorNotes).to.have.length(1);
        }
    );

});
