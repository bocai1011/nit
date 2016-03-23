#ifndef ROW_LOG
#define ROW_LOG

// row_log class

#include <vector>

#include "type_processors/process_helper.h"

// Holds an error/warning from parsing a cell and the name of the cell that generated it.
struct cell_msg{
	msg cellMsg;
	msg cellName;

	// Takes a message and a cell name.
	inline cell_msg(msg cellMsg_, msg cellName_) : cellMsg(cellMsg_), cellName(cellName_){
	}
};

class row_log{
public:
	row_log(){
		errors.reserve(100);
		warnings.reserve(100);
	}
	
	~row_log(){
	}

	// Writes all errors and warnings to the given output buffer.
	inline void write_row_report(char * & output) const{
		copy_chars(output, "errors:: ");
		for (auto& err : errors){
			if (err.cellName != NULL){
				copy_chars(output, "(");
				copy_msg(output, err.cellName);
				copy_chars(output, ") ");
			}
			copy_msg(output, err.cellMsg);
			copy_chars(output, "; ");
		}

		if (warnings.size() == 0) return;

		copy_chars(output, "warnings:: ");
		for (auto& warn : warnings){
			if (warn.cellName != NULL){
				copy_chars(output, "(");
				copy_msg(output, warn.cellName);
				copy_chars(output, ") ");
			}
			copy_msg(output, warn.cellMsg);
			copy_chars(output, "; ");
		}
	}

	// Clears the error list and the warning list.
	inline void clear(){
		errors.clear();
		warnings.clear();
	}

	// Whether any errors currently exist.
	inline bool has_errors(){
		return errors.size() > 0;
	}

	// Add the given error to the log, with no cell specified.
	inline void add_error(msg errorMsg){
		errors.push_back(cell_msg(errorMsg, NULL));
	}

	// Add the given error to the log, with a specific cell specified.
	inline void add_error(msg errorMsg, msg cellName){
		errors.push_back(cell_msg(errorMsg, cellName));
	}

	// Add the given warning to the log, with a specific cell specified.
	inline void add_warning(msg warningMsg, msg cellName){
		warnings.push_back(cell_msg(warningMsg, cellName));
	}

private:
	std::vector<cell_msg> errors, warnings;
};

#endif
