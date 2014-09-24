PRJ_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))/

BIN_DIR := $(PRJ_DIR)node_modules/.bin/
JSHINT := $(BIN_DIR)jshint
JSCS := $(BIN_DIR)jscs
NODEUNIT := $(BIN_DIR)nodeunit
ISTANBUL := $(BIN_DIR)istanbul
BORSCHIK := $(BIN_DIR)borschik
MOCHA := $(BIN_DIR)mocha
_MOCHA := $(BIN_DIR)_mocha

DIRS_FOR_LINT := $(PRJ_DIR)lib $(PRJ_DIR)test

all: build test

.PHONY: test
test: jshint jscs unittests

.PHONY: unittests
unittests: $(MOCHA) build
	$(MOCHA) -u exports -R spec $(PRJ_DIR)test
	ROUTER=dist $(MOCHA) -u exports -R spec $(PRJ_DIR)test

.PHONY: jshint
jshint: $(JSHINT)
	$(JSHINT) $(DIRS_FOR_LINT)

.PHONY: jscs
jscs: $(JSCS)
	$(JSCS) $(DIRS_FOR_LINT)

.PHONY: coverage
coverage: $(ISTANBUL) $(_MOCHA)
	$(ISTANBUL) cover $(_MOCHA) -- -u exports $(PRJ_DIR)test

$(JSHINT) $(MOCHA) $(_MOCHA) $(ISTANBUL) $(JSCS) $(BORSCHIK):
	npm install

.PHONY: hook
hook: $(PRJ_DIR).git/hooks/pre-commit
$(PRJ_DIR).git/hooks/pre-commit: $(PRJ_DIR)pre-commit
	cp $< $@

.PHONY: build
build: $(BORSCHIK)
	$(BORSCHIK) -i $(PRJ_DIR)dist/susanin.tmp.js -o $(PRJ_DIR)dist/susanin.js -m no
	$(BORSCHIK) -i $(PRJ_DIR)dist/susanin.tmp.js -o $(PRJ_DIR)dist/susanin.min.js
