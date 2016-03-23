""" wolf parsers python wrapper / communicator """

import psutil

class Wolf(object):
    # 

    def __init__(self, config):
        """
        Parameters
        ----------
        config : the config file path to pass to wolf
        
        """
        
        self.config = config
        self.state = None

    def __str__(self):
        """ return a string representation of the our state """
        return "wolf"

    __repr__ = __str__

    def start(self):
        """ start up wolf """       
        self.process = psutil.Popen(self.path)
    
    def stop(self):
        """ forcibly stop wolf """
        raise NotImplementedError("forcibly stopping wolf")

