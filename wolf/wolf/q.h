#ifndef Q
#define Q

// Contains q type information.

#include <string>

namespace q{
	// q types
	enum type{
		boolean,
		guid,
		byte,
		short_,
		int_,
		long_,
		real,
		float_,
		char_,
		string,
		symbol,
		timestamp,
		month,
		date,
		datetime,
		timespan,
		minute,
		second,
		time,
	};

	// Null values for all types
	std::string const
		null_bool = "0b",
		null_guid = "0Ng",
		null_byte = "",
		null_short = "0Nh",
		null_int = "0N",
		null_long = "0Nj",
		null_real = "0Ne",
		null_float = "0n",
		null_char = " ",
		null_string = " ",
		null_symbol = "`",
		null_timestamp = "0Np",
		null_month = "0Nm",
		null_date = "0Nd",
		null_datetime = "0Nz",
		null_timespan = "0Nn",
		null_minute = "0Nu",
		null_second = "0Nv",
		null_time = "0Nt";

	// Get null value (as a string) for a given q type
	std::string null(type t){
		switch (t)
		{
		case boolean: return null_bool;
		case guid: return null_guid;
		case byte: return null_byte;
		case short_: return null_short;
		case int_: return null_int;
		case long_: return null_long;
		case real: return null_real;
		case float_: return null_float;
		case char_: return null_char;
		case string: return null_string;
		case symbol: return null_symbol;
		case timestamp: return null_timestamp;
		case month: return null_month;
		case date: return null_date;
		case datetime: return null_datetime;
		case timespan: return null_timespan;
		case minute: return null_minute;
		case second: return null_second;
		case time: return null_time;
		default: throw std::invalid_argument("Provided type t has no null value is an invalid type.");
		}
	}
}

#endif
