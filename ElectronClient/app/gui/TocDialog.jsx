const React = require('react');
const { connect } = require('react-redux');
const { _ } = require('lib/locale.js');
const moment = require('moment');
const { themeStyle } = require('../theme.js');
const { time } = require('lib/time-utils.js');
const Datetime = require('react-datetime');
const Note = require('lib/models/Note');
const formatcoords = require('formatcoords');
const markdownUtils = require('lib/markdownUtils');
const { bridge } = require('electron').remote.require('./bridge');

class TocDialog extends React.Component {

	constructor() {
		super();

		this.state = {
			tocHtml: '',
		};

		this.modal_click = this.modal_click.bind(this);
	}

	modal_click(event) {
		if (!event.target.classList.contains('modal-layer')) return;

		if (this.props.onClose) this.props.onClose();
	}

	componentDidMount() {
		this.setState({ tocHtml: markdownUtils.createHtmlToc(this.props.bodyMd) });
	}

	render() {
		const theme = themeStyle(this.props.theme);

		const modalLayerStyle = Object.assign({}, theme.dialogModalLayer);
		if (!this.props.visible) modalLayerStyle.display = 'none';

		console.info('Set html:' + this.state.tocHtml);

		return (
			<div className="modal-layer" style={modalLayerStyle} onClick={this.modal_click}>
				<div style={theme.dialogBox}>
					<div style={theme.dialogTitle}>{_('Table of contents')}</div>
					<div dangerouslySetInnerHTML={{__html: this.state.tocHtml}} />
				</div>
			</div>
		);
	}

}

module.exports = TocDialog;
