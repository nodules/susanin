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
            rawRouteOptions = routeOptionsEditor.getValue(),
            routeOptions,
            rawMatchPath = matchPathEditor.getValue(),
            matchPath,
            rawMatchData = matchDataEditor.getValue(),
            matchData,
            matchResult,
            rawBuildParams = buildParamsEditor.getValue(),
            buildParams,
            isBuildStrict = $buildStrictCheckbox.prop('checked');

        $permalink.attr(
            'href',
                '#' + encodeURIComponent([
                rawRouteOptions,
                rawMatchPath,
                rawBuildParams,
                currentVersion,
                rawMatchData,
                isBuildStrict
            ].join('::')));

        if (rawRouteOptions !== '') {
            try {
                routeOptions = eval('(' + rawRouteOptions + ')');
                route = new Susanin.Route(routeOptions);
                $routeOptionsError.hide();
                $unit.fadeIn();
            } catch (e) {
                $routeOptionsError.html(e.toString()).show();
                $unit.fadeOut();
            }
        } else {
            $unit.fadeOut();
        }

        if ( ! route) {
            return;
        }

        if (rawMatchPath !== '') {
            try {
                matchPath = eval('(' + rawMatchPath + ')');
                $matchPathError.hide();
            } catch (e) {
                $matchPathError.html(e.toString()).show();
            }
        } else {
            $matchPathError.hide();
        }

        if (rawMatchData !== '') {
            try {
                matchData = eval('(' + rawMatchData + ')');
                $matchDataError.hide();
            } catch (e) {
                $matchDataError.html(e.toString()).show();
            }
        } else {
            $matchDataError.hide();
        }

        if (matchPath) {
            try {
                matchResult = matchData ? route.match(matchPath, matchData) : route.match(matchPath);
                matchResultEditor.setValue(JSON.stringify(matchResult, null, 4));
                $matchPathError.hide();
            } catch (e) {
                $matchPathError.html(e.toString()).show();
            }
        } else {
            matchResultEditor.setValue('');
        }

        if (rawBuildParams !== '') {
            try {
                buildParams = eval('(' + rawBuildParams + ')');
                $buildParamsError.hide();
                buildResultEditor.setValue(JSON.stringify(route.build(buildParams, isBuildStrict)));
            } catch (e) {
                $buildParamsError.html(e.toString()).show();
                buildResultEditor.setValue('');
            }
        } else {
            $buildParamsError.hide();
            buildResultEditor.setValue('');
        }
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
        '1.0.0' : (function() {
            /* borschik:include:../libs/susanin_1.0.0/dist/susanin.js */

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

        matchPathEditor = CodeMirror.fromTextArea(document.getElementById('match-path-textarea'), {
            mode : { name : 'javascript', json : true },
            lineNumbers : true,
            matchBrackets : true
        }),
        $matchPathError = $('#match-path-error'),
        matchDataEditor = CodeMirror.fromTextArea(document.getElementById('match-data-textarea'), {
            mode : { name : 'javascript', json : true },
            lineNumbers : true,
            matchBrackets : true
        }),
        $matchDataError = $('#match-data-error'),
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

        $body = $('body'),
        $unit = $('#unit'),
        $permalink = $('#permalink'),
        $version = $('#version'),
        $buildStrictCheckbox = $('#build-strict-checkbox'),

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
    matchPathEditor.setValue(values[1]);
    buildParamsEditor.setValue(values[2]);
    values[3] && $version.val(values[3]);
    values[4] && matchDataEditor.setValue(values[4]);
    $buildStrictCheckbox.prop('checked', values[5] === 'true');

    currentVersion = $version.val();
    $body.addClass('version_' + currentVersion);
    $version.on('change', function() {
        $body.removeClass('version_' + currentVersion);
        currentVersion = $version.val();
        $body.addClass('version_' + currentVersion);
        solve();
    });

    $buildStrictCheckbox.on('change', solve);

    routeOptionsEditor.on('change', solve);
    matchPathEditor.on('change', solve);
    matchDataEditor.on('change', solve);
    buildParamsEditor.on('change', solve);

    solve();
})(jQuery);
