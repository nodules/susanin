BIN_PATH := ./node_modules/.bin/
JSHINT := $(BIN_PATH)jshint
UGLIFYJS := $(BIN_PATH)uglifyjs
NODEUNIT := $(BIN_PATH)nodeunit
ISTANBUL := $(BIN_PATH)istanbul

all: test

test: jshint $(NODEUNIT) $(ISTANBUL)
	$(ISTANBUL) test ./test/runner.js

unittests: $(NODEUNIT)
	$(NODEUNIT) test/tests

jshint: $(JSHINT)
	$(JSHINT) susanin.js

minify: $(UGLIFYJS)
	$(UGLIFYJS) susanin.js > susanin.min.js

coverage: $(ISTANBUL)
	$(ISTANBUL) cover ./test/runner.js

$(JSHINT) $(UGLIFYJS) $(NODEUNIT) $(ISTANBUL):
	npm install

hook: .git/hooks/pre-commit
.git/hooks/pre-commit: pre-commit
	-ln -s  $(PWD)/$< $@

.PHONY: jshint test minify hook all unittests coverage
