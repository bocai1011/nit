#ifndef UTIL
#define UTIL

// Utility functions and declerations for high level wolf usage, specifically IO and IO error catching.

// Checks a given assertion. If the assertion is false print a failure message to console and return -1 (failure)
// Must be used in a function with an int return type, presumably the int main function.
// Usage: assert_or_fail(1 > 0, "Error: arithmetic is broken")
#define assert_or_fail(assertion, failure_message) if (!(assertion)){ std::cout << "[" << #assertion << "] " << failure_message; return -1; }

// Combine two paths into a single path
// Usage: "dir/subdir/" / filename
std::string operator/(std::string const & dir, std::string const & path){
	return dir + "/" + path;
}

#endif
