<template>
  <div class="shadow flex flex-grow flex-col" :class="fullscreenClass">
    <div v-show="showToolbar" class="flex justify-between bg-grey-lighter text-grey p-2 border-b border-grey-light pt-3 px-4">
      <div>
        <button @click.prevent="wrapTags('**', '**')" :title="'Bold (' + superKey + ' + B)'" class="outline-none  h-4 w-4 text-grey hover:text-grey-dark">
          <font-awesome-icon icon="bold" />
        </button>
        <button @click.prevent="wrapTags('*', '*')" :title="'Italic (' + superKey + ' + I)'" class="outline-none  h-4 w-4 text-grey hover:text-grey-dark">
          <font-awesome-icon icon="italic" />
        </button>
        <button @click.prevent="wrapTags('[', '](http://)')" :title="'Insert Link (' + superKey + ' + K)'" class="outline-none  h-4 w-4 text-grey hover:text-grey-dark">
          <font-awesome-icon icon="link" />
        </button>
        <button @click.prevent="wrapTags('`', '`')" :title="'Code (' + superKey + ' + ZZZ)'" class="outline-none  h-4 w-4 text-grey hover:text-grey-dark">
          <font-awesome-icon icon="code" />
        </button>
      </div>
      <div class="text-right">    
        <!-- Preview Only -->
        <button @click.prevent="togglePreview" title="Preview Only" class="w-4 w-4 outline-none text-grey hover:text-grey-dark mr-1">
          <font-awesome-icon icon="eye" />
        </button>

        <!-- Split Screen -->
        <button @click.prevent="toggleSplit" :title="split ? 'Hide Preview' : 'Show Preview'" class="w-4 h-4 outline-none text-right text-grey hover:text-grey-dark mr-1 hidden md:inline">

          <!-- Single / Split Pane Icons -->
          <font-awesome-icon :icon="['far', 'window-maximize']" v-show="split" />
          <font-awesome-icon icon="columns" v-show="!split" />
        </button>

        <button @click.prevent="toggleFullscreen" title="Fullscreen (Alt + Shift + F)" class="w-4 h-4 outline-none text-right text-grey hover:text-grey-dark">
          <font-awesome-icon icon="expand-arrows-alt" v-show="!fullscreen" />
          <font-awesome-icon icon="window-close" v-show="fullscreen" />
        </button>
      </div>
    </div>
    <div :class="editorClass">

      <!-- Editor -->
      <div class="flex-1 max-h-screen" v-show="!previewOnly">
        <div id="ace-editor" ref="editor" @input="update"
          @keydown.66="bold"
          @keydown.73="italic"
          @keydown.75="link"
          @keydown.enter="saveOnEnter"
          @keydown.alt.shift.70.prevent="toggleFullscreen"
          ></div>

        <textarea ref="textarea" style="display: none;"
          :name="name"
          v-model="input"
          class="font-mono text-sm appearance-none w-full text-grey-darker outline-none border-teal p-4 h-full rounded-none shadow-none">
        </textarea>
      </div>

      <!-- Split Preview -->
      <div v-show="split || previewOnly" ref="preview" class="editor-preview bg-white rounded-none w-1/2 overflow-y-scroll max-h-screen"
        :class="previewClass">
        <div class="p-4 px-6" v-html="output"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as ace from 'brace';
  import 'brace/mode/markdown';
  import 'brace/theme/tomorrow_night_eighties';
  let marked = require('marked');
  let _ = require('lodash');
  import Fullscreen from '../mixins/fullscreen';
  import Toolbar from '../mixins/toolbar';

  export default {
    mixins: [Fullscreen, Toolbar],

    props: {
      name: {
        type: String,
        default: 'markdown'
      },
      content: {
        type: String,
        default: 'Testing 123 ABC'
      },
      wrap: {
        type: Boolean,
        default: true
      },
      theme: {
        type: String,
        default: 'ace/theme/tomorrow_night_eighties'
      },
      gutter: {
        type: Boolean,
        default: false
      },
      padding: {
        type: Number,
        default: 20
      },
      lineHeight: {
        type: Number,
        default: 2
      },
      showToolbar: {
        type: Boolean,
        default: true
      },
    },

    data() {
      return {
        editor: false,
        input: 'Enter text here',
        renderer: false,
        prevSelection: '',
      }
    },

    computed: {
      output() {  
        return marked(this.input, {renderer: this.renderer});
      }
    },

    methods: {
      update: _.debounce(function (e) {
        this.input = this.editor.getValue();
      }, 100),

      dispatchInputEvent() {
        this.$refs.editor.dispatchEvent(new Event('input', {
          'bubbles': true,
          'cancelable': true
        }));
      },

      setupEditor() {
        var self = this;
        this.editor = ace.edit('ace-editor');
        this.editor.getSession().setMode('ace/mode/markdown');
        this.editor.getSession().setUseWrapMode(this.wrap);
        this.editor.getSession().setScrollTop(0);
        this.editor.setTheme(this.theme);
        this.editor.renderer.setShowGutter(this.gutter);
        this.editor.renderer.setPadding(this.padding);
        this.editor.renderer.setScrollMargin(this.padding, this.padding);
        this.editor.container.style.lineHeight = this.lineHeight;
        this.editor.setValue(this.input, -1);
        this.editor.getSession().on('changeScrollTop', function(scroll) {
          self.$refs.preview.scrollTop = parseInt(scroll) || 0;
        });
        this.editor.getSession().setUndoManager(new ace.UndoManager());
      }

    },
    mounted() {
      this.input = this.content;

      // Markdown parsing with marked
      this.renderer = new marked.Renderer();
      this.renderer.code = function(code, language){
        return '<pre><code class="hljs">' 
        + hljs.highlightAuto(code).value 
        + '</code></pre>';
      };

      this.setupEditor()
    }
  }
</script>

<style>
  #ace-editor {
    padding-top: 1rem;
    position: relative;
    width: 100%;
    min-height: 250px;
    height: 80vh;
  }
  .editor-preview {
    height: 80vh;
  }
  .outline-none, .outline-none:focus { 
    outline: none;
  }

  .editor-toolbar {
    height: 40px;
  }

  .editor-fullscreen {
    top: 40px;

  }
  .editor-fullscreen #ace-editor, .editor-fullscreen .editor-preview {
    height: 100%;     
  }

  .preview-fullscreen {
    padding-bottom: 100px;
  }
</style>