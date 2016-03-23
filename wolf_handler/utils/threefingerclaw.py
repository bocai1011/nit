__author__ = 'MartinoW'


import sys


#Contants
_HAL_EXIT_CODE = 111


def chirp(msg, verbose=False, f=sys.stderr):
    """Prints message to stderr"""
    if verbose:
        shout(msg)


def shout(msg):
    '''Log to file (usually stderr), with progname: <log>'''
    sys.stderr.write('{0}'.format(msg))


def barf(msg):
    '''Exit with a log message (usually a fatal error)'''
    exit = _HAL_EXIT_CODE
    shout(msg)
    sys.exit(exit)
