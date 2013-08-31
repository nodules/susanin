/* borschik:include:../bower_components/jquery/jquery.js */
/* borschik:include:../bower_components/bootstrap/dist/js/bootstrap.js */
/* borschik:include:../bower_components/susanin/susanin.js */
/* borschik:include:../bower_components/codemirror/lib/codemirror.js */
/* borschik:include:../bower_components/codemirror/mode/javascript/javascript.js */
/* borschik:include:../bower_components/codemirror/addon/edit/matchbrackets.js */

(function($) {
    function solve() {
        var route,
            routeOptions,
            matchOptions,
            buildParams;

        try {
            routeOptions = eval('(' + routeOptionsEditor.getValue() + ')');
            route = new Susanin.Route(routeOptions);
            $routeOptionsError.slideUp();
            $unit.fadeIn();
        } catch (e) {
            $routeOptionsError.html(e.toString()).slideDown();
            $unit.fadeOut();

            return;
        }

        try {
            matchOptions = eval('(' + matchOptionsEditor.getValue() + ')');
            $matchOptionsError.slideUp();
            matchResultEditor.setValue(JSON.stringify(route.match(matchOptions), null, 4));
        } catch (e) {
            $matchOptionsError.html(e.toString()).slideDown();
            matchResultEditor.setValue('');
        }

        try {
            buildParams = eval('(' + buildParamsEditor.getValue() + ')');
            $buildParamsError.slideUp();
            buildResultEditor.setValue('"' + route.build(buildParams) + '"');
        } catch (e) {
            $buildParamsError.html(e.toString()).slideDown();
            buildResultEditor.setValue('')
        }
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
        $unit = $('#unit');

    routeOptionsEditor.on('change', solve);
    matchOptionsEditor.on('change', solve);
    buildParamsEditor.on('change', solve);

    solve();
})(jQuery);