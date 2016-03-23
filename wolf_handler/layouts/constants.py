from pandas import NaT
from tables import Filters

#Constants

#HDF Constants
COMP_LEVEL = 0
COMP_LIB = 'zlib'
SHUFFLE = False
DEFAULT_FILTER = Filters(complevel=COMP_LEVEL, complib=COMP_LIB, shuffle=SHUFFLE)
NOCOMP_FILTER = Filters(complevel=0, complib=COMP_LIB)
HIGHCOMP_FILTER = Filters(complevel=9, complib=COMP_LIB, shuffle=SHUFFLE)
TRANSACTION_SIZE = 500000

# Nulls in pytables don't exist, so we are going to set everything to be the class
# or, for strings, ''
UINT32_NULL = int(0)
UINT64_NULL = int(0)
INT32_NULL = int(-2147483648)
INT64_NULL = int(-9223372036854775808)
STRING_NULL = str('')
FLOAT32_NULL = float('NaN')
FLOAT64_NULL = float('NaN')
FX_DEFAULT = str('USD')
DATETIME64_NULL = NaT.value
# this is 0 so you can use a bitwise check on just itself instead of x != FK_NULL
FOREIGN_KEY_NULL = int(0)

#the name for data tables within the grouping
TABLE_DEFAULT_NAME = 'table'

#file name extensions
CDEX_DEFAULT_EXTN = 'cdex'
DATA_DEFAULT_EXTN = 'data'
SQL3_DEFAULT_EXTN = 'sqlite'
TEMP_DEFAULT_EXTN = 'temp'

