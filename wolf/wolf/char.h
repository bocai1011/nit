#ifndef CHAR_HELPER
#define CHAR_HELPER

// Utility functions for dealing with characters within char buffers.

#include <iostream>

// When we must pass std::string objects around we prefer to do so with pointers
// to avoid allocation. msg is the preferred way to use std::string when possible.
typedef std::string const * msg;

// Create a msg from a string.
// Usage:: msg m = make_msg("This is a message!");
#define make_msg(s) new std::string(s)

// Returns the given error message.
// Must be used in a function with a msg return type.
#define error(error_msg) return error_msg;

// Checks the given boolean expression and returns the given error
// message if it isn't true.
// Must be used in a function with a msg return type.
#define require(boolean_expr, error_msg) if (!(boolean_expr)){ error(error_msg); }

// Hands off control flow from one function that returns msg to
// a subfunction that returns msg.
// sub_process must be a function with a msg return type.
// If sub_process returns an error msg then the calling function will return that error.
// Must be used in a function with a msg return type.
#define check(sub_process) { msg result = (sub_process); if (result) error(result); }

// Used within a function called by check to return control flow
// without any error message. 
#define no_issues() return NULL;

// A range of characters from a source buffer.
// The range is given by a start and end address in the buffer.
// We prefer to pass a char_range around instead of a std::string or a char *.
// This allows us to point directly into an existing char buffer without
// copying overhead, while also keeping track of the end of the string.
// char * strings must be null terminated, but we can't insert a null char
// into the reference buffer.
struct char_range{
	char const * start, * end;
};

// Copy a single char from the source buffer into the destination buffer.
inline void copy_char(char * & destination, char const * const source){
	*destination++ = *source;
}

// Copy a specified number of chars from the source buffer into the destination buffer.
inline void copy_chars(char * & destination, char const * const source, int count){
	memcpy(destination, source, count);
	destination += count;
}

// Copy a compile-time-const-length char array into the destination buffer.
template<int length>
inline void copy_chars(char * & destination, const char(&source)[length]){
	memcpy(destination, source, length - 1);
	destination += length - 1;
}

// Copy a range of chars from a source buffer into the destination buffer, with
// start and end of the source specified.
inline void copy_chars(char * & destination, char const * const start, char const * const end){
	memcpy(destination, start, end - start);
	destination += end - start;
}

// Copy a msg into the destination buffer.
inline void copy_msg(char * & destination, msg m){
	copy_chars(destination, m->c_str(), m->size());
}

// End the current cell in the destination buffer, appending a comma.
inline void copy_endcell(char * & destination){
	copy_char(destination, ",");
}

// End the current row in the destination buffer, appending a new line \r\n.
inline void copy_newline(char * & destination){
	copy_chars(destination, "\r\n", 2);
}

#endif
