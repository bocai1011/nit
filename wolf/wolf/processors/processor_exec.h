#ifndef PROCESSOR_EXEC
#define PROCESSOR_EXEC

// Execution blotter processor.

#include "wolf.h"

namespace processor_exec{
	msg
		err_notional_or_mult = make_msg("Either notional or mult must be provided."),
		err_no_sym_fields = make_msg("Must have at least one symbol related field: symbol, cusip, sedol, isin.");

	// Execution blotter processor. This processor takes in a registrant's blotter
	// and spits out to disk a cleaned and normalized execution blotter (called exec) with
	// the cleaned and normalized symbol and account tables split off into separate files.
	// An error.csv is also generated.
	template<char delimiter>
	int process(std::string ini_filename){
		row_log * log = new row_log();
		auto exec_firm = new csv_source<delimiter>(ini_filename, log);
		assert_or_fail(exec_firm, err_input_file);

		std::string dir = exec_firm->info.get_dir_path();
		auto exec     = new csv_writer(dir / "exec.csv", log);
		auto security = new csv_writer(dir / "security.csv", log);
		auto account  = new csv_writer(dir / "account.csv", log);
		auto errors   = new csv_writer(dir / "error.csv", log);
		assert_or_fail(exec, err_output_file);
		assert_or_fail(security, err_output_file);
		assert_or_fail(account, err_output_file);
		assert_or_fail(errors, err_output_file);

		mapped_column::using_table(exec_firm);
		mapped_column exec_date("exec_date", q::type::date);
		mapped_column exec_time("exec_time", q::type::time);
		mapped_column settle_date("settle_date", q::type::date);
		mapped_column settle_time("settle_time", q::type::time);

		mapped_column price("price", q::type::real);
		mapped_column qty("qty", q::type::real);
		mapped_column notional("notional", q::type::real);
		mapped_column mult("mult", q::type::real);
		mapped_column commission("commission", q::type::real);
		mapped_column fee("fee", q::type::real);

		mapped_column symbol("symbol", q::type::string);
		mapped_column symbol_desc("symbol_desc", q::type::string);
		mapped_column cusip("cusip", q::type::int_);
		mapped_column sedol("sedol", q::type::int_);
		mapped_column isin("isin", q::type::int_);
		mapped_column sec_type("sec_type", q::type::string);
		mapped_column fx("fx", q::type::string);

		mapped_column acct_id("acct_id", q::type::string);
		mapped_column acct_desc("acct_desc", q::type::string);

		// Foreign key maps for securities and accounts.
		fk_map security_fks, account_fks;

		// This is the string we will stuff hashes into for creating
		// security/account foreign keys.
		std::string hash;
		hash.reserve(1024);

		std::cout << "Wolf report: Files opened. Columns created. Beginning to clean.\n";

		// Create the header rows for each of the output tables.
		exec->header << exec_date << exec_time << settle_date << settle_time << price << qty << notional << mult << commission << fee << "security" << "account" << csv::eol;
		security->header << "security" << symbol << symbol_desc << cusip << sedol << isin << sec_type << csv::eol;
		account->header << "account" << acct_id << acct_desc << csv::eol;

		exec_firm->csv->process_line(); // Burn the header line.

		while (exec_firm->csv->process_line()){
			// Exec table row logic
			exec->row << exec_date << exec_time << settle_date << settle_time
				<< price << qty << notional << mult << commission << fee;

			if (!notional && !mult){
				log->add_error(err_notional_or_mult);
			}

			// Symbol master row logic
			hash.clear();
			hash << symbol << cusip << sedol << isin;

			if (hash.length() > 0){
				hash << symbol_desc << sec_type << fx;
				auto security_fk = security_fks[hash];
				if (!security_fk){
					security_fk = security_fks.new_fk(hash);

					security->row << security_fk << symbol << symbol_desc << cusip << sedol << isin << sec_type << csv::eol;
				}

				exec->row << security_fk;
			}
			else{
				log->add_error(err_no_sym_fields);
			}

			// Account master row logic
			hash.clear();
			hash << acct_id << acct_desc;

			if (hash.length() > 0){
				auto account_fk = account_fks[hash];
				if (!account_fk){
					account_fk = account_fks.new_fk(hash);

					account->row << account_fk << acct_id << acct_desc << csv::eol;
				}

				exec->row << account_fk;
			}
			else{
				log->add_error(err_no_sym_fields);
			}

			// Error reporting
			if (log->has_errors()){
				// There were errors on this line, so we choose not to have anything
				// in the cleaned output. Revert to remove anything we added to the output.
				exec->revert();

				// Write the malformed source row and the error log to a row
				// in the error output table.
				errors->row << exec_firm->line() << log << csv::eol;
			}
			else{
				exec->row << csv::eol;
			}

			log->clear();
		}

		// Cleanup
		delete exec_firm;

		delete exec;
		delete security;
		delete account;
		delete errors;

		return 0;
	}
}

#endif
