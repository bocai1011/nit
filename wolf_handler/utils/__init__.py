def line_count(fname, compression=None):
    """
    The fastest line counter in all the land (well that's not compiled...)
    :param fname: path to file
    :return: int
    """
    #Some weird shit happens when you don't use this...
    f_open = open
    if compression:
        if compression == 'gzip':
            from gzip import open as g_open
            f_open = g_open
        elif compression == 'bz2':
            from bz2 import open as b_open
            f_open = b_open
        else:
            raise ValueError('Compression Selection "{}" is unsupported'.format(compression))
        lines = 0
        for _ in f_open(fname):
            lines += 1
    else:
        with f_open(fname) as f:
            lines = 0
            buf_size = 1024 * 1024
            read_f = f.read  # loop optimization

            buf = read_f(buf_size)
            while buf:
                lines += buf.count('\n')
                buf = read_f(buf_size)

    return lines