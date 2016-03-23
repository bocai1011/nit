""" utilty routines """
from __future__ import unicode_literals
import os.path as osp
import psutil

def get_path(paths=None):
    """ return the joined paths relative to the top level of the package """
    
    top_level = osp.abspath(osp.dirname(__file__))
    if paths is None:
        paths = []
    elif isinstance(paths, basestring):
        paths = [ paths ]
    return osp.join(top_level,*paths)
    
