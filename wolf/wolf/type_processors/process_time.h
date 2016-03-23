#ifndef process_time_DATE
#define process_time_DATE

// Time processing functions.

#include <iostream>

#include "csv/csv_writer.h"
#include "type_processors/process_helper.h"

namespace process{
	namespace helper{
		namespace time_helper{
			msg
				err_time_short = make_msg("Invalid time format: too short, HH:mm:ss:f format must be at least 8 characters long."),

				err_time_hh_1 = make_msg("Invalid date format: invalid hour (hh), check first digit."),
				err_time_hh_2 = make_msg("Invalid date format: invalid hour (hh), check second digit."),
				err_time_mm_1 = make_msg("Invalid date format: invalid minute (mm), check first digit."),
				err_time_mm_2 = make_msg("Invalid date format: invalid minute (mm), check second digit."),
				err_time_ss_1 = make_msg("Invalid date format: invalid second (ss), check first digit."),
				err_time_ss_2 = make_msg("Invalid date format: invalid second (ss), check second digit."),
				err_time_float = make_msg("Invalid date format: invalid digit in the float portion (f).");

			// Process 2-character hour
			msg process_time_hh(char const * & c, char const * const end, char * output){
				require(is_less_than_or_equals(*c, '2'), err_time_hh_1);
				require(is_digit(*++c), err_time_hh_2);

				++c;

				no_issues();
			}

			// Process 2-character minute
			msg process_time_mm(char const * & c, char const * const end, char * output){
				require(is_less_than(*c, '6'), err_time_mm_1);
				require(is_digit(*++c), err_time_mm_2);

				++c;

				no_issues();
			}

			// Process 2-character second
			msg process_time_ss(char const * & c, char const * const end, char * output){
				require(is_less_than(*c, '6'), err_time_ss_1);
				require(is_digit(*++c), err_time_ss_2);

				++c;

				no_issues();
			}

			// Process float time
			msg process_time_float(char const * & c, char const * const end, char * output){
				while (c < end && is_digit(*c)){
					++c;
				}

				char const * after_digits = c;
				while (after_digits < end && *after_digits == ' '){
					++after_digits;
				}

				require(after_digits >= end, err_time_float);

				no_issues();
			}
		}
	}

	// Process time, assuming a hh:mm:ss.fffff format, where : can be any delimiter,
	// and fffff can be an arbitrary length floating point number.
	inline msg process_time_hh_mm_ss_f(char const * start, char const * const end, char * & output){
		using namespace helper;
		using namespace helper::time_helper;

		require(end - start >= 8, err_time_short);

		char const * c = start;
		char * o = output;

		process_time_hh(c, end, o);

		skip_separator(c);

		process_time_mm(c, end, o);

		skip_separator(c);

		process_time_ss(c, end, o);

		if (c < end){
			skip_separator(c);
			process_time_float(c, end, o);
		}

		memcpy(output, start, c - start);

		// Normalize separators. Make sure they are all ':'
		output[2] = ':';
		output[5] = ':';
		if (c < end){
			output[8] = ':';
		}

		output += c - start;

		no_issues();
	}
}

#endif
