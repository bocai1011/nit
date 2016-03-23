from collections import namedtuple

# this is used to contain all the information regarding how a table should be built
GenericDataLayout = namedtuple(
    'GenericDataLayout',
    [
    'mapping_desc',
    'data_name',
    'core_hdf_cols',
    'core_fk_cols',
    'core_data_cols',
    'core_dtime_cols',
    'table_description',
    'sorted_on'
    ]
)