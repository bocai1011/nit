#ifndef PROCESS_HELPER
#define PROCESS_HELPER

// Helper functions for processing cells of various data types.

#include "char.h"

namespace process{
	namespace helper{
		// Whether the given digit (character) is less than a given upper digit.
		// (Assuming the character represents a digit)
		inline bool is_less_than(char const & c, char const & upper){
			return c < upper && c >= '0';
		}

		// Whether the given digit (character) is less than or equal to a given upper digit.
		// (Assuming the character represents a digit)
		inline bool is_less_than_or_equals(char const & c, char const & upper){
			return c <= upper && c >= '0';
		}

		// Whether the given char is a digt (0,1,2,3,4,5,6,7,8,9,0).
		inline bool is_digit(char const & c){
			return c <= '9' && c >= '0';
		}

		// Whether the given char is /not/ a digit (0,1,2,3,4,5,6,7,8,9,0).
		inline bool not_digit(char const & c){
			return c > '9' || c < '0';
		}

		// Skips over a single character, presumed to a separator.
		inline void skip_separator(char const * & c){
			++c;
		}
	}
}

#endif
