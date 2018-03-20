import MarkdownEditor from './components/MarkdownEditor';

export default {
    install(Vue, options = {}) {
        mergeSettings(options);

        Vue.component('markdown-editor', MarkdownEditor);
    },

    settings(settings) {
        mergeSettings(settings)
    }
}

export { MarkdownEditor }