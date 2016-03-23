#ifndef PROCESS_DATETIME
#define PROCESS_DATETIME

// Datetime processor functions.

#include <string>

#include "type_processors/process_helper.h"
#include "type_processors/process_time.h"

namespace process{
	// Process datetime, assuming a yyyy/mm/ddThh:mm:ss.fffff format
	// (that is year/month/day hour:minute:second.float),
	// where /, T, and : can be any delimiters,
	// and fffff can be an arbitrary length floating point number.
	inline msg process_datetime_yyyy_mm_dd_hh_mm_ss_f(char const * start, char const * const end, char * & output){
		using namespace helper;
		using namespace helper::date_helper;

		char const * c = start;
		check((process<piece::yyyy, piece::mm, piece::dd>(c, end, output)));

		skip_separator(c);
		copy_char(output, "T");

		check(process_time_hh_mm_ss_f(c, end, output));

		no_issues();
	}
}

#endif
