PRJ_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))/

BIN_DIR := $(PRJ_DIR)node_modules/.bin/
JSHINT := $(BIN_DIR)jshint
JSCS := $(BIN_DIR)jscs
NODEUNIT := $(BIN_DIR)nodeunit
ISTANBUL := $(BIN_DIR)istanbul
BORSCHIK := $(BIN_DIR)borschik

all: build test

.PHONY: test
test: jshint jscs $(NODEUNIT) $(ISTANBUL)
	$(ISTANBUL) test ./test/runner.js

.PHONY: unittests
unittests: $(NODEUNIT) build
	$(NODEUNIT) test/tests
	ROUTER=dist $(NODEUNIT) test/tests

.PHONY: jshint
jshint: $(JSHINT)
	$(JSHINT) lib test

.PHONY: jscs
jscs: $(JSCS)
	$(JSCS) lib test

.PHONY: coverage
coverage: $(ISTANBUL)
	$(ISTANBUL) cover ./test/runner.js

$(JSHINT) $(NODEUNIT) $(ISTANBUL) $(JSCS) $(BORSCHIK):
	npm install

.PHONY: hook
hook: .git/hooks/pre-commit
.git/hooks/pre-commit: pre-commit
	cp $< $@

build: $(BORSCHIK)
	$(BORSCHIK) -i $(PRJ_DIR)dist/susanin.tmp.js -o $(PRJ_DIR)dist/susanin.js -m no
	$(BORSCHIK) -i $(PRJ_DIR)dist/susanin.tmp.js -o $(PRJ_DIR)dist/susanin.min.js
