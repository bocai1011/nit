#ifndef PROCESS_real
#define PROCESS_real

// Real value processing functions.

#include <iostream>

#include "csv/csv_writer.h"
#include "type_processors/process_helper.h"

namespace process{
	namespace helper{
		namespace real_helper{
			msg
				err_real_short = make_msg("Invalid real format: real must be at least one character long."),
				err_confused_negative = make_msg("Invalid real format: confused if this is a negative number or not."),
				err_unexpected_close_paren = make_msg("Invalid real format: close parenthesis before any number seen."),
				err_no_digits = make_msg("Invalid real format: no digits were found."),
				err_not_a_digt = make_msg("Invalid real format: invalid character when a digit was expected");
		}
	}

	// Process real value.
	// Parenthesis will be interpreted as accounting notation and
	// will stripped and replaced with a minus sign.
	// Parenthesis in conjunction with a minus sign will throw a parse error.
	// Any other characters besides digits or periods (decimal) will throw a parse error.
	inline msg process_real(char const * start, char const * const end, char * & output){
		using namespace helper;
		using namespace helper::real_helper;

		require(end - start >= 1, err_real_short);

		char const * c = start;
		bool negative = false;

		do{
			if (is_digit(*c) || *c == '.'){
				break;
			}

			switch (*c){
			case '-':
			case '(':
				if (negative){
					error(err_confused_negative);
				}
				negative = true;
				break;
			case ')':
				error(err_unexpected_close_paren);
				break;
			}
		} while (++c < end);

		require(c < end, err_no_digits);

		if (negative){
			copy_char(output, "-");
		}

		do{
			if (is_digit(*c) || *c == '.'){
				copy_char(output, c);
			}
			else if (*c == ')'){
				continue;
			}
			else{
				error(err_not_a_digt);
			}
		} while (++c < end);

		no_issues();
	}
}

#endif
