/* borschik:include:../bower_components/jquery/jquery.js */
/* borschik:include:../bower_components/bootstrap/dist/js/bootstrap.js */
/* borschik:include:../bower_components/susanin/susanin.js */
/* borschik:include:../bower_components/codemirror/lib/codemirror.js */
/* borschik:include:../bower_components/codemirror/mode/javascript/javascript.js */
/* borschik:include:../bower_components/codemirror/addon/edit/matchbrackets.js */
/* borschik:include:../bower_components/json2/json2.js */


(function($) {
    function solve() {
        var route,
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
            '#' + encodeURIComponent([ rawRouteOptions, rawMatchOptions, rawBuildParams ].join('::')));
    }

    var routeOptionsEditor = CodeMirror.fromTextArea(document.getElementById('route-options-textarea'), {
            mode : 'javascript',
            lineNumbers : true,
            matchBrackets : true,
            lineWrapping : true
        }),
        $routeOptionsError = $('#route-options-error'),
        matchOptionsEditor = CodeMirror.fromTextArea(document.getElementById('match-options-textarea'), {
            mode : 'javascript',
            lineNumbers : true,
            matchBrackets : true
        }),
        $matchOptionsError = $('#match-options-error'),
        matchResultEditor = CodeMirror.fromTextArea(document.getElementById('match-result-textarea'), {
            mode : 'javascript',
            readOnly : true
        }),
        buildParamsEditor = CodeMirror.fromTextArea(document.getElementById('build-params-textarea'), {
            mode : 'javascript',
            lineNumbers : true,
            matchBrackets : true
        }),
        $buildParamsError = $('#build-params-error'),
        buildResultEditor = CodeMirror.fromTextArea(document.getElementById('build-result-textarea'), {
            mode : 'javascript',
            readOnly : true
        }),
        $unit = $('#unit'),
        $permalink = $('#permalink'),
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

    routeOptionsEditor.on('change', solve);
    matchOptionsEditor.on('change', solve);
    buildParamsEditor.on('change', solve);

    solve();
})(jQuery);
