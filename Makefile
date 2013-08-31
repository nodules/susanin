BIN_PATH = ./node_modules/.bin/
BOWER = $(BIN_PATH)bower
BORSCHIK = $(BIN_PATH)borschik
NPM = /usr/bin/npm

all: build

.PHONY: build
build:: concat

.PHONY: concat
concat: get-libs $(BORSCHIK)
	$(BORSCHIK) -i js/index.js -o js/_index.js -t js -m yes
	$(BORSCHIK) -i css/index.css -o css/_index.css -t css -m no -f yes

.PHONY: get-libs
get-libs: $(BOWER)
	$(BOWER) install jquery codemirror bootstrap susanin

$(BOWER): $(NPM)
	$(NPM) install bower

$(BORSCHIK): $(NPM)
	$(NPM) install borschik

$(NPM):
	sudo apt-get install npm