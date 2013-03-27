BIN_PATH := ./node_modules/.bin/
JSHINT := $(BIN_PATH)jshint

.PHONY: jshint test

test: jshint

jshint: $(JSHINT)
	$(JSHINT) .

$(JSHINT):
	npm install jshint