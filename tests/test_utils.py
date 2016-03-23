""" hold utility routines """

import pytest
from neat import utils
import numpy as np

def test_get_path():
    top_level = utils.get_path()
    assert top_level.endswith('neat')

    u = utils.get_path('utils')
    assert u.endswith('utils')

    u2 = utils.get_path(['utils','foo'])
    assert u2.endswith('foo')
