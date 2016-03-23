#ifndef PROCESS_STRING
#define PROCESS_STRING

// String processing functions.

#include <iostream>

#include "csv/csv_writer.h"
#include "type_processors/process_helper.h"

namespace process{
	namespace helper{
		namespace string_helper{
			msg
				err_string_short = make_msg("Invalid string format: string must be at least one character long.");
		}
	}

	// Process string. Any tricky characters such as commas, quotes, or line breaks will be removed,
	// to allow KDB to correctly process the string from a csv file without getting confused.
	inline msg process_string(char const * start, char const * const end, char * & output){
		using namespace helper;
		using namespace helper::string_helper;

		require(end - start >= 1, err_string_short);

		char const * c = start;
		do{
			switch (*c)
			{
			case '\"':
			case ',':
			case '\n':
			case '\r':
				break;

			default:
				copy_char(output, c);
				break;
			}
		} while (++c < end);

		no_issues();
	}
}

#endif
