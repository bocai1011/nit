#ifndef MAPPED_COLUMN
#define MAPPED_COLUMN

// mapped_column class

#include "csv/csv_source.h"
#include "csv/csv_parser.h"

#include "csv/row_log.h"

#include "type_processors/process_helper.h"
#include "type_processors/process_date.h"
#include "type_processors/process_datetime.h"
#include "type_processors/process_time.h"
#include "type_processors/process_string.h"
#include "type_processors/process_real.h"
#include "type_processors/process_uint.h"

#include "q.h"

// Mapped column structure, mapping an input column to an output column.
// Stores the cell boundaries of a cell from the source column
// from the current row being processed by source column's table.
class mapped_column{
public:
	msg
		err_missing_required_cell = make_msg("Missing required cell"),
		warn_missing_cell         = make_msg("Missing optional cell");

	std::string name;   // Name of the mapped column.
	column_info column; // Information about this column mapping
	char_range * cell;  // Source cell

	// Sets the given table as the default csv_source for any mapped_columns created.
	template<char delimiter>
	static void using_table(csv_source<delimiter> * table){
		current_table_info = &table->info;
	}

	// Takes a source csv and a mapped column name.
	mapped_column(std::string name_) : name(name_){
		column = current_table_info->column_number(name);

		int n = column.columnNum;
		cell = &current_table_info->row_info[n];

		if (column.type == "time")      { process_func = &process::process_time_hh_mm_ss_f; }
		if (column.type == "datetime")  { process_func = &process::process_datetime_yyyy_mm_dd_hh_mm_ss_f; }
		if (column.type == "string")    { process_func = &process::process_string; }
		if (column.type == "real")      { process_func = &process::process_real; }
		if (column.type == "cusip")     { process_func = &process::process_cusip; }
		if (column.type == "sedol")     { process_func = &process::process_sedol; }
		if (column.type == "isin")      { process_func = &process::process_isin; }

		if (column.type == "date"){
			if      (column.datetime_format == "[m]m-[d]d-yyyy"){ process_func = &process::process_date_xm_xd_yyyy; }
			else if (column.datetime_format == "mm-dd-yyyy")    { process_func = &process::process_date_mm_dd_yyyy; }
			else if (column.datetime_format == "[d]d-[m]m-yyyy"){ process_func = &process::process_date_xd_xm_yyyy; }
			else if (column.datetime_format == "dd-mm-yyyy")    { process_func = &process::process_date_dd_mm_yyyy; }
			else if (column.datetime_format == "yyyy-[m]m-[d]d"){ process_func = &process::process_date_yyyy_xm_xd; }
			else if (column.datetime_format == "yyyy-mm-dd")    { process_func = &process::process_date_yyyy_mm_dd; }
			else if (column.datetime_format == "yyyy-[d]d-[m]m"){ process_func = &process::process_date_yyyy_xd_xm; }
			else if (column.datetime_format == "yyyy-dd-mm")    { process_func = &process::process_date_yyyy_dd_mm; }
			else if (column.datetime_format == "[m]m-[d]d-yy")  { process_func = &process::process_date_xm_xd_yy; }
			else if (column.datetime_format == "mm-dd-yy")      { process_func = &process::process_date_mm_dd_yy; }
			else if (column.datetime_format == "[d]d-[m]m-yy")  { process_func = &process::process_date_xd_xm_yy; }
			else if (column.datetime_format == "dd-mm-yy")      { process_func = &process::process_date_dd_mm_yy; }
			else if (column.datetime_format == "yy-[m]m-[d]d")  { process_func = &process::process_date_yy_xm_xd; }
			else if (column.datetime_format == "yy-mm-dd")      { process_func = &process::process_date_yy_mm_dd; }
			else if (column.datetime_format == "yy-[d]d-[m]m")  { process_func = &process::process_date_yy_xd_xm; }
			else if (column.datetime_format == "yy-dd-mm")      { process_func = &process::process_date_yy_dd_mm; }
			else if (column.datetime_format == "mmddyyyy")      { process_func = &process::process_date_mmddyyyy; }
			else if (column.datetime_format == "ddmmyyyy")      { process_func = &process::process_date_ddmmyyyy; }
			else if (column.datetime_format == "yyyymmdd")      { process_func = &process::process_date_yyyymmdd; }
			else if (column.datetime_format == "yyyyddmm")      { process_func = &process::process_date_yyyyddmm; }
			else if (column.datetime_format == "mmddyy")        { process_func = &process::process_date_mmddyy; }
			else if (column.datetime_format == "ddmmyy")        { process_func = &process::process_date_ddmmyy; }
			else if (column.datetime_format == "yymmdd")        { process_func = &process::process_date_yymmdd; }
			else if (column.datetime_format == "yyddmm")        { process_func = &process::process_date_yyddmm; }
			else                                                { process_func = &process::process_date_yyyy_mm_dd; }
		}

		successfullyProcessed = false;
	}

	mapped_column(std::string name_, std::string const & default_) : mapped_column(name_){
		column.default = default_;
	}

	mapped_column(std::string name_, q::type type_) : mapped_column(name_, q::null(type_)){
	}

	// Whether the current cell source for this row exists and was successfully processed.
	inline operator bool() const{
		return successfullyProcessed;
	}

	// Whether the current cell source for this row exists.
	inline bool exists() const{
		if (column.columnNum >= 0 && cell->end > cell->start){
			return true;
		}
		else{
			return false;
		}
	}

	// Copy the default string for this column into the output.
	inline void copy_default(char * & output) const{
		copy_chars(output, column.default.c_str(), column.default.size());
	}

	// Process current cell source for this row into the output.
	inline bool process(char * & output, row_log * log){
		successfullyProcessed = false;

		if (!column){
			copy_default(output);
			return true;
		}
		
		if (!exists()){
			if (column.required){
				log->add_error(err_missing_required_cell, &name);
				return false;
			}
			else{
				log->add_warning(warn_missing_cell, &name);
				copy_default(output);
				return true;
			}
		}

		// Save the current output position in case we have to revert
		// to the current position after an error in processing the cell.
		char * save_output_position = output;

		msg result = (*process_func)(cell->start, cell->end, output);
		
		if (result){
			if (column.required){
				log->add_error(result, &name);   // Once there is an error we don't care about the output position
				                                 // because we will erase the entire output line from the output buffer.
			}
			else{
				log->add_warning(result, &name); // Since this column isn't required, the parse error is merely a warning.

				output = save_output_position;   // Revert the current output position
				copy_default(output);            // and copy in the default string instead.
			}

			return false;
		}

		successfullyProcessed = true;
		return true;
	}

private:
	// Pointer to the processing function for this column's cells.
	msg (*process_func) (char const * start, char const * const end, char * & output);

	bool successfullyProcessed;

	static csv_info * current_table_info;
};

csv_info * mapped_column::current_table_info = NULL;

#endif
