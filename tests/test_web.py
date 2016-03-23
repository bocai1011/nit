""" test the web part of the app """

from neat import web
import pytest

@pytest.yield_fixture(scope='module')
def app():
    app = web.app.test_client()
    web.app.config['TESTING'] = True
    yield app

def test_construction(app):

    # this is index.html
    rv = app.get('/')
    assert 'NeatApp.js' in rv.data

def test_requests(app):

    pass
    #rv = app.post('/add', data=dict(
    #    title='<Hello>',
    #    text='<strong>HTML</strong> allowed here'
    #    ), follow_redirects=True)
    #assert 'No entries here so far' not in rv.data
    #assert '&lt;Hello&gt;' in rv.data
    #assert '<strong>HTML</strong> allowed here' in rv.data
