#ifndef CSV_WRITER
#define CSV_WRITER

// csv_writer class

#include <iostream>
#include <fstream>

#include "type_processors/process_helper.h"
#include "csv/mapped_column.h"

#include "csv/row_log.h"

enum csv{ eoc, eol };

class csv_writer;

// A row of a csv file that can be written into.
// This is a helper class used by a csv_writer to encapsulate writes
// to the current (latest) row.
class csv_row{
public:
	// Takes a csv_writer that this row belongs to.
	csv_row(csv_writer * const writer_) : writer(writer_){
	}

	inline csv_row & operator <<(csv flag);                    // Write a csv specific flag into the row (end of cell, end of row)
	inline csv_row & operator <<(mapped_column & cell);        // Write the processed contents of a mapped_column into a cell.
	inline csv_row & operator <<(std::string const * const s); // Write a string into a cell.
	inline csv_row & operator <<(std::string const s);         // Write a string into a cell.
	inline csv_row & operator <<(char_range const & info);     // Write a string into a cell.
	inline csv_row & operator <<(row_log const & log);         // Write the contents of the log into a cell.
	inline csv_row & operator <<(row_log const * const log);   // Write the contents of the log into a cell.

	// Write a /not/ null-terminated char array into a cell.
	template<int length>
	inline csv_row & operator <<(const char(&source)[length]){
		writer->write_cell(source);
		return *this;
	}

private:
	csv_writer * const writer;
};

// A header row of a csv file that can be written into.
// This is a helper class used by a csv_writer to encapsulate writes
// to the header row.
class csv_header{
public:
	// Takes a csv_writer that this header belongs to.
	csv_header(csv_writer * const writer_) : writer(writer_), row(writer_){
	}

	inline csv_header & operator <<(mapped_column & cell);	   // Write the mapped named of the mapped_column into a cell.

	// csv_header behaves differently only for taking in mapped_columns,
	// for which it uses the mapped_column's name instead of processing it's
	// current cell value. For all other inputs csv_header performs the same
	// as csv_row, taking input and putting it into a cell.
	// To avoid duplication of logic we simply pass on these function calls
	// to and underlying csv_row object.
	// We use composition instead of inheritance here to avoid the potential
	// overhead cost of virtual functions.

	inline csv_header & operator <<(csv flag)                     { row << flag; return *this; }
	inline csv_header & operator <<(std::string const * const s)  { row << s;    return *this; }
	inline csv_header & operator <<(std::string const s)          { row << s;    return *this; }
	inline csv_header & operator <<(char_range const & info)      { row << info; return *this; }

	template<int length>
	inline csv_header & operator <<(const char(&source)[length])  { row << source; return *this; }

private:
	csv_writer * const writer;
	csv_row row;
};

// Handles writing to a csv output file.
class csv_writer{
public:
	csv_writer(std::string output_filename, row_log * log_) : log(log_), row(this), header(this){
		os = new std::ofstream(output_filename, std::ostream::binary);

		if (!os){
			fail_flag = true;
			return;
		}

		buffer_offset = buffer;
		last_commit = buffer;
	}
	
	~csv_writer(){
		if (os){
			close();
		}

		delete buffer;
	}

	// Erase all bytes appended since the last commit.
	// This effectively reverts this writer to the state it 
	// was in the last time commit was called.
	void revert(){
		buffer_offset = last_commit;
	}

	// Clear all chars already placed in the buffer to
	// be ready for writing to disk. Before this is called
	// anything placed in the buffer will not be written
	// to disk.
	void commit(){
		last_commit = buffer_offset;

		if (buffer_offset > buffer_cutoff){
			writer_buffer_to_disk();
		}
	}

	// Close the underlying output stream, making sure
	// to write any pending bytes to disk.
	void close(){
		if (buffer_offset > buffer){
			writer_buffer_to_disk();
		}

		os->close();

		delete os;
		os = NULL;
	}

	inline void copy(char const * const start, char const * const end){
		copy_chars(buffer_offset, start, end);
	}

	inline void copy(char const * const source, int length){
		copy_chars(buffer_offset, source, length);
	}

	inline void write_cell(char_range const * const info){
		copy(info->start, info->end);
		end_cell();
	}

	inline void write_cell(char_range const & info){
		copy(info.start, info.end);
		end_cell();
	}

	inline void write_cell(char const * const start, char const * const end){
		copy(start, end);
		end_cell();
	}

	inline void write_cell(std::string const * const s){
		copy(&(*s)[0], s->length());
		end_cell();
	}

	inline void write_cell(std::string const s){
		copy(&s[0], s.length());
		end_cell();
	}

	template<int length>
	inline void write_cell(const char(&source)[length]){
		copy_chars(buffer_offset, source);
		end_cell();
	}

	inline void write_cell(mapped_column & cell){
		cell.process(buffer_offset, log);
		end_cell();
	}

	inline void write_header(std::initializer_list<std::string> list){
		end_cell();
	}

	// End the current cell by appending a comma.
	inline void end_cell(){
		copy_endcell(buffer_offset);
	}

	// End the current row by appending \r\n.
	// Consider using commit_row instead.
	inline void end_row(){
		copy_newline(buffer_offset);
	}

	// End the current row, removing any unused trailing comma.
	// Afterward commit all appended bytes.
	inline void commit_row(){
		backspace();
		end_row();
		commit();
	}

	// Remove the last appended char.
	inline void backspace(){
		buffer_offset--;
		if (buffer_offset < last_commit){
			last_commit = buffer_offset;
		}
	}

	// Whether this writer is still valid and hasn't failed.
	operator bool() const{
		return !fail_flag && os;
	}

	// Where we are at in our char output buffer.
	char * buffer_offset;

	// The current row. Use this to write into the buffer.
	csv_row row;

	// The csv's header row, assuming no rows have been written yet.
	// Use this to write into the buffer when writing header data.
	csv_header header;

private:
	bool fail_flag = false;

	std::ofstream * os;
	row_log * log;

	size_t buffer_size = 1 << 16;
	char * buffer = new char[2 * buffer_size];
	char * buffer_cutoff = buffer + (1 << 16);
	char * last_commit;

	void writer_buffer_to_disk(){
		os->write(buffer, buffer_offset - buffer);
		buffer_offset = buffer;
		last_commit = buffer;
	}
};

inline csv_row & csv_row::operator << (csv flag){
	switch (flag){
	case csv::eol: writer->commit_row(); break; // End current line/row
	case csv::eoc: writer->end_cell(); break;   // End current cell
	}

	return *this;
}

inline csv_row & csv_row::operator <<(mapped_column & cell){
	writer->write_cell(cell);
	return *this;
}

inline csv_row & csv_row::operator <<(std::string const * const s){
	writer->write_cell(s);
	return *this;
}

inline csv_row & csv_row::operator <<(std::string const s){
	writer->write_cell(s);
	return *this;
}

inline csv_row & csv_row::operator <<(char_range const & info){
	writer->write_cell(info);
	return *this;
}

inline csv_row & csv_row::operator <<(row_log const & log){
	log.write_row_report(writer->buffer_offset);
	return *this;
}

inline csv_row & csv_row::operator <<(row_log const * const log){
	log->write_row_report(writer->buffer_offset);
	return *this;
}

inline csv_header & csv_header::operator <<(mapped_column & cell){
	writer->write_cell(cell.name);
	return *this;
}

#endif
