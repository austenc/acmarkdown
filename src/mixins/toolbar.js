import * as ace from 'brace';
var Range = new ace.acequire('ace/range').Range;
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faBold, faItalic, faLink, faCode } from '@fortawesome/fontawesome-free-solid'
import { faWindowMaximize } from '@fortawesome/fontawesome-free-regular';

// A few helper methods first
function isMac() {
    var platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];

    return macosPlatforms.indexOf(platform) !== -1;
}

function cmdOrCtrl(fn) {
    return function (e) {
        if (! e.altKey && ((isMac() && e.metaKey) || e.ctrlKey)) {
            e.preventDefault()
            return fn.apply(this, arguments)
        }
    }
}

export default {
    components: { FontAwesomeIcon },

    computed: {
        superKey() {
            return isMac() ? 'Cmd' : 'Ctrl';
        }
    },

    methods: {
        saveOnEnter(e) {
            if ((isMac() && e.metaKey) || e.ctrlKey) {
                e.preventDefault();
                this.$refs.editor.form.submit();
            } 
        },

        alreadyWrappedWith(selection, before, after) {
            var rangeBefore = new Range(
                selection.start.row, selection.start.column - before.length, 
                selection.end.row, selection.start.column
            );
            var rangeAfter = new Range(
                selection.end.row, selection.end.column,
                selection.end.row, selection.end.column + after.length
            );
            var charsBefore = this.editor.session.getTextRange(rangeBefore);
            var charsAfter = this.editor.session.getTextRange(rangeAfter);

            // Are the before/after tags already wrapping our selection?
            if (charsBefore == before && charsAfter == after) {
                // We should remove the before and after (toggling off)
                this.editor.session.replace(rangeAfter, '');
                this.editor.session.replace(rangeBefore, '');
                this.editor.focus();
                this.dispatchInputEvent();

                return true;
            }

            return false;
        },

        multiLineCode(selection) {
            var rangeBefore = new Range(
                selection.start.row - 1, 0, 
                selection.start.row - 1, 3
            );
            var rangeAfter = new Range(
                selection.end.row + 1, 0, 
                selection.end.row + 1, 3
            );
            var charsBefore = this.editor.session.getTextRange(rangeBefore);
            var charsAfter = this.editor.session.getTextRange(rangeAfter);

            // Already wrapped in ``` ?
            if (charsBefore == '```' && charsAfter == '```') {
                this.editor.session.replace(rangeAfter, '');
                this.editor.session.replace(rangeBefore, '');

                // TODO: Fix newlines being added when toggling on / off
                // this.editor.session.replace(new Range(
                //     rangeAfter.end.row, 0,
                //     rangeAfter.end.row + 1, 0
                // ), '');
                // this.editor.session.replace(new Range(
                //     rangeBefore.end.row, 0,
                //     rangeBefore.end.row + 1, 1
                // ), '');
                this.editor.focus();
                return true;
            }

            // Otherwise, wrap in ```
            this.editor.session.replace(selection, 
                '```\n' + this.editor.session.getTextRange(selection) + '\n```\n'
            );

            // Set selection to contents of multiline
            this.editor.selection.setRange(new Range(
                selection.start.row + 1, selection.start.column,
                selection.end.row + 1, selection.end.column,
            ));

            this.editor.focus();
        },

        wrapTags(before, after) {

            var selection = this.editor.getSelectionRange();
            if (before == '`' && after == '`' && selection.isMultiLine()) {
                this.multiLineCode(selection);
                return true;
            }
            
            // Toggle it off if this is already wrapped
            if (this.alreadyWrappedWith(selection, before, after)) {
                return true;
            }

            // Otherwise, add before/after tags wrapping the selection
            this.editor.session.replace(selection, 
                before + this.editor.session.getTextRange(selection) + after
            );   
            selection.start.column += before.length;
            selection.end.column += before.length;
            this.editor.selection.setRange(selection);
            this.editor.focus()   
            this.dispatchInputEvent();        
        },

        bold: cmdOrCtrl(function() {
            this.wrapTags('**', '**');
        }),

        italic: cmdOrCtrl(function() {              
            this.wrapTags('*', '*');
        }),

        link: cmdOrCtrl(function() {
            this.wrapTags('[', '](http://)');
        }),
    }
}