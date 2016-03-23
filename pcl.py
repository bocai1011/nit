""" pcl top-level managemenet """
import logging
from kdbpy import kdb, Credentials
from blaze import CSV
import pandas as pd
import numpy as np
import query

class PCL(object):

    def __init__(self, credentials=None, q_exec=None, start='restart'):
        """
        Parameters
        ----------
        credentials: credentials if specified, default None (use default credentials)
        q_exec: q_exec path (default of None uses the default path)
        start : boolean, default False
           if True and process is running, return
           if 'restart' and process is running, restart it
           if False raise ValueError if the process is running
        """

        # instantiate the kq object
        if credentials is None:
            credentials = Credentials()
        self.kq = kdb.KQ(credentials=credentials, path=q_exec)

        # instantiate the QueryManager and update our namespace
        self.qm = query.QueryManager(self)
        self.qm.update(self)

        if start:
            self.start(start=start)

    @property
    def evaluator(self):
        """ the KQ actually evaluates the queries """
        return self.kq

    # context manager, so allow
    # with PCL() as p:
    #    pass
    def __enter__(self):
        # don't restart if already started
        self.start(start=True)
        return self

    def __exit__(self, *args):
        self.stop()
        return True

    def __str__(self):
        """ return a string representation of the connection """
        return "[{0}: {1}]".format(type(self).__name__,self.kq)

    __repr__ = __str__

    # start stop the kdb client/server
    def start(self, start='restart'):
        """ start up kdb/q process and connect server """
        self.kq.start()

    def stop(self):
        """ terminate kdb/q process and connecting server """
        self.kq.stop()

    @property
    def is_started(self):
        """ return boolean if kdb is started """
        return self.kq.is_started

    def eval(self, *args, **kwargs):
        """ send the evaluation expression and options to the compute engine """
        if not self.is_started:
            raise ValueError("kdb/q is not started!")
        return self.kq.kdb.eval(*args, **kwargs)

    def read_csv(self, path, table):
        """
        load a csv directly to kdb, reference it via the table name

        Parameters
        ----------
        path : a pathname to a file
        table : the result variable in the kdb database
            
        """
        return self.kq.read_csv(path, table=table)

    @property
    def data(self):
        """ return a BlazeGetter, a dict like interface to the tables """
        return self.kq.data

    @property
    def tables(self):
        """ return the tables in the current namespace meta-data as a DataFrame """
        return self.kq.tables

    @property
    def memory(self):
        """ return the memory used as a Series """
        return self.kq.memory

    def __getitem__(self, key):
        """ return the named table as a blaze Data object, or raise KeyError if not found """
        return self.kq.get(key)

    def __setitem__(self, key, value):
        """ return the named table as a blaze Data object, or raise KeyError if not found """
        return self.kq.set(key, value)
    
