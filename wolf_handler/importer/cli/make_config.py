import argparse

from neat.wolf_handler.importer.cli import config as conf
from neat.wolf_handler.utils.threefingerclaw import barf, chirp
from neat.wolf_handler.layouts import available_layouts

__author__ = 'MartinoW'


def create_parser():
    """
    creates the parser object
    :return: ArgumentParser
    """

    # get the non default layouts
    _layouts = '\n'.join(['Default is exec_blotter\n'] +
        ["{}: {}".format(name, available_layouts[name]['description']) for name in available_layouts])
    parser = argparse.ArgumentParser(description='Generate a config sheet based on sample data ')
    parser.add_argument('-d', '--data_type', action='store', default='exec_blotter',
                        help=_layouts)
    parser.add_argument('-c', '--csv-dialect', action='store', default='excel', help='dialect of the csv')
    parser.add_argument('-n', '--name', action='store', default=None, help='name of the config file to create')
    parser.add_argument('-x', '--compression', action='store', default=None,
                        help='how the file is compressed (only gzip and bz2 are supported)')
    parser.add_argument('-v', '--verbose', action='store_const', const=True, default=False, help='output parameters')
    parser.add_argument('-o', '--overwrite', action='store_true', default=False, help='overwrite current config file')
    parser.add_argument('file_path', action='store', help='path to sample data file')
    return parser


def make_config(parser):
    args = vars(parser.parse_args())
    verbose = args['verbose']
    compression = args['compression']

    # pandas only supports gzip and bz2
    if compression:
        if compression.strip() not in {'gzip', 'bz2'}:
            barf('Apologies, compression setting {0} is not supported'.format(compression))
    else:
        compression = None

    for k, v in args.items():
        chirp('{0}: {1}'.format(k, v), verbose)
    # gen the config script
    try:
        path = conf.mk_config_json(args['file_path'], args['data_type'], output_path=args['name'],
                                    overwrite=args['overwrite'], dialect=args['csv_dialect'], compression=compression)
        print('Config file generated at location: {0}'.format(path))
    except (conf.ImportFileIOError, conf.ConfigIOError) as e:
        barf(str(e))
    pass


if __name__ == "__main__":
    parser = create_parser()
    make_config(parser)

