
const React = require('react');
const Note = require('lib/models/Note.js');
const BaseItem = require('lib/models/BaseItem.js');
const BaseModel = require('lib/BaseModel.js');
const Search = require('lib/models/Search.js');
const { time } = require('lib/time-utils.js');
const Setting = require('lib/models/Setting.js');
const { IconButton } = require('./IconButton.min.js');
const Toolbar = require('./Toolbar.min.js');
const { connect } = require('react-redux');
const { _ } = require('lib/locale.js');
const { reg } = require('lib/registry.js');
const MdToHtml = require('lib/MdToHtml');
const shared = require('lib/components/shared/note-screen-shared.js');
const { bridge } = require('electron').remote.require('./bridge');
const { themeStyle } = require('../theme.js');
const AceEditor = require('react-ace').default;
const Menu = bridge().Menu;
const MenuItem = bridge().MenuItem;
const { shim } = require('lib/shim.js');
const eventManager = require('../eventManager');
const fs = require('fs-extra');
const {clipboard} = require('electron')
const md5 = require('md5');
const mimeUtils = require('lib/mime-utils.js').mime;
const ArrayUtils = require('lib/ArrayUtils');
const urlUtils = require('lib/urlUtils');






var Editor = require('tui-editor');

require('brace/mode/markdown');
// https://ace.c9.io/build/kitchen-sink.html
// https://highlightjs.org/static/demo/
require('brace/theme/chrome');

class TuiEditor extends React.Component {

	constructor() {
		super();

	}

	componentDidMount() {
	    let editor = new Editor({
	      el: document.querySelector('#editSection'),
	      initialEditType: 'wysiwyg',
	      previewStyle: 'vertical',
	      width: this.props.style.width,
	      height: this.props.style.height,
	      events: {
	        change: () => {
	        	console.log(this.state.editor.getValue());
	        }
	      },
	      initialValue: this.props.initialValue,
	    });

	    this.setState({ editor });
	  }



	render() {
		return (
      		<div id='editSection' />
    	)
	}

}

module.exports = TuiEditor;