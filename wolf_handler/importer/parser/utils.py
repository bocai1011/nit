from .core import valid_date, valid_datetime, valid_time, num_any


def infer_type(sample_list):
    """
    Given a list of sample strings, infer the set of possible types
    :returns types: set of possible types
    """
    types = {'text'}
    for i in sample_list:
        #if we already have the full set, then no reason to keep going
        if {'text', 'date', 'datetime', 'time'} == types:
            break
        #check if its a number
        try:
            if num_any(i):
                types.add('numeric')
        except ValueError:
            pass

        #check if a date
        if 'datetime' not in types:
            try:
                if valid_datetime(i):
                    types.add('datetime')
            except ValueError:
                pass
        if 'date' not in types:
            try:
                if valid_date(i):
                    types.add('date')
            except ValueError:
                pass

        if 'time' not in types:
            try:
                if valid_time(i):
                    types.add('time')
            except ValueError:
                pass
    if 'datetime' in types:
        if 'time' not in types or 'date' not in types:
            types.remove('datetime')
    return types


