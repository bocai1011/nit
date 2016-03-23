import datetime

_TRADE_TIME_FORMAT = ( '%Y-%m-%dT%H:%M:%S.%f', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S.%f', '%Y-%m-%d %H:%M:%S')

def mk_trade_time(date):
    ''' Convert datetime string to datetime object of format specified by _TRADE_TIME_FORMAT '''
    for fmt in _TRADE_TIME_FORMAT:   
        try:
            return datetime.datetime.strptime(date, fmt)
        except ValueError:
            pass
    
    #if we make it here, there is no match
    raise Exception('date\'s format "%s" is inconsistent with "%s"'%(date, str(_TRADE_TIME_FORMAT)))


