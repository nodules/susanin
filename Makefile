BIN_PATH = ./node_modules/.bin/
BOWER = $(BIN_PATH)bower
NPM = /usr/bin/npm

all: build

.PHONY: build
build: $(BOWER)
	$(BOWER) install jquery codemirror bootstrap

$(BOWER): $(NPM)
	npm install bower

$(NPM):
	sudo apt-get install npm