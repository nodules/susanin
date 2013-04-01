BIN_PATH := ./node_modules/.bin/
JSHINT := $(BIN_PATH)jshint
UGLIFYJS := $(BIN_PATH)uglifyjs
NODEUNIT := $(BIN_PATH)nodeunit

all: tests
tests: jshint unittests

unittests: $(NODEUNIT) minify
	$(NODEUNIT) tests

jshint: $(JSHINT)
	$(JSHINT) susanin.js

minify: $(UGLIFYJS)
	$(UGLIFYJS) susanin.js > susanin.min.js

$(JSHINT) $(UGLIFYJS) $(NODEUNIT):
	npm install

hook: .git/hooks/pre-commit
.git/hooks/pre-commit: pre-commit
	cp $< $@

.PHONY: jshint test minify hook all unittests