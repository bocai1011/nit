#ifndef FK_MAP
#define FK_MAP

// fk_map class, representing a foreign key map.

#include <string>
#include <unordered_map>

#include "csv/mapped_column.h"

// The following helper functions are used for constructing string hashes.

// JFN 10/16/14: perhaps a bit pendantic, but perhaps these two inline functs should be moved to util.h
// Append the processed contents of a mapped_column to an std::string.
inline void operator +=(std::string & s, mapped_column const & column){
	if (column.exists()){
		s.append(column.cell->start, column.cell->end - column.cell->start);
	}
}

// Append the processed contents of a mapped_column to an std::string.
inline std::string & operator <<(std::string & s, mapped_column const & column){
	if (column.exists()){
		s.append(column.cell->start, column.cell->end - column.cell->start);
	}

	return s;
}

// Foreign key map class. fk_maps take string hashes and return 
// unique foreign keys.
class fk_map{
public:
	// Add a new foreign key to the map to correspond to the given hash.
	// Returns the new foreign key for the given hash.
	inline std::string const * new_fk(std::string const & hash){
		auto newPair = map.emplace(hash, std::to_string(next_fk++));
		return &newPair.first->second;
	}

	// Returns the foreign key of a string hash.
	// If the hash wasn't found, we return NULL instead.
	std::string const * operator[](std::string const & hash){
		auto pair = map.find(hash);
		if (pair != map.end()){
			return &pair->second;
		}
		else{
			return NULL;
		}
	}

private:
	std::unordered_map<std::string, std::string> map;
	unsigned int next_fk = 0;
};

#endif
