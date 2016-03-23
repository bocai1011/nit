from functools import partial
import operator as oper_test
import pandas as pd

#Defaulted datetime parser, infer_datetime_format can be overridden by supplying a format later on
def datetime(format, dayfirst):
    """
    Given a format, return a parser built on top of pandas.to_datetime.
    :param dayfirst:
    :param format: str (strftime compliant)
    :return: pandas.tslib.Timestamp (pandas.NaT if fails)

    Default behavior:
        infer_datetime_format = True
        coerce = True
        dayfirst = False
        format = None

    If format is supplied, fast path is enabled.

    """
    if format:
        return partial(pd.to_datetime, coerce=True, dayfirst=dayfirst, format=format)
    else:
        return partial(pd.to_datetime, coerce=True, dayfirst=dayfirst, infer_datetime_format=True)


def str_length(col_name, min_len=0, max_len=None):
    """
    Given a column_name and min/max values, construct an test resulting in a boolean masking array,
    use min_len = 0 for tests regarding only max length.
    """
    assert type(col_name) == str, 'Column names must be a string for this to work. type: {0}'.format(type(col_name))
    if max_len:
        def str_test(lower, upper, c_name, df):
            '''
            pass this the dataframe and it will return a bit mask of the valid rows.
            '''
            return (lower <= df.__getattr__(c_name).str.len()) & ( df.__getattr__(c_name).str.len() <= upper)

        return partial(str_test, min_len, max_len, col_name)
    else:
        def str_test(lower, c_name, df):
            '''
            pass this the dataframe and it will return a bit mask of the valid rows.
            '''
            return (lower <= df.__getattr__(c_name).str.len())

        return partial(str_test, min_len, max_len, col_name)


def not_null(col_name):
    """
    returns a function that will test a specified column in a dataframe against being null. Returns non_null
    :param col_name:
    :return:
    """

    def not_null_test(c_name, df):
        '''
        pass this the dataframe and it will return a bit mask of the valid rows.
        '''
        return ~df.__getattr__(c_name).isnull()

    return partial(not_null_test, col_name)


def numeric_validator(col_name, num, operator):
    """
    given a column name, some number and an operator against it, return a function for validating a dataframe
    :param col_name:
    :param operator:
    :param num:
    """
    assert operator.__class__ == oper_test.eq.__class__, "you need to pass in an operator.X value here"
    assert type(col_name) == str, 'Column names must be a string for this to work.'

    def numeric_check(c_name, n, op, df):
        return op(df.__getattr__(c_name), n) & ~df.__getattr__(c_name).isnull()

    return partial(numeric_check, col_name, num, operator)


def concat_date_with_time(date_col, time_col):
    """
    Creates a function that combines a date and time column together, regardless of if either column is a date time
    This assumes that all date column members are non-null (not NaT)
    :param date_col: name of date column
    :param time_col: name of time column
    """
    from datetime import datetime
    def concat_to_datetime(date_col, time_col, df):
        return df.apply(lambda x: datetime.combine(x[date_col].date(), x[time_col].time()), axis=1)

    return partial(concat_to_datetime, date_col, time_col)












