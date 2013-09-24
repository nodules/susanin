BIN_PATH := ./node_modules/.bin/
JSHINT := $(BIN_PATH)jshint
JSCS := $(BIN_PATH)jscs
NODEUNIT := $(BIN_PATH)nodeunit
ISTANBUL := $(BIN_PATH)istanbul

all: test

test: jshint jscs $(NODEUNIT) $(ISTANBUL)
	$(ISTANBUL) test ./test/runner.js

unittests: $(NODEUNIT)
	$(NODEUNIT) test/tests

jshint: $(JSHINT)
	$(JSHINT) lib test

jscs: $(JSCS)
	$(JSCS) lib test

coverage: $(ISTANBUL)
	$(ISTANBUL) cover ./test/runner.js

$(JSHINT) $(NODEUNIT) $(ISTANBUL) $(JSCS):
	npm install

.PHONY: jshint test all unittests coverage
