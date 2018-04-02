export default {

    props: {
        showPreview: {
            type: Boolean,
            default: true
        }
    },

    data() {
        return {
            previewOnly: false,
            fullscreen: false,
            split: true
        }
    },

    computed: {
        fullscreenClass() {
            return this.fullscreen ? 'z-50 w-full h-auto fixed pin-l pin-t' : '';
        },
        editorClass() {
            return this.fullscreen ? 'flex fixed pin-l pin-t w-full h-screen overflow-hidden editor-fullscreen' : 'flex flex-grow flex-row';
        },
        previewClass() {
            var baseClass = 'hidden md:block';
            if (this.fullscreen) {
                baseClass += ' preview-fullscreen';
            }
            return this.previewOnly ? 'mobile-preview w-full' : baseClass;
        }
    }, 

    methods:  {
        toggleFullscreen() {
            this.fullscreen = !this.fullscreen;
            this.editor.focus();
            this.toggleBodyClass();
        }, 
        toggleSplit() {
            this.previewOnly = false;
            this.split = !this.split;
            this.editor.focus();

            // Trick the editor into thinking the window resized
            setTimeout(function() {
                window.dispatchEvent(new Event('resize'));
            }, 250)
        },
        togglePreview() {
            this.previewOnly = !this.previewOnly;
        },
        closeOnEscape(evt) {
            if (evt.keyCode === 27 && this.fullscreen) {
                this.fullscreen = false;
                this.toggleBodyClass();
            }
        },
        toggleBodyClass() {
            if (this.fullscreen) {
                if (this.body.classList)
                  this.body.classList.add('overflow-hidden');
                else
                  this.body.className += ' ' + 'overflow-hidden';
            } else {
                if (this.body.classList)
                  this.body.classList.remove('overflow-hidden');
                else
                  this.body.className = this.body.className.replace(new RegExp('(^|\\b)' + 'overflow-hidden' + '(\\b|$)', 'gi'), ' ');
            }
        },
    },

    mounted() {
        // Setup our initial split state based on the showPreview prop
        this.split = this.showPreview;

        // Close fullscreen on ESC key press
        document.addEventListener('keyup', this.closeOnEscape);

        // Set up the reference to the body tag
        this.body = document.getElementsByTagName('body')[0];
    }
}