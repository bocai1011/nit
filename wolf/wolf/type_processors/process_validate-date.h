#ifndef PROCESS_VALIDATE_DATE
#define PROCESS_VALIDATE_DATE

// Date processing/validation functions, including checking that days are valid given the specified month/year (including leap years).
// This file is a work in progress. Use process-date.h for now.

#include <iostream>

namespace process{
	namespace helper{
		namespace validate_date_helper{
			void process_date_mm_dd_yy(char * start, char * end){
				if (end - start < 8){
					std::cout << "Invalid date format: too short, mm-dd-yy format must be at least 8 characters long.";
					return;
				}

				int days_in_month = 0;

				char * c = start;

				// Process month
				switch (*c){
				case '0': // First digit is 0
					switch (*++c)
					{
					case '2': // 01: February
						days_in_month = 28;
						break;

					case '4': // 03: April
					case '6': // 05: June
					case '9': // 07: September
						days_in_month = 30;
						break;

					case '1': // 01: January
					case '3': // 03: March
					case '5': // 05: May
					case '7': // 07: July
					case '8': // 08: August
						days_in_month = 31;
						break;

					default:
						std::cout << "Invalid date format: invalid month, check second digit.";
						return;
					}
					break;

				case '1': // First digit is 1
					switch (*++c)
					{
					case '1': // 11: November
						days_in_month = 30;
						break;

					case '0': // 10: October
					case '2': // 12: December
						days_in_month = 31;
						break;

					default:
						std::cout << "Invalid date format: invalid month, check second digit.";
						return;
					}
					break;

				default:
					std::cout << "Invalid date format: invalid month, check first digit.";
					return;
				}

				++c; // Skip separator

				// Process day
				bool is_leap_day = false;
				if (days_in_month == 28){
					switch (*++c){
					case '0': // First digit is 0
					case '1': // First digit is 1
						++c;
						if (*c > '9' || *c < '0'){
							std::cout << "Invalid date format: invalid day, check second digit.";
							return;
						}
						break;

					case '2': // First digit is 2
						++c;
						if (*c > '9' || *c < '0'){
							std::cout << "Invalid date format: invalid day, check second digit.";
							return;
						}
						else if (*c == '9'){
							is_leap_day = true;
						}
						break;

					default:
						std::cout << "Invalid date format: invalid day, check first digit.";
						return;
					}
				}
				else{
					int day = 0;
					switch (*++c){
					case '0': // First digit is 0
					case '1': // First digit is 1
					case '2': // First digit is 2
						++c;
						if (*c > '9' || *c < '0'){
							std::cout << "Invalid date format: invalid day, check second digit.";
							return;
						}
						break;

					case '3': // First digit is 3
						switch (*++c)
						{
						case '0': // Second digit is 0
							break;

						case '1': // Second digit is 1
							if (days_in_month == 30){
								std::cout << "Invalid date format: invalid day, there are only 30 days in this month.";
								return;
							}
							break;

						default:
							std::cout << "Invalid date format: invalid month, check second digit.";
							return;
						}
						break;

					default:
						std::cout << "Invalid date format: invalid month, check first digit.";
						return;
					}
				}

				// Process year
				switch (*++c){
				case '0': // First digit is 0
					switch (*++c)
					{
					case '2': // 01: February
						days_in_month = 28;
						break;

					case '4': // 03: April
					case '6': // 05: June
					case '9': // 07: September
						days_in_month = 30;
						break;

					case '1': // 01: January
					case '3': // 03: March
					case '5': // 05: May
					case '7': // 07: July
					case '8': // 08: August
						days_in_month = 31;
						break;

					default:
						std::cout << "Invalid date format: invalid month, check second digit.";
						return;
					}
					break;

				case '1': // First digit is 1
					switch (*++c)
					{
					case '1': // 11: November
						days_in_month = 30;
						break;

					case '0': // 10: October
					case '2': // 12: December
						days_in_month = 31;
						break;

					default:
						std::cout << "Invalid date format: invalid month, check second digit.";
						return;
					}
					break;

				default:
					std::cout << "Invalid date format: invalid month, check first digit.";
					return;
				}

			}
		}
	}
}

#endif
