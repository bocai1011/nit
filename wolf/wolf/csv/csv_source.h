#ifndef CSV_SOURCE
#define CSV_SOURCE

// csv_source class

#include <map>

#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/ini_parser.hpp>

#include "csv/row_log.h"

// Contains information about source columns and how they should be cleaned/mapped.
// The majority of information here is specified and read in from an .ini for each column.
// Values may be overriden or given default fallbacks by logic in a specific wolf processor.
struct column_info{
	int columnNum;                // The column number in the source csv.
	std::string mapping;          // The named of the column in the destination (cleaned) csv.

	bool required;                // Whether this column /must/ be present to avoid an error being thrown.
	std::string type;             // The type of data in the column, e.g.: string, date, datetime, real, etc.
	std::string datetime_format;  // If the type is datetime this is the format of the datetime.
	std::string default;          // A default value to use in the destination, cleaned csv column
	                              // when there is an error parsing a source cell.

	column_info(){
		columnNum = -1;
		required = false;
	}

	// Whether this is a valid column.
	operator bool() const{
		return columnNum >= 0;
	}
};

// Holds information about a csv source file that we wish to read /and/ process data from.
// This information is used inside a csv_source object to control how data is processed.
// This class should only be used inside csv_source. We have separated it into
// a second class only to avoid having this portion need to be templated on the csv delimiter.
class csv_info{
public:
	unsigned int num_columns; // Number of mapped columns.
	char_range * row_info;    // Array of cells in the current row of the source csv

	// Takes an .ini configuration file and derives parsing/validation setup from it.
	csv_info(std::string ini_filename){
		ingest_ini(ini_filename);
	}

	// The column number of a mapped column name.
	// Usage: column_number("exec_date")
	column_info column_number(std::string mapped_name){
		return columns[mapped_name];
	}

	// The output directory path specified by the .ini configuration file.
	std::string get_dir_path() const{
		return dir_path;
	}

	std::map<std::string, column_info> columns;
	std::string csv_filename, dir_path;

	// Process the given .ini configuration file.
	void ingest_ini(std::string ini_filename){
		num_columns = 0;

		// Load the .ini
		boost::property_tree::ptree pt;
		read_ini(ini_filename, pt);

		std::string
			columnSubstr = "COLUMN ",
			globalName = "GLOBAL";

		// Loop through all sections
		for (auto& section : pt)
		{
			// Check if this is the global section
			auto start = section.first.find(globalName);
			if (start != std::string::npos){
				// Loop through items in this column's section
				for (auto& key : section.second){
					if (key.first == "data_path"){
						csv_filename = key.second.get_value<std::string>();
					}
					else if (key.first == "dir_path"){
						dir_path = key.second.get_value<std::string>();
					}
				}
			}

			// Check if this is a column section
			start = section.first.find(columnSubstr);
			if (start != std::string::npos){
				++num_columns;

				// Get the string portion of the column section number
				auto numberStr = section.first.substr(start + columnSubstr.length());

				// Convert string portion to an int
				int columnNum = std::stoi(numberStr);

				std::cout << columnNum << std::endl;

				// Loop through items in this column's section
				column_info info;
				info.columnNum = columnNum;

				// Note fields about this column that we care about.
				for (auto& key : section.second){
					if (key.first == "mapping"){ // mapped column name
						info.mapping = key.second.get_value<std::string>();
					}
					else if (key.first == "required"){ // whether the column is required
						info.required = key.second.get_value<std::string>() == "true";
					}
					else if (key.first == "default"){ // default value for this column if a cell is invalid or missing
						info.default = key.second.get_value<std::string>();
					}
					else if (key.first == "type"){ // data type of the column
						info.type = key.second.get_value<std::string>();
					}
					else if (key.first == "datetime_format"){ // datetime format, assuming the column type is datetime
						info.datetime_format = key.second.get_value<std::string>();
					}
				}

				if (info.mapping.length() > 0){
					columns[info.mapping] = info;
				}
			}
		}
	}
};

// csv_source handles a csv source file that we wish to read /and/ process data from.
// This is the primary class used for dealing with source csv files.
// Duties:
// * Maintain knowledge about the columns that are being processed:
//     how they should be treated, validated, formatted, etc. (handled by csv_info).
// * Generate and validate the above knowledge from an input .ini configuration file.
// * Maintain errors as they arise from parsing and validating the data.
// If you only want to parse a csv and not process/validate/clean data, use csv_parser.
template<char delimiter>
class csv_source{
public:
	csv_parser<delimiter> * csv;    // Handles the underlying csv.
	row_log * log;                  // Parsing errors will go into this log.
	csv_info info;                  // Stores all the non-templated info about the source csv.

	// Takes an .ini configuration file and derives parsing/validation setup from it.
	// Takes a row_log object to log errors while parsing data.
	csv_source(std::string ini_filename, row_log * log_) : log(log_), info(ini_filename){
		is = new std::ifstream(info.csv_filename, std::ifstream::binary);

		if (!is){
			fail_flag = true;
			return;
		}

		csv = new csv_parser<delimiter>(is, info.num_columns);
		info.row_info = csv->row_info;

		if (!csv){
			fail_flag = true;
			return;
		}
	}
	
	~csv_source(){
		is->close();

		delete csv;
		delete is;
	}

	// Whether this csv_source is valid.
	operator bool() const{
		return !fail_flag;
	}

	// The current line from the csv being processed.
	char_range const line(){
		char_range info;
		info.start = csv->line_start();
		info.end   = csv->line_end();

		return info;
	}

private:
	bool fail_flag = false;

	std::ifstream * is;
};

#endif
