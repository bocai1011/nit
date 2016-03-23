import future
from future.builtins import *

import csv
from itertools import chain
import os
import configparser as cp
import json
import copy

import pandas as pd
from pandas.tseries.tools import _guess_datetime_format

from ...layouts import available_layouts
from ...layouts.available_columns import default_values
from ..parser.core import num_any, valid_date, valid_time, valid_datetime, unambiguous_datetime_stamp
from ..parser.fields import cusip, isin, sedol

SAMPLE_SIZE = 100
col_types = ['str', 'int', 'float', 'datetime', 'date', 'time', 'cusip', 'isin', 'sedol']

skip = {'name': 'skip', 'icon': 'skip', 'type': None, 'message': 'This column will be skipped'}

class ConfigIOError(IOError):
    pass


class ImportFileIOError(IOError):
    pass


class MappingError(Exception):
    pass


def mk_config_sheet(fpath, data_type, output_path=None, overwrite=False, dialect='excel', compression=None):
    """
    Autogen a config file to use during import of data

    :param output_path: where to make the new config file (default is PWD)
    :param fpath: str location of file to make the import for
    :raises ConfigIOError
    :raises ImportFileIOError
    :returns: path to generated file
    :rtype: str
    """

    data_layout = available_layouts[data_type]['columns']
    mapping_list = data_layout.keys()

    #The target file to be imported
    try:
        fpath = os.path.abspath(fpath)
    except IOError as e:
        raise ImportFileIOError(e)

    #create the top section of the file
    config = cp.ConfigParser(allow_no_value=True, interpolation=cp.ExtendedInterpolation())

    config = mk_config_globals(config, fpath, data_type, output_path, overwrite, dialect, compression)

    #The config file to be created
    if not output_path:
        output_path = os.path.join(os.path.dirname(fpath), 'import_config.ini')
    if os.path.exists(output_path) and not overwrite:
        #if the file exists, we want the user to be aware
        print("There is already a config file in that location ({0})".format(output_path))
        resp = input("Shall we delete it [n(o)|y(es)] (default no): ")
        if resp in {'y', 'yes'}:
            pass
        else:
            raise ImportFileIOError('Config file in location {0} already exists'.format(output_path))
    try:
        conf_file = open(output_path, mode='wt')
    except IOError as e:
        raise ConfigIOError(e)

    #Get a sample of the list to conduct type inference with
    sample, header = get_sample(fpath, dialect, compression)

    #create entry for each column name
    for i in range(len(header)):
        config['COLUMN {0}'.format(i)] = {}
        col = config['COLUMN {0}'.format(i)]
        config.set('COLUMN {0}'.format(i), "# leave mapping blank to not import it")
        sample_col = sample.icol(i).tolist()
        sample_text = '# sample: ' + ', '.join([''.join(str(j).splitlines()).strip() for j in sample_col if j][:5])
        config.set('COLUMN {0}'.format(i), sample_text)
        col['header'] = header[i]

        # The header might be the same as the column we are mapping to.
        if len([x for x in mapping_list if x.lower() == header[i].lower().strip()]) == 1:
            header[i] = header[i].lower().strip()
            if check_type(sample_col, data_layout[header[i]].datatype):
                col['mapping'] = header[i] + ' # Both name and data type seem valid'
                col['type'] = ' | '.join(data_layout[header[i]].datatype)
                default = data_layout[header[i]].default
                col['default'] = default if default else default_values[data_layout[header[i]].datatype[0]]
                col['required'] = 'True' if data_layout[header[i]].required else 'Conditional' if data_layout[header[i]].conditional else 'False'
        else:
            col['mapping'] = ''
            type_guesses = guess_type(sample_col)  # We try to guess the column type
            if 'date' in header[i].lower() or 'time'in header[i].lower():
                # in addition to the guess, we check if date or time is in the name
                if 'datetime' in header[i].lower():
                    if 'date' in type_guesses:
                        del(type_guesses[type_guesses.index('date')])
                    if 'time' in type_guesses:
                        del(type_guesses[type_guesses.index('time')])
                    type_guesses = ['datetime'] + type_guesses
                if 'date' in header[i].lower():
                    if 'date' in type_guesses:
                        del(type_guesses[type_guesses.index('date')])
                    type_guesses = ['date'] + type_guesses
                if 'time' in header[i].lower():
                    if 'time' in type_guesses:
                        del(type_guesses[type_guesses.index('time')])
                    type_guesses = ['time'] + type_guesses
            col['type'] = ' | '.join(type_guesses)
            col['mapping'] += ' || '.join([' | '.join(set([x.name for x in data_layout.values() if t in x.datatype]))
                                           for t in type_guesses])
            col['default'] = ' | '.join(set([d.default for d in data_layout.values() if d.default] +
                                            [default_values[t] for t in type_guesses if t]))
            col['required'] = 'True | False | Conditional'

        if 'date' in col['type'] or 'time' in col['type']:
            if 'date' in col['type']:
                try:
                    sample_dt_fmt = set(chain(
                        map(lambda x: _guess_datetime_format(x, dayfirst=False), sample_col),
                        map(lambda x: _guess_datetime_format(x, dayfirst=True), sample_col)))
                except ValueError:
                    sample_dt_fmt = set([None])
            else:
                try:
                    sample_dt_fmt = set(map(lambda x: _guess_datetime_format("01/01/2000T" + x), sample_col))
                except ValueError:
                    sample_dt_fmt = set([None])
                if all(sample_dt_fmt) and all([len(s) > 9 for s in list(sample_dt_fmt)]):
                    sample_dt_fmt = set(sample_dt_fmt[0][9:])
            config.set('COLUMN {0}'.format(i),
                       "# Feel free to delete the datetime portion if this is not a datetime column")
            col['datetime_format'] = ' | '.join([unambiguous_datetime_stamp(str(x)) for x in sample_dt_fmt])
            config.set('COLUMN {0}'.format(i),
                       "# prior to import, we'll check this format against the below value & error out if it doesn't work")
            #grab a single entry to test against -- must be not null
            try:
                col['datetime_sample'] = str([i for i in sample_col if str(i).strip()][0])
            except IndexError:
                col['datetime_sample'] = 'Blank'

    config.write(conf_file)
    conf_file.close()

    return '{0}'.format(output_path)


def mk_config_json(fpath, data_type, dialect='excel', compression=None, **kwargs):

    data_layout = available_layouts[data_type]['columns']
    mapping_list = data_layout.keys()

    #The target file to be imported
    try:
        fpath = os.path.abspath(fpath)
    except IOError as e:
        raise ImportFileIOError(e)

    #Get a sample of the list to conduct type inference with
    sample, header = get_sample(fpath, dialect, compression)

    columns = []

    #create entry for each column name
    for i in range(len(header)):
        column = {'name': header[i]}
        samples = sample.icol(i).tolist()
        sample_col = [''.join(str(j).splitlines()).strip() for j in samples if j][:5]
        # columns[-1]['values'] = '{' + ', '.join(sample_col) + '}'
        column['values'] = sample_col
        column['datetime_format'] = []
        column['mapping'] = skip
        # column['datetime_sample'] = 'Blank'
        column['options'] = []

        type_guesses = guess_type(sample_col)  # We try to guess the column type

        if 'date' in type_guesses or 'time' in type_guesses:
            if 'date' in type_guesses:
                try:
                    sample_dt_fmt = set(chain(
                        map(lambda x: _guess_datetime_format(x, dayfirst=False), sample_col),
                        map(lambda x: _guess_datetime_format(x, dayfirst=True), sample_col)))
                except ValueError:
                    sample_dt_fmt = set([None])
            else:
                try:
                    sample_dt_fmt = set(map(lambda x: _guess_datetime_format("01/01/2000T" + x), sample_col))
                except ValueError:
                    sample_dt_fmt = set([None])
                if all(sample_dt_fmt) and all([len(s) > 9 for s in list(sample_dt_fmt)]):
                    sample_dt_fmt = set(sample_dt_fmt[0][9:])
            column['datetime_format'] = [unambiguous_datetime_stamp(str(x)) for x in sample_dt_fmt]
            # #grab a single entry to test against -- must be not null
            # try:
            #     column['datetime_sample'] = str([i for i in sample_col if str(i).strip()][0])
            # except IndexError:
            #     column['datetime_sample'] = 'Blank'

        for possible in mapping_list:
            option = {}
            option['name'] = possible
            option['type'] = data_layout[possible].datatype
            default = data_layout[possible].default
            option['default'] = default if default else default_values[data_layout[possible].datatype[0]]
            option['required'] = 'True' if data_layout[possible].required else 'Conditional' if data_layout[possible].conditional else 'False'
            # The header might be the same as the column we are mapping to.
            if possible.lower() == header[i].lower().strip():
                header[i] = header[i].lower().strip()
                if check_type(sample_col, data_layout[header[i]].datatype):
                    option['message'] = 'Both name and data type seem valid.'
                    option['icon'] = 'okay'
                    column['mapping'] = {'name': possible,
                                         'type': data_layout[possible].datatype,
                                         'required': 'True' if data_layout[possible].required else 'Conditional' if data_layout[possible].conditional else 'False',
                                         'default': default if default else default_values[data_layout[possible].datatype[0]],
                                         'datetime_format': []}
            else:
                if not any([x in option['type'] for x in type_guesses]):
                    option['message'] = 'Invalid data type.'
                    option['icon'] = 'error'
                else:
                    option['message'] = 'Data type seem valid.'
                    option['icon'] = 'okay'
            column['options'].append(option)
        if any([x['icon'] == 'okay' for x in column['options']]):
            column['options'] = [x for x in column['options'] if x['icon'] == 'okay'] + [{'divider': True}] + [x for x in column['options'] if x['icon'] != 'okay']
        column['options'].append({'divider': True})
        column['options'].append(skip)
        columns.append(column)
    
    #print(json.dumps(columns, indent=4))
    #exit(1)

    return json.dumps(columns, indent=4)


def config_json_to_sheet(fpath, data_type, jsonstr, output_path=None, dialect='excel', compression=None, **kwargs):
    #The target file to be imported
    try:
        fpath = os.path.abspath(fpath)
    except IOError as e:
        raise ImportFileIOError(e)

    #The config file to be created
    if not output_path:
        output_path = os.path.join(os.path.dirname(fpath), 'import_config.ini')

    #create the top section of the file
    config = cp.ConfigParser(allow_no_value=True, interpolation=cp.ExtendedInterpolation())
    config = mk_config_globals(config, fpath, data_type, output_path, True, dialect, compression)

    try:
        conf_file = open(output_path, mode='wt')
    except IOError as e:
        raise ConfigIOError(e)

    #create entry for each column name
    for column in json.loads(jsonstr):
        col = copy.copy(column)
        col['header'] = column['name']
        col['mapping'] = column['mapping']['name']
        col['datetime_format'] = column['datetime_format'][0]
        config['COLUMN {0}'.format(column['index'])] = {}

    config.write(conf_file)
    conf_file.close()

    return '{0}'.format(output_path)


def test_config_sheet(filepath):
    """Read in the config sheet, parse into column objects

    :param filepath:
    """

    #Open & read the config file
    config = cp.ConfigParser(interpolation=cp.ExtendedInterpolation())
    try:
        config.read(filepath)
    except IOError as e:
        raise ConfigIOError(e)

    #containter for general settings
    gen_sets = dict()
    cols = list()

    #parse the globals first
    section = 'GLOBAL'
    group = config[section]
    if 'data_type' in group.keys():
        data_type = group['data_type'].strip()
        data_layout = available_layouts[data_type]['columns']
        mapping_list = data_layout.keys()
        gen_sets['data_type'] = data_type
    else:
        raise ConfigIOError('Data Type Must Be Specified in the config sheet!')

    #check directory config first
    if 'file_type' in group.keys():
        ftype = group['file_type']
        if ftype:
            gen_sets['file_type'] = ftype
        else:
            raise ConfigIOError('File type is required: {0}.{1}'.format(
                section, 'file_type'))
    else:
        raise ConfigIOError('File type is required: {0}.{1}'.format(
            section, 'file_type'))

    #Now for the rest, starting with dialect
    if 'dialect' in group.keys():
        dialect = str(group['dialect']).strip()
        if dialect:
            gen_sets['dialect'] = dialect

    if 'compression' in group.keys():
        compression = str(group['compression']).strip()
        if compression == 'None':
            compression = None
    else:
        compression = None
    gen_sets['compression'] = compression

    #check that the path is valid, relative to the import mode
    if 'data_path' in group.keys():
        data_path = group['data_path']
    else:
        raise ConfigIOError('Data path is required: {0}.{1}'.format(
            section, 'data_path'))

    # Now, verify that it exists
    if os.path.exists(data_path):
        gen_sets['data_path'] = os.path.abspath(data_path)
    else:
        raise ConfigIOError(
            'Path does not exist: {0}.{1} = {2}'.format(section, 'data_path', data_path))

    #overwrite needs to be configured before the next step\
    try:
        if group['overwrite'] == 'True':
            gen_sets['overwrite'] = True
        elif group['overwrite'] == 'False':
            gen_sets['overwrite'] = False
        else:
            raise ConfigIOError(
                'Invalid Parameter Found: {0}.{1} = {2}'.format(section, 'overwrite',
                                                                group['overwrite']))
    except KeyError:
        raise ConfigIOError(
            'Invalid Parameter Found: {0}.{1} = {2}'.format(section, 'overwrite',
                                                            group['overwrite']))

    #Get a sample of the list to conduct type inference with
    sample, header = get_sample(data_path, dialect, compression)

    for section in config.sections():
        group = config[section]
        #valid global config
        if not section == 'GLOBAL':
            #column importing settings
            try:
                mapping = str(group['mapping']).strip()
                if mapping in mapping_list:
                    col_num = int(section.split()[1])
                    orig_name = str(group['header']).strip()
                    mapped_name = mapping
                elif not mapping:
                    #in case it's left blank
                    continue
                else:
                    #mapping has a value, but it is invalid
                    raise ConfigIOError(
                        'Invalid Mapping: {0}.{1} = {2}'.format(section, 'mapping', group['mapping']))

                if 'datetime_format' in group.keys() and 'time' in mapped_name:
                    dt_format = unambiguous_datetime_stamp(group['datetime_format'], reverse=True)
                    dt = pd.to_datetime(group['datetime_sample'], format=dt_format, coerce=True)
                    if pd.isnull(dt):
                        raise ConfigIOError(
                            'Invalid Datetime Format (test parse failed): {0}.{1} = {2}'.format(section, 'mapping',
                                                                                                dt_format))
                else:
                    dt_format = None

                if not check_type(sample[col_num], data_layout[mapping].datatype):
                    raise TypeError('Column %d <%s> failed type check (%s)' %
                                    (col_num, mapping, ', '.join(data_layout[mapping].datatype)))

            except KeyError:
                continue

            if mapped_name in set((i['mapped_name'] for i in cols)):
                raise ConfigIOError(
                    'A duplicate mapping has occurred ({0}) for columns: '
                    '{1}, {2}'.format(mapped_name, col_num,
                                      ','.join((str(i['col_num']) for i in cols if i['mapped_name'] == mapped_name)))
                )
            else:
                #make the description and append it to the list
                cols.append({'col_num': col_num, 'mapped_name': mapped_name, 'col': data_layout[mapped_name]})

    missing_mappings = [i.name for i in data_layout.values() if i.required(cols)
                        and i.name not in set((j['mapped_name'] for j in cols))]
    if missing_mappings:
        raise MappingError('Required Mappings are absent: {0}'.format(str(missing_mappings)))

    return cols


def mk_config_globals(config, fpath, data_type, output_path=None, overwrite=False, dialect='excel', compression=None):
    top = dict()
    top['file_type'] = fpath.split(os.extsep)[-2] if compression else fpath.split(os.extsep)[-1]
    top['compression'] = compression if compression else 'None'
    top['data_type'] = data_type
    top['data_path'] = fpath
    top['dir_path'] = os.path.dirname(fpath)
    top['overwrite'] = 'True | False'
    top['dialect'] = dialect
    # config.set('GLOBAL', "# For datetime format string documentation, see http://strftime.org/ for documentation")
    config['GLOBAL'] = top
    return config

def get_sample(fpath, dialect, compression, nrows=1000):
    try:
        d = csv.get_dialect(dialect)
        sample = pd.io.parsers.read_csv(fpath, nrows=nrows, compression=compression, dtype=object, dialect=d)
        header = sample.columns.tolist()
    except Exception as e:
        raise ImportFileIOError(e)
    return sample, header


def guess_type(sample_col):
    # These are the options: ['str', 'int', 'float', 'datetime', 'date', 'time', 'cusip', 'isin', 'sedol']
    guesses = []
    try:
        sample_dt_fmt = set(chain(
            map(lambda x: _guess_datetime_format(x, dayfirst=False), sample_col),
            map(lambda x: _guess_datetime_format(x, dayfirst=True), sample_col)))
    except ValueError:
        sample_dt_fmt = set([None])

    if all(sample_dt_fmt):
        if all([valid_datetime(x) for x in sample_dt_fmt]):
            guesses.append('datetime')
        if all([valid_date(x) for x in sample_dt_fmt]):
            guesses.append('date')
        if all([valid_time(x) for x in sample_dt_fmt]):
            guesses.append('time')

    if all([cusip(x) for x in sample_col if x.strip()]):
        guesses.append('cusip')
    if all([isin(x) for x in sample_col if x.strip()]):
        guesses.append('isin')
    if all([sedol(x) for x in sample_col if x.strip()]):
        guesses.append('sedol')

    nums = [num_any(x, no_nan=True) for x in sample_col if x.strip()]
    if all(nums):
        if all([(x == int(x)) for x in nums]):
            guesses.append('int')
        else:
            guesses.append('float')
    guesses.append('str')
    return guesses


def check_type(sample_col, dtype):
    if 'float' in dtype:
        return all([num_any(x, no_nan=True) for x in sample_col if x.strip()])
    elif 'int' in dtype:
        nums = [num_any(x, no_nan=True) for x in sample_col if x.strip()]
        return all([(x == int(x)) for x in nums])
    elif 'cusip' in dtype:
        return all([cusip(x) for x in sample_col if x.strip()])
    elif 'isin' in dtype:
        return all([isin(x) for x in sample_col if x.strip()])
    elif 'sedol' in dtype:
        return all([sedol(x) for x in sample_col if x.strip()])
    elif any(d in dtype for d in ['datetime', 'date', 'time']):
        try:
            sample_dt_fmt = set(chain(
                map(lambda x: _guess_datetime_format(x, dayfirst=False), sample_col),
                map(lambda x: _guess_datetime_format(x, dayfirst=True), sample_col)))
        except ValueError:
            sample_dt_fmt = set([None])

        if 'datetime' in dtype:
            return all([valid_datetime(x) for x in sample_dt_fmt])
        elif 'date' in dtype:
            return all([valid_date(x) for x in sample_dt_fmt])
        elif 'time' in dtype:
            return all([valid_time(x) for x in sample_dt_fmt])
    elif 'str' in dtype:
        return True
    else:
        raise TypeError('Not a valid column type:', ' '.join(dtype))
