#ifndef CSV_PARSER
#define CSV_PARSER

// csv_parser class.

#include <iostream>
#include <fstream>

#include "type_processors/process_helper.h"

// Maximum number of columns for any csv file we will process.
// We choose a large upper bound here. God help whoever has more than 1024 columns.
int const MAX_COLS = 1024;

// Parses a given input stream on demand, character by character.
template<char delimiter>
class csv_parser{
public:
	char_range * row_info; // Array of cells
	unsigned int const num_columns;

	// Takes an input stream to parse a csv from, and the number of expected columns.
	// The parser will not fail if there are more or less columns than specified,
	// but it is not recommended to read data from columns that come after what you expect to exist.
	csv_parser(std::istream * is_, unsigned int const num_columns_ = MAX_COLS) : is(is_), num_columns(num_columns_){
		eol_flag = false;
		fail_flag = false;
		done_flag = false;

		bytes_read = 0;
		buffer_end = NULL;

		buffer_size = 1 << 16;
		buffer = new char[2 * buffer_size];

		c = buffer;

		start_of_line = buffer;
		end_of_line = buffer;
		
		row_info = new char_range[MAX_COLS];

		cur_processor = processor::eol;
	}

	~csv_parser(){
		delete[] buffer;
	}

	// Address within buffer of the start of the current line.
	char const * line_start() const{
		return start_of_line;
	}

	// Address within buffer of the end of the current line.
	char const * line_end() const{
		return end_of_line;
	}

	// Length of the current line.
	size_t line_len() const{
		return end_of_line - start_of_line;
	}

	// Whether this parser is still valid and has more csv info to parse.
	operator bool() const {
		return !done_flag;
	}

	// Process a line of the input csv file, returning once an end of line
	// is reached, or the end of the input file is reached.
	bool process_line(){
		if (done_flag) return false;

		memset(row_info, 0, sizeof(char_range) * num_columns);
		cur_cell = row_info;

		clear_temps();
		start_of_line = c;
		start_of_cell = c;

		while (c < buffer_end)
		{
			process(*c);

			if (eol_flag){
				eol_flag = false;
				return true;
			}

			++c;
		}

		if (!*is){
			done_flag = true;

			if (!eol_flag && start_of_line){
				if (cur_processor != processor::eol){
					set_end_of_line(buffer[bytes_read]);
				}
				return true;
			}
			else{
				return false;
			}
		}

		read_bytes();

		clear_temps();
		end_of_line = 0;
		cur_processor = processor::white_space;

		return process_line();
	}

private:
	// The csv parser is a state machine. This enumeration are the possible states.
	enum processor{
		raw_text,
		quoted,
		quoted_onquote,
		white_space,
		eol,
	};

	bool eol_flag;                // True once the end of a line is reached.

	processor cur_processor;      // Current state of the parser state machine.
	
	char_range * cur_cell;        // Current cell we are processing.

	std::istream * is;            // Input stream we are streaming the csv data from.
	int buffer_read_into_offset;  // How many chars into the buffer we have successfully parsed.
								  // A chars isn't considered successfuly parsed until the csv row
								  // it's part of has been completely parsed.

	int bytes_read;               // How many bytes we have just read from the input stream.

	bool fail_flag;               
	bool done_flag;               

	int buffer_size;
	char * buffer;                // Underlying buffer that we store bytes read from stream to
	                              // and from which we directly read and parse.

	char const 
		* buffer_end,             // The end of the buffer.
		* start_of_cell,          // Used to mark the start of a cell we are parsing within buffer.
		* start_of_line,          // Used to mark the start of a line/row we are parsing within buffer.
		* end_of_line,            // Used to mark the end of the last line/row we parsed within buffer.
		* c;                      // The current char we are parsing within buffer.

	inline void process(char const &c);

	// Reset state machine to default state.
	inline void clear_temps(){
		cur_processor = processor::white_space;
	}

	// Marks the given position as the end of the current cell we are processing.
	inline void set_end_of_cell(char const &c){
		cur_cell->start = start_of_cell;
		cur_cell->end   = &c;

		cur_cell++;

		clear_temps();

		start_of_cell = &c + 1;
	}

	// Marks the given position as the end of the current line we are processing.
	inline void set_end_of_line(char const &c){
		set_end_of_cell(c);

		end_of_line = &c;
	}

	// The following functions are single-character processor functions
	// dependent on which state the state machine is in.
	// Each function processes a single character and may also switch the state.

	inline void process_raw_text(char const &c){
		switch (c){
		case delimiter:
			set_end_of_cell(c);
			cur_processor = processor::white_space;
			break;
		case '"':
			cur_processor = processor::quoted;
			break;
		case '\n':
		case '\r':
			set_end_of_line(c);
			cur_processor = processor::eol;
			break;
		default:
			break;
		}
	}

	inline void process_quoted(char const &c){
		switch (c){
		case '"':
			cur_processor = processor::quoted_onquote;
			break;
		default:
			break;
		}
	}

	inline void process_quoted_onquote(char const &c){
		switch (c){
		case '"':
			cur_processor = processor::quoted;
			break;
		default:
			cur_processor = processor::raw_text;
			process(c);
			break;
		}
	}

	inline void process_white_space(char const &c){
		switch (c){
		case ' ':
			break;
		default:
			start_of_cell = &c;
			cur_processor = processor::raw_text;
			process(c);
			break;
		}
	}

	inline void process_eol(char const &c){
		switch (c){
		case '\n':
		case '\r':
			break;
		default:
			eol_flag = true;
			break;
		}
	}

	// Used to read bytes from the input stream into the buffer.
	void read_bytes(){
		bool const first_read = buffer_end == NULL;
		int partial_line_len = 0;

		if (!first_read){
			// We may be in the middle of processing a csv line.
			// We can't just fill the buffer with new data, because then all
			// of our previously noted cell addressed in this csv line will be
			// invalid. So, we copy the already processed characters of the
			// current csv line to the beginning of buffer and read new bytes 
			// into the memory immediately afterward in buffer.
			// To make sure the noted cell addresses are correct we'll have to
			// reprocess this whole line.
			partial_line_len = (buffer + bytes_read) - (start_of_line);
			memcpy(buffer, start_of_line, partial_line_len);
		}

		is->read(buffer + partial_line_len, buffer_size);

		bytes_read = partial_line_len + static_cast<int>(is->gcount());
		buffer_end = buffer + bytes_read;
		c = buffer;
	}
};

// Process a single character.
template<char delimiter>
inline void csv_parser<delimiter>::process(char const &c){
	switch (cur_processor){
	case processor::raw_text:       process_raw_text(c);       break;
	case processor::quoted:         process_quoted(c);         break;
	case processor::quoted_onquote: process_quoted_onquote(c); break;
	case processor::eol:            process_eol(c);            break;
	case processor::white_space:    process_white_space(c);    break;
	}
}

#endif
