// Entry point for wolf console application.

#include <tclap/CmdLine.h>

#include "processors/processor_exec.h"

namespace wolf{
	std::string ini_path;
	char delimiter;
	bool wait_at_end = false;

	// Takes the command line args from main and parses them, setting global var
	void parse_command_line(int argc, char* argv[]){
		// Wrap everything in a try block because TCLAP will throw exceptions
		// when it encounters command line parsing problems.
		try {
			// Define the command line object, and insert a message
			// that describes the program. The "Command description message" 
			// is printed last in the help text. The second argument is the 
			// delimiter (usually space) and the last one is the version number. 
			// The CmdLine object parses the argv array based on the Arg objects
			// that it contains. 
			TCLAP::CmdLine cmd("wolf, data cleaner", ' ', "1.0");

			// Define a switch argument.
			// A switch arg is a boolean argument with a default value, whose value
			// gets switched when the argument is present in the command line.
			TCLAP::SwitchArg waitSwitch("w", "wait", "wait for user input after processing is complete", cmd, wait_at_end);

			// -d --delim <char>, specify the delimiter. Optional. Defaults to comma.
			// tclap usage: Define a char value argument.
			// A value arg defines a flag and a type of value that it expects,
			TCLAP::ValueArg<char> delimArg("d", "delim", "specify the delimiter character in the source csv file.", false, ',', "delimiter", cmd);

			// -i --ini <path>, specify the path to the .ini configuration file. Required.
			// tclap usage: Define a string value argument.
			// A value arg defines a flag and a type of value that it expects,
			TCLAP::ValueArg<std::string> iniArg("i", "ini", "specify the .ini processing configuration file", true, std::string(), "path", cmd);

			// Parse the argv array.
			cmd.parse(argc, argv);

			// Get the value parsed by each arg. 
			ini_path = iniArg.getValue();
			delimiter = delimArg.getValue();
			wait_at_end |= waitSwitch.getValue();

			std::cout << ".ini file specified: " << ini_path << std::endl;
			std::cout << "Using '" << delimiter << "' delimiter." << std::endl;
		}
		catch (TCLAP::ArgException &e)  // catch any exceptions
		{
			std::cerr << "error: " << e.err() << " for arg " << e.argId() << std::endl;
		}
	}
}

// Call a main process.
// The process being called must be templated on a csv delimiter char.
// This macro will call the correct template specialized process
// for the delimiter given via the command line args.
#define wolf_go(function, args)                                                                      \
	switch(wolf::delimiter){                                                                         \
		case ',': function<','>(args); break;                                                        \
		case '|': function<'|'>(args); break;                                                        \
		case ';': function<';'>(args); break;                                                        \
		default:                                                                                     \
			std::cout << "Unsupported csv cell delimiter '" << wolf::delimiter << "'." << std::endl; \
			break;                                                                                   \
	}

int main(int argc, char * argv[]){
	wolf::parse_command_line(argc, argv);

	std::clock_t start = std::clock();

	// Run the wolf processor (potentially multiple times for benchmarking)
	int trials = 1;
	for (int i = 0; i < trials; i++){
		wolf_go(processor_exec::process, wolf::ini_path);
	}

	// Processing finished: give a report
	double duration = (std::clock() - start) / (double)CLOCKS_PER_SEC / trials;
	std::cout << "Wolf report: " << duration << " seconds spent cleaning.\n";

	// Wolf is done, if wait flag is specified we wait for the user to press enter
	if (wolf::wait_at_end){
		std::cout << "Press enter to continue." << std::endl;
		std::cin.get();
	}

	return 0;
}