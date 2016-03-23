""" manage user-level queries / functions """

import logging
import pandas as pd
import numpy as np
import importlib
import os

class QueryManager(object):
    """ 
    hold a dictionary of queries
    provide execution services via a PCL 
    
    provide serialization / deserialization of the queries
    """
    
    def __init__(self, parent, path=None):
        """
        Parameters
        ----------
        parent : the parent (PCL) object
        """

        self.parent = parent
        self.evaluator = parent.evaluator
        self.namespaces = {}

        # load and update the namespaces to the parent
        self.load()
        self.update(self)
        
    def save(self):
        """ save the queries to a store """
        pass
    
    def load(self):
        """ load queries from the query store """
        from neat.queries import core, reports
        self.namespaces = { 'core' : Namespace(self)._load_queries(core),
                            'reports' : Namespace(self)._load_queries(reports) }

    def update(self, obj):
        """ update the namespaces in the object """
        for n, ns in self.namespaces.items():
            setattr(obj,n,ns)

    def eval(self, q):
        """ 
        evaluate the query, returning the results 

        Parameters
        ----------
        q : a query object
        
        """
        return self.parent.eval(q)

class Namespace(object):
    """ 
    manage a QueryManager namespace 
    
    These are returned as accessor objects to provide separate
    query namespacees    
    
    """
    
    def __init__(self, parent):
        self.parent = parent
        self.evaluator = parent.evaluator
        self.queries = {}

    def __dir__(self):
        """ provide tab-completion of queries """
        return sorted(self.queries.keys())

    def _load_queries(self, module):
        """
        load up all of the queries in the module and setup
        """
        for q in module.queries:
            self._add_query(q)
        return self

    def _add_query(self, q):
        """
        Parameters
        ----------
        q : Query

        add the the query to the in-memory store
        """

        q.set_parent(parent = self)
        self.queries[q.name] = q
        setattr(self.__class__,q.name,q)
        
    def _remove_query(self, q):
        """
        Parameters
        ----------
        q : string or Query

        Returns
        -------
        returns the deleted query
        """
        
        if isinstance(q, Query):
            q = q.name
        delattr(self.__class__, q)
        return self.queries.pop(q)

class Query(object):
    """ hold a single user-level query parameters """

    def __init__(self, name, f):
        """
        Parameters
        ----------
        name : string name of the query
        f : string or callable
           the query evaluable

        """
        self.name = name
        self.f = f
        self.parent = None
        self.evaluator = None

    def set_parent(self, parent):
        """
        set the parent & my evaluator

        parent is the Namespace
        evaluator is the QueryManager
        """
        self.parent = parent
        self.evaluator = parent.evaluator

    def __call__(self, *args, **kwargs):
        """ execute the query & return the results """
        return self.evaluator.eval(self.f, *args, **kwargs)
