#ifndef PROCESS_UINT
#define PROCESS_UINT

// Unsigned int and related numeric id types processing functions.

#include <iostream>

#include "csv/csv_writer.h"
#include "type_processors/process_helper.h"

namespace process{
	namespace helper{
		namespace uint_helper{
			msg
				err_uint_short = make_msg("Invalid unsigned integer format: number must be at least one character long."),
				err_uint_nondigit = make_msg("Invalid unsigned integer format: non-digit character."),

				err_cusip_len = make_msg("Invalid cusip: cusip must be 8 or 9 digits long."),
				err_sedol_len = make_msg("Invalid sedol: sedol must be 6 or 7 digits long."),
				err_isin_len = make_msg("Invalid isin: isin must be 11 digits long.");
		}
	}

	// Process unsigned int.
	inline msg process_uint(char const * start, char const * const end, char * & output){
		using namespace helper;
		using namespace helper::uint_helper;

		require(end - start >= 1, err_uint_short);

		char const * c = start;
		do{
			require(is_digit(*c), err_uint_nondigit);
			copy_char(output, c);
		} while (++c < end);

		no_issues();
	}

	// Process unsigned int and require certain length.
	template<unsigned len>
	inline msg process_uint(char const * start, char const * const end, char * & output, msg error_msg){
		char * const output_start = output;

		check(process_uint(start, end, output));

		const size_t uint_len = output - output_start;
		require(uint_len == len, error_msg);

		no_issues();
	}

	// Process unsigned int and require one of two possible lengths.
	template<unsigned len1, unsigned len2>
	inline msg process_uint(char const * start, char const * const end, char * & output, msg error_msg){
		char * const output_start = output;

		check(process_uint(start, end, output));

		const size_t uint_len = output - output_start;
		require(uint_len == len1 || uint_len == len2, error_msg);

		no_issues();
	}

	// Process cusip
	inline msg process_cusip(char const * start, char const * const end, char * & output){
		using namespace helper::uint_helper;
		return process_uint<8, 9>(start, end, output, err_cusip_len);
	}

	// Process sedol
	inline msg process_sedol(char const * start, char const * const end, char * & output){
		using namespace helper::uint_helper;
		return process_uint<6, 7>(start, end, output, err_sedol_len);
	}

	// Process isin
	inline msg process_isin(char const * start, char const * const end, char * & output){
		using namespace helper::uint_helper;
		return process_uint<11>(start, end, output, err_isin_len);
	}

}

#endif
