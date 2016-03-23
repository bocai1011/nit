#ifndef PROCESS_DATE
#define PROCESS_DATE

// Date processor functions.

#include <string>

#include "type_processors/process_helper.h"

namespace process{
	namespace helper{
		namespace date_helper{
			msg
				err_date_short = make_msg("Invalid date format: date string is too short for specified format."),

				err_date_mm_1 = make_msg("Invalid date format: invalid month (mm), check first digit."),
				err_date_mm_2 = make_msg("Invalid date format: invalid month (mm), check second digit."),
				err_date_dd_1 = make_msg("Invalid date format: invalid day (dd), check first digit."),
				err_date_dd_2 = make_msg("Invalid date format: invalid day (dd), check second digit."),
				err_date_yy_1 = make_msg("Invalid date format: invalid year (yy), check first digit."),
				err_date_yy_2 = make_msg("Invalid date format: invalid year (yy), check second digit."),
				err_date_yyyy_1 = make_msg("Invalid date format: invalid year (yyyy), check first digit."),
				err_date_yyyy_2 = make_msg("Invalid date format: invalid year (yyyy), check second digit."),
				err_date_yyyy_3 = make_msg("Invalid date format: invalid year (yyyy), check third digit."),
				err_date_yyyy_4 = make_msg("Invalid date format: invalid year (yyyy), check fourth digit."),

				err_date_y_short = make_msg("Invalid date format: reached end of date string while parsing year."),
				err_date_m_short = make_msg("Invalid date format: reached end of date string while parsing month."),
				err_date_d_short = make_msg("Invalid date format: reached end of date string while parsing day.");

			// The position in the buffer where year (yyyy) begins.
			// (Assumes we are starting at the beginning of the date string).
			inline char * get_date_yyyy_start(char * source){
				return source;
			}

			// The position in the buffer where month (mm) begins.
			// (Assumes we are starting at the beginning of the date string).
			inline char * get_date_mm_start(char * source){
				return source + 5;
			}

			// The position in the buffer where day (dd) begins.
			// (Assumes we are starting at the beginning of the date string).
			inline char * get_date_dd_start(char * source){
				return source + 8;
			}

			// Process 2-character month
			template <int guaranteed_len>
			msg process_mm(char const * & c, char const * const end, char * output){
				char * o = get_date_mm_start(output);

				if (guaranteed_len < 1) { require(c < end, err_date_m_short); }
				require(is_less_than_or_equals(*c, '1'), err_date_mm_1);
				copy_char(o, c);

				++c;
				if (guaranteed_len < 2) { require(c < end, err_date_m_short); }
				require(is_digit(*c), err_date_mm_2);
				copy_char(o, c);

				++c;
				copy_char(o, "-");

				no_issues();
			}

			// Process 1-or-2-character month
			template <int guaranteed_len>
			msg process_xm(char const * & c, char const * const end, char * output){
				char * o = get_date_mm_start(output);

				if (guaranteed_len < 1) { require(c < end, err_date_m_short); }

				char first = *c;
				require(is_digit(first), err_date_mm_1);

				++c;
				if (c < end && is_digit(*c)){
					require(is_less_than_or_equals(first, '1'), err_date_mm_1);
					copy_char(o, &first);
					copy_char(o, c);
					++c;
				}
				else{
					copy_char(o, "0");
					copy_char(o, &first);
				}

				copy_char(o, "-");

				no_issues();
			}

			// Process 2-character day
			template <int guaranteed_len>
			msg process_dd(char const * & c, char const * const end, char * output){
				char * o = get_date_dd_start(output);

				if (guaranteed_len < 1) { require(c < end, err_date_d_short); }
				require(is_less_than_or_equals(*c, '3'), err_date_dd_1);
				copy_char(o, c);

				++c;
				if (guaranteed_len < 2) { require(c < end, err_date_d_short); }
				require(is_digit(*c), err_date_dd_2);
				copy_char(o, c);

				++c;
				copy_char(o, "-");

				no_issues();
			}

			// Process 1-or-2-character day
			template <int guaranteed_len>
			msg process_xd(char const * & c, char const * const end, char * output){
				char * o = get_date_dd_start(output);

				if (guaranteed_len < 1) { require(c < end, err_date_d_short); }

				char first = *c;
				require(is_digit(first), err_date_dd_1);

				++c;
				if (c < end && is_digit(*c)){
					require(is_less_than_or_equals(first, '3'), err_date_dd_1);
					copy_char(o, &first);
					copy_char(o, c);
					++c;
				}
				else{
					copy_char(o, "0");
					copy_char(o, &first);
				}

				copy_char(o, "-");

				no_issues();
			}

			// Process 2-character year
			template <int guaranteed_len>
			msg process_yy(char const * & c, char const * const end, char * output){
				char * o = get_date_yyyy_start(output);

				copy_chars(o, "20", 2);

				if (guaranteed_len < 1) { require(c < end, err_date_y_short); }
				require(is_digit(*c), err_date_yy_1);
				copy_char(o, c);

				++c;
				if (guaranteed_len < 2) { require(c < end, err_date_y_short); }
				require(is_digit(*c), err_date_yy_2);
				copy_char(o, c);

				++c;
				copy_char(o, "-");

				no_issues();
			}

			// Process 4-character year
			template <int guaranteed_len>
			msg process_yyyy(char const * & c, char const * const end, char * output){
				char * o = get_date_yyyy_start(output);

				if (guaranteed_len < 1) { require(c < end, err_date_y_short); }
				require(is_less_than_or_equals(*c, '2'), err_date_yyyy_1);
				copy_char(o, c);

				++c;
				if (guaranteed_len < 2) { require(c < end, err_date_y_short); }
				require(is_digit(*c), err_date_yyyy_2);
				copy_char(o, c);

				++c;
				if (guaranteed_len < 3) { require(c < end, err_date_y_short); }
				require(is_digit(*c), err_date_yyyy_3);
				copy_char(o, c);

				++c;
				if (guaranteed_len < 4) { require(c < end, err_date_y_short); }
				require(is_digit(*c), err_date_yyyy_4);
				copy_char(o, c);

				++c;
				copy_char(o, "-");

				no_issues();
			}

			// Enumeration of all date "pieces" and their different formats.
			// x represents an optional digit.
			enum piece { xd, dd, xm, mm, yy, yyyy };

			// Macros for creating "properties", which are template implementations of value lookups.
			#define create_property(type, property_, default_val) template<type t> struct property_{ static const unsigned value = default_val; };
			#define set_prop(name, property_, val) template<> struct property_ < name >{ static const unsigned value = val; };
			#define get_prop(name, property_) property_<name>::value

			// min_length property, which specifies the minimum possible string length of a date piece.
			// Usage: min_length<xd>::value; Yields: 1
			create_property(piece, min_length, 0);
			set_prop(piece::xd, min_length, 1);
			set_prop(piece::dd, min_length, 2);
			set_prop(piece::xm, min_length, 1);
			set_prop(piece::mm, min_length, 2);
			set_prop(piece::yy, min_length, 2);
			set_prop(piece::yyyy, min_length, 4);

			// max_length property, which specifies the maximum possible string length of a date piece.
			// Usage: max_length<xd>::value; Yields: 2
			create_property(piece, max_length, 0);
			set_prop(piece::xd, max_length, 2);
			set_prop(piece::dd, max_length, 2);
			set_prop(piece::xm, max_length, 2);
			set_prop(piece::mm, max_length, 2);
			set_prop(piece::yy, max_length, 2);
			set_prop(piece::yyyy, max_length, 4);

			// Process a single date piece.
			// We template on both the date piece we are formating,
			// but also the guaranteed string length we have to work with.
			template<piece component, int guaranteed_length_>
			inline msg process_piece(char const * & start, char const * const end, char * & output){
				switch (component){
				case piece::xd:   check(process_xd   < guaranteed_length_ >(start, end, output)); return NULL;
				case piece::dd:   check(process_dd   < guaranteed_length_ >(start, end, output)); return NULL;
				case piece::xm:   check(process_xm   < guaranteed_length_ >(start, end, output)); return NULL;
				case piece::mm:   check(process_mm   < guaranteed_length_ >(start, end, output)); return NULL;
				case piece::yy:   check(process_yy   < guaranteed_length_ >(start, end, output)); return NULL;
				case piece::yyyy: check(process_yyyy < guaranteed_length_ >(start, end, output)); return NULL;
				default: return NULL;
				}
			}

			// Process a full day and month and year formatted string, with separators between the parts.
			// We template on all three parts of the date.
			template<piece p1, piece p2, piece p3>
			inline msg process(char const * & start, char const * const end, char * & output){
				// Pre-calculate the /assumed/ guaranteed minimum string length we have to work with
				// when we begin parsing the first, second, and third date part.
				const int
					guaranteed_length_1 = min_length<p1>::value + min_length<p2>::value + min_length<p3>::value + 2,
					guaranteed_length_2 = guaranteed_length_1 - max_length<p1>::value - 1,
					guaranteed_length_3 = guaranteed_length_2 - max_length<p2>::value - 1;

				// Make sure our assumed guaranteed minimum string length is correct.
				require(end - start >= guaranteed_length_1, err_date_short);

				char const * c = start;
				char * o = output;

				// Process each piece, feeding in what we know to be the
				// guaranteed minimum string length at each point.

				process_piece<p1, guaranteed_length_1>(c, end, o);

				skip_separator(c);

				process_piece<p2, guaranteed_length_2>(c, end, o);

				skip_separator(c);

				process_piece<p3, guaranteed_length_3>(c, end, o);

				output += 10;
				start = c;

				no_issues();
			}

			// Process a full day and month and year formatted string, with /no/ separators between the parts.
			// We template on all three parts of the date.
			template<piece p1, piece p2, piece p3>
			inline msg process_no_separators(char const * & start, char const * const end, char * & output){
				// Pre-calculate the /assumed/ guaranteed minimum string length we have to work with
				// when we begin parsing the first, second, and third date part.
				const int
					guaranteed_length_1 = min_length<p1>::value + min_length<p2>::value + min_length<p3>::value,
					guaranteed_length_2 = guaranteed_length_1 - max_length<p1>::value,
					guaranteed_length_3 = guaranteed_length_2 - max_length<p2>::value;

				// Make sure our assumed guaranteed minimum string length is correct.
				require(end - start >= guaranteed_length_1, err_date_short);

				char const * c = start;
				char * o = output;

				// Process each piece, feeding in what we know to be the
				// guaranteed minimum string length at each point.

				process_piece<p1, guaranteed_length_1>(c, end, o);

				process_piece<p2, guaranteed_length_2>(c, end, o);

				process_piece<p3, guaranteed_length_3>(c, end, o);

				output += 10;
				start = c;

				no_issues();
			}
		}
	}

	// Below are template instantiations of all date formats we support.

	inline msg process_date_xm_xd_yyyy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::xm, piece::xd, piece::yyyy>(start, end, output);
	}

	inline msg process_date_mm_dd_yyyy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::mm, piece::dd, piece::yyyy>(start, end, output);
	}

	inline msg process_date_xd_xm_yyyy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::xd, piece::xm, piece::yyyy>(start, end, output);
	}

	inline msg process_date_dd_mm_yyyy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::dd, piece::mm, piece::yyyy>(start, end, output);
	}

	inline msg process_date_yyyy_xm_xd(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::yyyy, piece::xm, piece::xd>(start, end, output);
	}

	inline msg process_date_yyyy_mm_dd(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::yyyy, piece::mm, piece::dd>(start, end, output);
	}

	inline msg process_date_yyyy_xd_xm(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::yyyy, piece::xd, piece::xm>(start, end, output);
	}

	inline msg process_date_yyyy_dd_mm(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::yyyy, piece::dd, piece::mm>(start, end, output);
	}

	inline msg process_date_xm_xd_yy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::xm, piece::xd, piece::yy>(start, end, output);
	}

	inline msg process_date_mm_dd_yy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::mm, piece::dd, piece::yy>(start, end, output);
	}

	inline msg process_date_xd_xm_yy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::xd, piece::xm, piece::yy>(start, end, output);
	}

	inline msg process_date_dd_mm_yy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::dd, piece::mm, piece::yy>(start, end, output);
	}

	inline msg process_date_yy_xm_xd(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::yy, piece::xm, piece::xd>(start, end, output);
	}

	inline msg process_date_yy_mm_dd(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::yy, piece::mm, piece::dd>(start, end, output);
	}

	inline msg process_date_yy_xd_xm(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::yy, piece::xd, piece::xm>(start, end, output);
	}

	inline msg process_date_yy_dd_mm(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process<piece::yy, piece::dd, piece::mm>(start, end, output);
	}

	inline msg process_date_mmddyyyy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process_no_separators<piece::mm, piece::dd, piece::yyyy>(start, end, output);
	}

	inline msg process_date_ddmmyyyy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process_no_separators<piece::dd, piece::mm, piece::yyyy>(start, end, output);
	}

	inline msg process_date_yyyymmdd(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process_no_separators<piece::yyyy, piece::mm, piece::dd>(start, end, output);
	}

	inline msg process_date_yyyyddmm(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process_no_separators<piece::yyyy, piece::dd, piece::mm>(start, end, output);
	}

	inline msg process_date_mmddyy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process_no_separators<piece::mm, piece::dd, piece::yy>(start, end, output);
	}

	inline msg process_date_ddmmyy(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process_no_separators<piece::dd, piece::mm, piece::yy>(start, end, output);
	}

	inline msg process_date_yymmdd(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process_no_separators<piece::yy, piece::mm, piece::dd>(start, end, output);
	}

	inline msg process_date_yyddmm(char const * start, char const * const end, char * & output){
		using namespace helper::date_helper;
		return process_no_separators<piece::yy, piece::dd, piece::mm>(start, end, output);
	}
}

#endif
