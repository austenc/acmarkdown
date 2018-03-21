import MarkdownEditor from './components/MarkdownEditor';

export default {
    install(Vue, options) {
        Vue.component('markdown-editor', MarkdownEditor);
    }
}

export { MarkdownEditor }