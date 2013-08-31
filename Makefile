BIN_PATH = ./node_modules/.bin/
BOWER = $(BIN_PATH)bower
BORSCHIK = $(BIN_PATH)borschik
NPM = /usr/bin/npm

all: build

.PHONY: build
build:: concat

.PHONY: concat
concat: get-libs $(BORSCHIK)
	$(BORSCHIK) -i js/index.js -o js/index.min.js -t js -m yes
	$(BORSCHIK) -i css/index.css -o css/index.min.css -t css -m yes -f yes

.PHONY: get-libs
get-libs: $(BOWER)
	$(BOWER) install jquery codemirror bootstrap susanin json2

$(BOWER): $(NPM)
	$(NPM) install bower

$(BORSCHIK): $(NPM)
	$(NPM) install borschik

$(NPM):
	sudo apt-get install npm