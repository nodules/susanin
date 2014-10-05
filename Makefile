PRJ_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))/

BIN_DIR := $(PRJ_DIR)node_modules/.bin/
BOWER = $(BIN_DIR)bower
JSHINT = $(BIN_DIR)jshint
JSCS = $(BIN_DIR)jscs
BORSCHIK = $(BIN_DIR)borschik
NPM = /usr/bin/npm

DIRS_FOR_LINT := $(PRJ_DIR)js/index.js

all: test build

.PHONY: test
test: jshint jscs

.PHONY: jshint
jshint: $(JSHINT)
	$(JSHINT) $(DIRS_FOR_LINT)

.PHONY: jscs
jscs: $(JSCS)
	$(JSCS) $(DIRS_FOR_LINT)

.PHONY: libs
libs: $(BOWER)
	$(BOWER) install

.PHONY: build
build: $(BORSCHIK) libs
	$(BORSCHIK) -i js/index.js -o js/index.min.js -t js -m yes
	$(BORSCHIK) -i css/index.css -o css/index.min.css -t css -m yes -f no

$(BOWER) $(BORSCHIK) $(JSHINT) $(JSCS):
	npm install
