<template>
    <div class="risk-express-input" ref="mirror"></div>
</template>

<script>
// 此组件暂时服务于shark和whale的表达式编辑功能
import 'codemirror/mode/apl/apl';
import 'codemirror/addon/hint/show-hint';
import CodeMirror from 'codemirror';

const SIZES = {
  small: 32,
  normal: 100,
  large: 40,
};
export default {
  props: {
    expObject: {
      type: Object,
      default: () => ({ value: '' }),
      validator(value) {
        return typeof value.value === 'string';
      },
    },
    size: {
      type: String,
      validator(value) {
        return ['small', 'normal', 'large'].indexOf(value) !== -1;
      },
    },
    initValue: {
      type: Object,
      default: () => ({ value: '' }),
      validator(value) {
        return typeof value.value === 'string';
      },
    },
    origin: {
      type: String,
      default: window.location.pathname.match(/^\/risk\/(\w+?)\//) && window.location.pathname.match(/^\/risk\/(\w+?)\//)[1],
    },
  },
  model: {
    prop: 'expObject',
    event: 'input',
  },
  data() {
    return {
      expression: this.initValue ? this.initValue.value : '',
    };
  },
  mounted() {
    this.INNER_FUNCTIONS = ['true', 'false'];
    if (!this.editor) {
      this.init(this.expression || '');
    }
  },
  watch: {
    expression(value) {
      this.$emit('input', { value });
    },
    initValue(value) {
      if (!this.editor) {
        this.$nextTick(() => {
          this.init(value.value);
        });
      } else {
        this.editor.setValue(value.value);
      }
    },
  },
  methods: {
    init(expression) {
      CodeMirror.registerHelper('hint', 'anyword', async (editor, options) => {
        const cur = editor.getCursor();
        if (this.hideHint) {
          return { list: [], from: CodeMirror.Pos(cur.line, cur.ch), to: CodeMirror.Pos(cur.line, cur.ch) };
        }
        const wordRegxp = options.wordRegxp;
        const curLine = editor.getLine(cur.line);
        const end = cur.ch;
        let start = end;
        if (curLine.charAt(start - 1) === '.') {
          start--;
          while (start && wordRegxp.test(curLine.charAt(start - 1))) --start;
          const word = start !== (end - 1) && curLine.slice(start, end - 1);
          let res = [];
          if (word) {
            res = (await this.$store.dispatch('getFactors', {
              data: {
                namespace_id: this.$route.params.namespace_id || this.$route.params.id,
                keyword: word,
              },
              origin: this.origin,
            },
            )).map(item => item.name || item.Name);
          }
          return { list: res, from: CodeMirror.Pos(cur.line, end + 1), to: CodeMirror.Pos(cur.line, end + 1) };
        }
        while (start && wordRegxp.test(curLine.charAt(start - 1))) --start;
        const curWord = start !== end && curLine.slice(start, end);
        if (this.INNER_FUNCTIONS.length < 3) {
          const FUNCS = await this.$store.dispatch('getInnerData', { origin: this.origin });
          this.INNER_FUNCTIONS = this.INNER_FUNCTIONS.concat(FUNCS);
        }
        let list = [];
        if (curWord) {
          list = (await this.$store.dispatch('getFactors', {
            data: {
              namespace_id: this.$route.params.namespace_id || this.$route.params.id,
              keyword: curWord,
            },
            origin: this.origin,
          },
          )).map(item => item.name || item.Name).concat(this.INNER_FUNCTIONS.filter(item => item.toLowerCase().includes(curWord.toLowerCase())));
        }
        return { list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end) };
      });
      const extraKeys = {
        Tab(cm) { // 按下Tab键时，插入空格代替tab字符。
          const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
          cm.replaceSelection(spaces);
        },
      };
      ["'a'", "'b'", "'c'", "'d'", "'e'", "'f'", "'g'", "'h'", "'i'", "'j'", "'k'", "'l'", "'m'", "'n'", "'o'", "'p'", "'q'", "'r'", "'s'", "'t'", "'u'", "'v'", "'w'", "'x'", "'y'", "'z'", "'.'"].forEach((key) => {
        extraKeys[key] = this.completeAfter.bind(this);
        extraKeys[key.toUpperCase()] = this.completeAfter.bind(this);
      });
      this.editor = CodeMirror(this.$refs.mirror, {
        mode: 'apl',
        hintOptions: {
          wordRegxp: /[\w$]+/,
          range: 500,
        },
        lineWrapping: true,
        singleCursorHeightPerLine: false,
        extraKeys,
      });
      this.expression = expression;
      this.editor.setSize('100%', SIZES[this.size || 'normal'] || 100);
      this.editor.setValue(expression);
      this.editor.on('blur', (cm) => {
        this.expression = cm.getValue();
        this.cur = cm.getCursor();
      });
      this.editor.on('change', (cm) => {
        this.expression = cm.getValue();
        this.cur = cm.getCursor();
      });
    },
    completeAfter(cm, pred) {
      this.hideHint = true; // 函数防抖，减少接口请求
      if (!pred || pred()) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.hideHint = false;
          // if (!cm.state.completionActive) {
          cm.showHint({
            completeSingle: false,
          });
          // }
        }, 500);
      }
      return CodeMirror.Pass;
    },
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
    this.timeout = null;
  },
};
</script>
<style lang="scss">
  @import 'codemirror/lib/codemirror.css';
  @import 'codemirror/addon/hint/show-hint.css';
  .risk-express-input {
    text-align:left;
    border:1px solid #dddee1;
    line-height:1.2;
    font-size:14px;
  }
</style>
