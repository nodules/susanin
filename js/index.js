/*global CodeMirror, jQuery */

/* borschik:include:../libs/jquery/dist/jquery.js */
/* borschik:include:../libs/bootstrap/dist/js/bootstrap.js */
/* borschik:include:../libs/codemirror/lib/codemirror.js */
/* borschik:include:../libs/codemirror/mode/javascript/javascript.js */
/* borschik:include:../libs/codemirror/addon/edit/matchbrackets.js */
/* borschik:include:../libs/json2/json2.js */

(function($) {
    function solve() {
        /* jshint evil: true */
        var Susanin = susaninByVersion[currentVersion],
            route,
            rawRouteOptions,
            routeOptions,
            rawMatchOptions,
            matchOptions,
            rawBuildParams,
            buildParams;

        try {
            rawRouteOptions = routeOptionsEditor.getValue();
            if (rawRouteOptions !== '') {
                routeOptions = eval('(' + rawRouteOptions + ')');
                route = new Susanin.Route(routeOptions);
                $unit.fadeIn();
            } else {
                $unit.fadeOut();
            }
            $routeOptionsError.hide();
        } catch (e) {
            $routeOptionsError.html(e.toString()).show();
            $unit.fadeOut();
        }

        if (route) {
            try {
                rawMatchOptions = matchOptionsEditor.getValue();
                if (rawMatchOptions !== '') {
                    matchOptions = eval('(' + rawMatchOptions + ')');
                    matchResultEditor.setValue(JSON.stringify(route.match(matchOptions), null, 4));
                } else {
                    matchResultEditor.setValue('');
                }
                $matchOptionsError.hide();
            } catch (e) {
                $matchOptionsError.html(e.toString()).show();
                matchResultEditor.setValue('');
            }

            try {
                rawBuildParams = buildParamsEditor.getValue();
                if (rawBuildParams !== '') {
                    buildParams = eval('(' + rawBuildParams + ')');
                    buildResultEditor.setValue('"' + route.build(buildParams) + '"');
                } else {
                    buildResultEditor.setValue('');
                }
                $buildParamsError.hide();
            } catch (e) {
                $buildParamsError.html(e.toString()).show();
                buildResultEditor.setValue('');
            }
        }

        $permalink.attr(
            'href',
            '#' + encodeURIComponent([ rawRouteOptions, rawMatchOptions, rawBuildParams, currentVersion ].join('::')));
    }

    var susaninByVersion = {
        '0.1.9' : (function() {
            /*global Susanin */
            /* borschik:include:../libs/susanin_0.1.9/susanin.js */

            return Susanin;
        })(),
        '0.1.10' : (function() {
            /*global Susanin */
            /* borschik:include:../libs/susanin_0.1.10/susanin.js */

            return Susanin;
        })(),
        '0.1.11' : (function() {
            /*global Susanin */
            /* borschik:include:../libs/susanin_0.1.10/susanin.js */

            return Susanin;
        })(),
        '1.0.0-alpha' : (function() {
            /* borschik:include:../libs/susanin_1.0.0-alpha/dist/susanin.js */

            return Susanin;
        })()
    };

    var routeOptionsEditor = CodeMirror.fromTextArea(document.getElementById('route-options-textarea'), {
            mode : { name : 'javascript', json : true },
            indentUnit : 4,
            lineNumbers : true,
            matchBrackets : true,
            lineWrapping : true
        }),
        $routeOptionsError = $('#route-options-error'),

        matchOptionsEditor = CodeMirror.fromTextArea(document.getElementById('match-options-textarea'), {
            mode : { name : 'javascript', json : true },
            lineNumbers : true,
            matchBrackets : true
        }),
        $matchOptionsError = $('#match-options-error'),
        matchResultEditor = CodeMirror.fromTextArea(document.getElementById('match-result-textarea'), {
            mode : { name : 'javascript', json : true },
            readOnly : true
        }),

        buildParamsEditor = CodeMirror.fromTextArea(document.getElementById('build-params-textarea'), {
            mode : { name : 'javascript', json : true },
            indentUnit : 4,
            lineNumbers : true,
            matchBrackets : true
        }),
        $buildParamsError = $('#build-params-error'),
        buildResultEditor = CodeMirror.fromTextArea(document.getElementById('build-result-textarea'), {
            mode : { name : 'javascript', json : true },
            readOnly : true
        }),

        $unit = $('#unit'),
        $permalink = $('#permalink'),
        $version = $('#version'),

        currentVersion,

        values = decodeURIComponent(
                location.hash.substr(1) ||
                "%7B%0A%20%20%20%20pattern%3A%20'%2Fjeans(%2F%3Cbrand%3E(%2F%3Cid%3E))'%2C%0A%20%20%20%20conditions" +
                "%3A%20%7B%0A%20%20%20%20%20%20%20%20brand%3A%20%5B%20'levis'%2C%20'wrangler'%20%5D%2C%0A%20%20" +
                "%20%20%20%20%20%20id%3A%20'%5C%5Cd%7B3%2C5%7D'%0A%20%20%20%20%7D%2C%0A%20%20%20%20defaults%3A%" +
                "20%7B%0A%20%20%20%20%20%20%20%20brand%3A%20'levis'%0A%20%20%20%20%7D%0A%7D%3A%3A'%2Fjeans%2Fle" +
                "vis%2F1234'%3A%3A%7B%0A%20%20%20%20brand%3A%20'levis'%0A%7D"
        ).split('::');

    routeOptionsEditor.setValue(values[0]);
    matchOptionsEditor.setValue(values[1]);
    buildParamsEditor.setValue(values[2]);
    values[3] && $version.val(values[3]);
    currentVersion = $version.val();

    $version.on('change', function() {
        currentVersion = $version.val();
        solve();
    });

    routeOptionsEditor.on('change', solve);
    matchOptionsEditor.on('change', solve);
    buildParamsEditor.on('change', solve);

    solve();
})(jQuery);
