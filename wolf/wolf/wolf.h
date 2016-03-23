#ifndef WOLF
#define WOLF

// Standard header includes for any wolf processor

#include <iostream>
#include <string>
#include <unordered_map>

#include <cstdio>
#include <ctime>

#include "util.h"
#include "char.h"

#include "csv/csv_parser.h"
#include "csv/csv_source.h"
#include "csv/csv_writer.h"

#include "csv/row_log.h"
#include "csv/mapped_column.h"
#include "csv/fk_map.h"

#include "q.h"

// Standard IO error messages
msg
	err_input_file = make_msg("Wolf report: Error initializing input source.\n"),
	err_output_file = make_msg("Wolf report: Error initializing output csv file.\n");

#endif