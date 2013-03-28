BIN_PATH := ./node_modules/.bin/
JSHINT := $(BIN_PATH)jshint
UGLIFYJS := $(BIN_PATH)uglifyjs

.PHONY: jshint test minify hook

test: jshint

jshint: $(JSHINT)
	$(JSHINT) jsrouter.js

minify: $(UGLIFYJS)
	$(UGLIFYJS) jsrouter.js > jsrouter.min.js

$(JSHINT) $(UGLIFYJS):
	npm install

hook: .git/hooks/pre-commit
.git/hooks/pre-commit: pre-commit
	cp $< $@