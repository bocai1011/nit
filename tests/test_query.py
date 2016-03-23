import pytest

from neat.pcl import PCL
from neat.query import QueryManager, Query
from pandas import DataFrame, Series
from pandas.util.testing import ensure_clean, makeMixedDataFrame, assert_frame_equal
import numpy as np

@pytest.yield_fixture(scope='module')
def pcl():
    p = PCL()
    yield p
    p.stop()

@pytest.fixture(scope='module')
def qm(pcl):
    return QueryManager(pcl)

def get_dir(obj):
    """ return the __dir__ attributes of the obj """
    results = [ r for r in obj.__dir__() if not r.startswith('_') ]
    return list(sorted(set(results)))

def test_query_manager(pcl):

    # construction & loading
    qm = QueryManager(pcl)
    assert isinstance(qm, QueryManager)

    assert isinstance(qm.core.queries['test_query_q'], Query)
    assert isinstance(qm.reports.queries['test_query_q'], Query)
    
    # tab-completers
    assert 'test_query_q' in get_dir(qm.core)
    assert 'test_query_q' in get_dir(qm.reports)

    # add/remove
    q = qm.core._remove_query('test_query_q')
    assert 'test_query_q' not in get_dir(qm.core)
    assert getattr(qm.core,'test_query_q',None) is None

    qm.core._add_query(q)
    assert 'test_query_q' in get_dir(qm.core)
    assert isinstance(qm.core.queries['test_query_q'], Query)

def test_query_execution(qm):

    result = qm.core.test_query_q()
    assert result == 123

    result = qm.core.test_query_f()
    assert result == 12345
