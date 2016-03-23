import pytest
from neat.pcl import PCL
from pandas import DataFrame, Series
from pandas.util.testing import ensure_clean, makeMixedDataFrame, assert_frame_equal
import numpy as np

@pytest.yield_fixture(scope='module')
def pcl():
    p = PCL()
    yield p
    p.stop()

def test_construction():
    p = PCL(start=True)
    assert p.is_started

    # repr
    result = str(p)
    assert '-> connected' in result

    p.stop()
    assert not p.is_started

    result = str(p)
    assert 'KDB: [client/server not started]'

def test_load_csv(pcl):

    # create a multi-type csv for testing
    df = makeMixedDataFrame()
    df['B'] = df['B'].astype('int64') + 1

    with ensure_clean('foo.csv') as path:

        df.to_csv(path,index=False)

        # some dtypes are downcast
        expected = df.copy()
        expected['A'] = expected['A'].astype('float32')
        expected['B'] = expected['B'].astype('int16')

        pcl.read_csv(path,'foo')

        result = pcl.eval('foo')
        assert_frame_equal(result,expected)


@pytest.mark.xfail(raises=KeyError,
                   reason='qpython cannot serialize pandas Timestamps')
def test_properties(pcl):

    df = makeMixedDataFrame()
    df['B'] = df['B'].astype('int64')

    pcl['foo'] = df

    result = pcl['foo']
    assert_frame_equal(result, df)

    result = pcl.tables
    assert 'foo' in result.name

    pcl.memory
