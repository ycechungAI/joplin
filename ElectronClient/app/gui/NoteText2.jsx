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
const TuiEditor = require('./TuiEditor.min.js');

require('brace/mode/markdown');
// https://ace.c9.io/build/kitchen-sink.html
// https://highlightjs.org/static/demo/
require('brace/theme/chrome');

class NoteText2Component extends React.Component {

	constructor() {
		super();

		this.state = {
			note: null,
			noteMetadata: '',
			showNoteMetadata: false,
			folder: null,
			lastSavedNote: null,
			isLoading: true,
			webviewReady: false,
			scrollHeight: null,
			editorScrollTop: 0,
			newNote: null,

			// If the current note was just created, and the title has never been
			// changed by the user, this variable contains that note ID. Used
			// to automatically set the title.
			newAndNoTitleChangeNoteId: null,
			bodyHtml: '',
		};

		this.lastLoadedNoteId_ = null;

		this.webviewListeners_ = null;
		this.ignoreNextEditorScroll_ = false;
		this.scheduleSaveTimeout_ = null;
		this.restoreScrollTop_ = null;
		this.lastSetHtml_ = '';
		this.lastSetMarkers_ = [];

	}

	async componentWillMount() {

	}

	componentWillUnmount() {

	}

	async reloadNote(props, options = null) {
		if (!options) options = {};
		if (!('noReloadIfLocalChanges' in options)) options.noReloadIfLocalChanges = false;

		// await this.saveIfNeeded();

		const previousNote = this.state.note ? Object.assign({}, this.state.note) : null;

		const stateNoteId = this.state.note ? this.state.note.id : null;
		let noteId = null;
		let note = null;
		let loadingNewNote = true;
		let parentFolder = null;

		if (props.newNote) {
			note = Object.assign({}, props.newNote);
			this.lastLoadedNoteId_ = null;
		} else {
			noteId = props.noteId;
			loadingNewNote = stateNoteId !== noteId;
			this.lastLoadedNoteId_ = noteId;
			note = noteId ? await Note.load(noteId) : null;
			if (noteId !== this.lastLoadedNoteId_) return; // Race condition - current note was changed while this one was loading
			if (options.noReloadIfLocalChanges && this.isModified()) return;

			// If the note hasn't been changed, exit now
			if (this.state.note && note) {
				let diff = Note.diffObjects(this.state.note, note);
				delete diff.type_;
				if (!Object.getOwnPropertyNames(diff).length) return;
			}
		}

		this.mdToHtml_ = null;

		// If we are loading nothing (noteId == null), make sure to
		// set webviewReady to false too because the webview component
		// is going to be removed in render().
		const webviewReady = this.webview_ && this.state.webviewReady && (noteId || props.newNote);

		// Scroll back to top when loading new note
		if (loadingNewNote) {
			this.editorMaxScrollTop_ = 0;

			// HACK: To go around a bug in Ace editor, we first set the scroll position to 1
			// and then (in the renderer callback) to the value we actually need. The first
			// operation helps clear the scroll position cache. See:
			// https://github.com/ajaxorg/ace/issues/2195
			// this.editorSetScrollTop(1);
			this.restoreScrollTop_ = 0;

			// If a search is in progress we don't focus any field otherwise it will
			// take the focus out of the search box.
			if (note && this.props.notesParentType !== 'Search') {
				const focusSettingName = !!note.is_todo ? 'newTodoFocus' : 'newNoteFocus';

				if (Setting.value(focusSettingName) === 'title') {
					if (this.titleField_) this.titleField_.focus();
				} else {
					if (this.editor_) this.editor_.editor.focus();
				}
			}

			if (this.editor_) {
				// Calling setValue here does two things:
				// 1. It sets the initial value as recorded by the undo manager. If we were to set it instead to "" and wait for the render
				//    phase to set the value, the initial value would still be "", which means pressing "undo" on a note that has just loaded
				//    would clear it.
				// 2. It resets the undo manager - fixes https://github.com/laurent22/joplin/issues/355
				// Note: calling undoManager.reset() doesn't work
				try {
					this.editor_.editor.getSession().setValue(note ? note.body : '');
				} catch (error) {
					if (error.message === "Cannot read property 'match' of undefined") {
						// The internals of Ace Editor throws an exception when creating a new note,
						// but that can be ignored.
					} else {
						console.error(error);
					}
				}
				this.editor_.editor.clearSelection();
				this.editor_.editor.moveCursorTo(0,0);
			}
		}

		if (note)
		{
			parentFolder = Folder.byId(props.folders, note.parent_id);
		}

		let newState = {
			note: note,
			lastSavedNote: Object.assign({}, note),
			webviewReady: webviewReady,
			folder: parentFolder,
		};

		if (!note) {
			newState.newAndNoTitleChangeNoteId = null;
		} else if (note.id !== this.state.newAndNoTitleChangeNoteId) {
			newState.newAndNoTitleChangeNoteId = null;
		}

		this.lastSetHtml_ = '';
		this.lastSetMarkers_ = [];

		this.setState(newState);

		// this.updateHtml(newState.note ? newState.note.body : '');
	}

	async componentWillReceiveProps(nextProps) {
		if (nextProps.newNote) {
			await this.reloadNote(nextProps);
		} else if ('noteId' in nextProps && nextProps.noteId !== this.props.noteId) {
			await this.reloadNote(nextProps);
		}

		if ('syncStarted' in nextProps && !nextProps.syncStarted && !this.isModified()) {
			await this.reloadNote(nextProps, { noReloadIfLocalChanges: true });
		}

		if (nextProps.windowCommand) {
			this.doCommand(nextProps.windowCommand);
		}
	}

	isModified() {
		return shared.isModified(this);
	}

	render() {
		const style = this.props.style;

		const note = this.state.note;
		const body = note && note.body ? note.body : '';
		const theme = themeStyle(this.props.theme);
		const visiblePanes = this.props.visiblePanes || ['editor', 'viewer'];
		const isTodo = note && !!note.is_todo;

		const borderWidth = 1;

		const rootStyle = Object.assign({
			borderLeft: borderWidth + 'px solid ' + theme.dividerColor,
			boxSizing: 'border-box',
			paddingLeft: 10,
			paddingRight: 0,
		}, style);

		const innerWidth = rootStyle.width - rootStyle.paddingLeft - rootStyle.paddingRight - borderWidth;

		if (!note || !!note.encryption_applied) {
			const emptyDivStyle = Object.assign({
				backgroundColor: 'black',
				opacity: 0.1,
			}, rootStyle);
			return <div style={emptyDivStyle}></div>
		}

		const titleBarStyle = {
			width: innerWidth - rootStyle.paddingLeft,
			height: 30,
			boxSizing: 'border-box',
			marginTop: 10,
			marginBottom: 0,
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
		};

		const titleEditorStyle = {
			display: 'flex',
			flex: 1,
			display: 'inline-block',
			paddingTop: 5,
			paddingBottom: 5,
			paddingLeft: 8,
			paddingRight: 8,
			marginRight: rootStyle.paddingLeft,
		};

		const toolbarStyle = {
			marginBottom: 10,
		};

		const bottomRowHeight = rootStyle.height - titleBarStyle.height - titleBarStyle.marginBottom - titleBarStyle.marginTop - theme.toolbarHeight - toolbarStyle.marginBottom;

		const viewerStyle = {
			width: Math.floor(innerWidth),
			height: bottomRowHeight,
			overflow: 'hidden',
			float: 'left',
			verticalAlign: 'top',
			boxSizing: 'border-box',
		};

		const paddingTop = 14;

		const toolbarItems = [];
		// if (note 
		// 	&& this.state.folder !== null 
		// 	&& ['Search', 'Tag'].includes(this.props.notesParentType)) {
		// 	toolbarItems.push({
		// 		title: _('In: %s', this.state.folder.title),
		// 		iconName: 'fa-folder-o',
		// 		enabled: false,
		// 	});
		// }

		toolbarItems.push({
			title: _('Attach file'),
			iconName: 'fa-paperclip',
			onClick: () => { return this.commandAttachFile(); },
		});

		toolbarItems.push({
			title: _('Tags'),
			iconName: 'fa-tags',
			onClick: () => { return this.commandSetTags(); },
		});

		if (note.is_todo) {
			toolbarItems.push({
				title: Note.needAlarm(note) ? time.formatMsToLocal(note.todo_due) : _('Set alarm'),
				iconName: 'fa-clock-o',
				enabled: !note.todo_completed,
				onClick: () => { return this.commandSetAlarm(); },
			});
		}

		const toolbar = <Toolbar
			style={toolbarStyle}
			items={toolbarItems}
		/>

		const titleEditor = <input
			type="text"
			ref={(elem) => { this.titleField_ = elem; } }
			style={titleEditorStyle}
			value={note && note.title ? note.title : ''}
			onChange={(event) => { this.title_changeText(event); }}
			placeholder={ this.props.newNote ? _('Creating new %s...', isTodo ? _('to-do') : _('note')) : '' }
		/>

		const titleBarMenuButton = <IconButton style={{
			display: 'flex',
		}} iconName="fa-caret-down" theme={this.props.theme} onClick={() => { this.itemContextMenu() }} />

		const titleBarDate = <span style={Object.assign({}, theme.textStyle, {color: theme.colorFaded})}>{time.formatMsToLocal(note.user_updated_time)}</span>

		const viewer =  <TuiEditor style={viewerStyle} initialValue={note.body}/>

		return (
			<div style={rootStyle} onDrop={this.onDrop_}>
				<div style={titleBarStyle}>
					{ titleEditor }
					{ titleBarDate }
					{ false ? titleBarMenuButton : null }
				</div>
				{ viewer }
			</div>
		);
	}

}

const mapStateToProps = (state) => {
	return {
		noteId: state.selectedNoteIds.length === 1 ? state.selectedNoteIds[0] : null,
		folderId: state.selectedFolderId,
		itemType: state.selectedItemType,
		folders: state.folders,
		theme: state.settings.theme,
		showAdvancedOptions: state.settings.showAdvancedOptions,
		syncStarted: state.syncStarted,
		newNote: state.newNote,
		windowCommand: state.windowCommand,
		notesParentType: state.notesParentType,
		searches: state.searches,
		selectedSearchId: state.selectedSearchId,
	};
};

const NoteText2 = connect(mapStateToProps)(NoteText2Component);

module.exports = { NoteText2 };