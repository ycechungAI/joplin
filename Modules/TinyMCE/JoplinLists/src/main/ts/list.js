/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('listModel/Util', ['require', 'exports', '@ephox/sugar'], function(require, exports, sugar_1) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const isList = (el) => {
		return sugar_1.Compare.is(el, 'OL,UL');
	};
	exports.isList = isList;
	const hasFirstChildList = (el) => {
		return sugar_1.Traverse.firstChild(el).map(isList).getOr(false);
	};
	exports.hasFirstChildList = hasFirstChildList;
	const hasLastChildList = (el) => {
		return sugar_1.Traverse.lastChild(el).map(isList).getOr(false);
	};
	exports.hasLastChildList = hasLastChildList;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('listModel/Entry', ['require', 'exports', '@ephox/sugar', '@ephox/katamari', 'listModel/Util'], function(require, exports, sugar_2, katamari_1, Util_1) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const isIndented = (entry) => {
		return entry.depth > 0;
	};
	exports.isIndented = isIndented;
	const isSelected = (entry) => {
		return entry.isSelected;
	};
	exports.isSelected = isSelected;
	const cloneItemContent = (li) => {
		const children = sugar_2.Traverse.children(li);
		const content = Util_1.hasLastChildList(li) ? children.slice(0, -1) : children;
		return katamari_1.Arr.map(content, sugar_2.Replication.deep);
	};
	const createEntry = (li, depth, isSelected) => {
		return sugar_2.Traverse.parent(li).filter(sugar_2.Node.isElement).map((list) => {
			return {
				depth,
				isSelected,
				content: cloneItemContent(li),
				itemAttributes: sugar_2.Attr.clone(li),
				listAttributes: sugar_2.Attr.clone(list),
				listType: sugar_2.Node.name(list),
			};
		});
	};
	exports.createEntry = createEntry;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('listModel/Indentation', ['require', 'exports'], function(require, exports) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	exports.indentEntry = (indentation, entry) => {
		switch (indentation) {
		case 'Indent' /* Indent */:
			entry.depth++;
			break;
		case 'Outdent' /* Outdent */:
			entry.depth--;
			break;
		case 'Flatten' /* Flatten */:
			entry.depth = 0;
		}
	};
});
define('core/ListAction', ['require', 'exports'], function(require, exports) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	exports.listToggleActionFromListName = (listName) => {
		switch (listName) {
		case 'UL': return 'ToggleUlList' /* ToggleUlList */;
		case 'OL': return 'ToggleOlList' /* ToggleOlList */;
		case 'DL': return 'ToggleDLList' /* ToggleDLList */;
		}
	};
});
define('api/Events', ['require', 'exports'], function(require, exports) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	exports.fireListEvent = (editor, action, element) => editor.fire('ListMutation', { action, element });
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('core/NodeType', ['require', 'exports'], function(require, exports) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const isTextNode = function(node) {
		return node && node.nodeType === 3;
	};
	exports.isTextNode = isTextNode;
	const isListNode = function(node) {
		return node && (/^(OL|UL|DL)$/).test(node.nodeName);
	};
	exports.isListNode = isListNode;
	const isOlUlNode = function(node) {
		return node && (/^(OL|UL)$/).test(node.nodeName);
	};
	exports.isOlUlNode = isOlUlNode;
	const isListItemNode = function(node) {
		return node && /^(LI|DT|DD)$/.test(node.nodeName);
	};
	exports.isListItemNode = isListItemNode;
	const isDlItemNode = function(node) {
		return node && /^(DT|DD)$/.test(node.nodeName);
	};
	exports.isDlItemNode = isDlItemNode;
	const isTableCellNode = function(node) {
		return node && /^(TH|TD)$/.test(node.nodeName);
	};
	exports.isTableCellNode = isTableCellNode;
	const isBr = function(node) {
		return node && node.nodeName === 'BR';
	};
	exports.isBr = isBr;
	const isFirstChild = function(node) {
		return node.parentNode.firstChild === node;
	};
	exports.isFirstChild = isFirstChild;
	const isLastChild = function(node) {
		return node.parentNode.lastChild === node;
	};
	exports.isLastChild = isLastChild;
	const isTextBlock = function(editor, node) {
		return node && !!editor.schema.getTextBlockElements()[node.nodeName];
	};
	exports.isTextBlock = isTextBlock;
	const isBlock = function(node, blockElements) {
		return node && node.nodeName in blockElements;
	};
	exports.isBlock = isBlock;
	const isBogusBr = function(dom, node) {
		if (!isBr(node)) {
			return false;
		}
		if (dom.isBlock(node.nextSibling) && !isBr(node.previousSibling)) {
			return true;
		}
		return false;
	};
	exports.isBogusBr = isBogusBr;
	const isEmpty = function(dom, elm, keepBookmarks) {
		const empty = dom.isEmpty(elm);
		if (keepBookmarks && dom.select('span[data-mce-type=bookmark]', elm).length > 0) {
			return false;
		}
		return empty;
	};
	exports.isEmpty = isEmpty;
	const isChildOfBody = function(dom, elm) {
		return dom.isChildOf(elm, dom.getRoot());
	};
	exports.isChildOfBody = isChildOfBody;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('core/Selection', ['require', 'exports', '@ephox/katamari', '@ephox/sand', 'tinymce/core/api/dom/DomQuery', 'tinymce/core/api/util/Tools', 'core/NodeType'], function(require, exports, katamari_2, sand_1, DomQuery_1, Tools_1, NodeType) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const getParentList = function(editor) {
		const selectionStart = editor.selection.getStart(true);
		return editor.dom.getParent(selectionStart, 'OL,UL,DL', getClosestListRootElm(editor, selectionStart));
	};
	exports.getParentList = getParentList;
	const isParentListSelected = function(parentList, selectedBlocks) {
		return parentList && selectedBlocks.length === 1 && selectedBlocks[0] === parentList;
	};
	const findSubLists = function(parentList) {
		return Tools_1.default.grep(parentList.querySelectorAll('ol,ul,dl'), function(elm) {
			return NodeType.isListNode(elm);
		});
	};
	const getSelectedSubLists = function(editor) {
		const parentList = getParentList(editor);
		const selectedBlocks = editor.selection.getSelectedBlocks();
		if (isParentListSelected(parentList, selectedBlocks)) {
			return findSubLists(parentList);
		} else {
			return Tools_1.default.grep(selectedBlocks, function(elm) {
				return NodeType.isListNode(elm) && parentList !== elm;
			});
		}
	};
	exports.getSelectedSubLists = getSelectedSubLists;
	const findParentListItemsNodes = function(editor, elms) {
		const listItemsElms = Tools_1.default.map(elms, function(elm) {
			const parentLi = editor.dom.getParent(elm, 'li,dd,dt', getClosestListRootElm(editor, elm));
			return parentLi ? parentLi : elm;
		});
		return DomQuery_1.default.unique(listItemsElms);
	};
	const getSelectedListItems = function(editor) {
		const selectedBlocks = editor.selection.getSelectedBlocks();
		return Tools_1.default.grep(findParentListItemsNodes(editor, selectedBlocks), function(block) {
			return NodeType.isListItemNode(block);
		});
	};
	exports.getSelectedListItems = getSelectedListItems;
	const getSelectedDlItems = (editor) => {
		return katamari_2.Arr.filter(getSelectedListItems(editor), NodeType.isDlItemNode);
	};
	exports.getSelectedDlItems = getSelectedDlItems;
	const getClosestListRootElm = function(editor, elm) {
		const parentTableCell = editor.dom.getParents(elm, 'TD,TH');
		const root = parentTableCell.length > 0 ? parentTableCell[0] : editor.getBody();
		return root;
	};
	exports.getClosestListRootElm = getClosestListRootElm;
	const findLastParentListNode = (editor, elm) => {
		const parentLists = editor.dom.getParents(elm, 'ol,ul', getClosestListRootElm(editor, elm));
		return katamari_2.Arr.last(parentLists);
	};
	const getSelectedLists = (editor) => {
		const firstList = findLastParentListNode(editor, editor.selection.getStart());
		const subsequentLists = katamari_2.Arr.filter(editor.selection.getSelectedBlocks(), NodeType.isOlUlNode);
		return firstList.toArray().concat(subsequentLists);
	};
	const getSelectedListRoots = (editor) => {
		const selectedLists = getSelectedLists(editor);
		return getUniqueListRoots(editor, selectedLists);
	};
	exports.getSelectedListRoots = getSelectedListRoots;
	const getUniqueListRoots = (editor, lists) => {
		const listRoots = katamari_2.Arr.map(lists, (list) => findLastParentListNode(editor, list).getOr(list));
		return DomQuery_1.default.unique(listRoots);
	};
	const isList = (editor) => {
		const list = getParentList(editor);
		return sand_1.HTMLElement.isPrototypeOf(list);
	};
	exports.isList = isList;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('api/Settings', ['require', 'exports'], function(require, exports) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const shouldIndentOnTab = function(editor) {
		return editor.getParam('lists_indent_on_tab', true);
	};
	exports.shouldIndentOnTab = shouldIndentOnTab;
	const getForcedRootBlock = (editor) => {
		const block = editor.getParam('forced_root_block', 'p');
		if (block === false) {
			return '';
		} else if (block === true) {
			return 'p';
		} else {
			return block;
		}
	};
	exports.getForcedRootBlock = getForcedRootBlock;
	const getForcedRootBlockAttrs = (editor) => {
		return editor.getParam('forced_root_block_attrs', {});
	};
	exports.getForcedRootBlockAttrs = getForcedRootBlockAttrs;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('core/TextBlock', ['require', 'exports', 'core/NodeType', 'api/Settings'], function(require, exports, NodeType, Settings) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const createTextBlock = (editor, contentNode) => {
		const dom = editor.dom;
		const blockElements = editor.schema.getBlockElements();
		const fragment = dom.createFragment();
		const blockName = Settings.getForcedRootBlock(editor);
		let node, textBlock, hasContentNode;
		if (blockName) {
			textBlock = dom.create(blockName);
			if (textBlock.tagName === blockName.toUpperCase()) {
				dom.setAttribs(textBlock, Settings.getForcedRootBlockAttrs(editor));
			}
			if (!NodeType.isBlock(contentNode.firstChild, blockElements)) {
				fragment.appendChild(textBlock);
			}
		}
		if (contentNode) {
			while ((node = contentNode.firstChild)) {
				const nodeName = node.nodeName;
				if (!hasContentNode && (nodeName !== 'SPAN' || node.getAttribute('data-mce-type') !== 'bookmark')) {
					hasContentNode = true;
				}
				if (NodeType.isBlock(node, blockElements)) {
					fragment.appendChild(node);
					textBlock = null;
				} else {
					if (blockName) {
						if (!textBlock) {
							textBlock = dom.create(blockName);
							fragment.appendChild(textBlock);
						}
						textBlock.appendChild(node);
					} else {
						fragment.appendChild(node);
					}
				}
			}
		}
		if (!blockName) {
			fragment.appendChild(dom.create('br'));
		} else {
			// BR is needed in empty blocks
			if (!hasContentNode) {
				textBlock.appendChild(dom.create('br', { 'data-mce-bogus': '1' }));
			}
		}
		return fragment;
	};
	exports.createTextBlock = createTextBlock;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('listModel/ComposeList', ['require', 'exports', '@ephox/katamari', '@ephox/sugar'], function(require, exports, katamari_3, sugar_3) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const joinSegment = (parent, child) => {
		sugar_3.Insert.append(parent.item, child.list);
	};
	const joinSegments = (segments) => {
		for (let i = 1; i < segments.length; i++) {
			joinSegment(segments[i - 1], segments[i]);
		}
	};
	const appendSegments = (head, tail) => {
		katamari_3.Options.lift2(katamari_3.Arr.last(head), katamari_3.Arr.head(tail), joinSegment);
	};
	const createSegment = (scope, listType) => {
		const segment = {
			list: sugar_3.Element.fromTag(listType, scope),
			item: sugar_3.Element.fromTag('li', scope),
		};
		sugar_3.Insert.append(segment.list, segment.item);
		return segment;
	};
	const createSegments = (scope, entry, size) => {
		const segments = [];
		for (let i = 0; i < size; i++) {
			segments.push(createSegment(scope, entry.listType));
		}
		return segments;
	};
	const populateSegments = (segments, entry) => {
		for (let i = 0; i < segments.length - 1; i++) {
			sugar_3.Css.set(segments[i].item, 'list-style-type', 'none');
		}
		katamari_3.Arr.last(segments).each((segment) => {
			sugar_3.Attr.setAll(segment.list, entry.listAttributes);
			sugar_3.Attr.setAll(segment.item, entry.itemAttributes);
			sugar_3.InsertAll.append(segment.item, entry.content);
		});
	};
	const normalizeSegment = (segment, entry) => {
		if (sugar_3.Node.name(segment.list) !== entry.listType) {
			segment.list = sugar_3.Replication.mutate(segment.list, entry.listType);
		}
		sugar_3.Attr.setAll(segment.list, entry.listAttributes);
	};
	const createItem = (scope, attr, content) => {
		const item = sugar_3.Element.fromTag('li', scope);
		sugar_3.Attr.setAll(item, attr);
		sugar_3.InsertAll.append(item, content);
		return item;
	};
	const appendItem = (segment, item) => {
		sugar_3.Insert.append(segment.list, item);
		segment.item = item;
	};
	const writeShallow = (scope, cast, entry) => {
		const newCast = cast.slice(0, entry.depth);
		katamari_3.Arr.last(newCast).each((segment) => {
			const item = createItem(scope, entry.itemAttributes, entry.content);
			appendItem(segment, item);
			normalizeSegment(segment, entry);
		});
		return newCast;
	};
	const writeDeep = (scope, cast, entry) => {
		const segments = createSegments(scope, entry, entry.depth - cast.length);
		joinSegments(segments);
		populateSegments(segments, entry);
		appendSegments(cast, segments);
		return cast.concat(segments);
	};
	const composeList = (scope, entries) => {
		const cast = katamari_3.Arr.foldl(entries, (cast, entry) => {
			return entry.depth > cast.length ? writeDeep(scope, cast, entry) : writeShallow(scope, cast, entry);
		}, []);
		return katamari_3.Arr.head(cast).map((segment) => segment.list);
	};
	exports.composeList = composeList;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('listModel/NormalizeEntries', ['require', 'exports', '@ephox/katamari'], function(require, exports, katamari_4) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const cloneListProperties = (target, source) => {
		target.listType = source.listType;
		target.listAttributes = Object.assign({}, source.listAttributes);
	};
	// Closest entry above in the same list
	const previousSiblingEntry = (entries, start) => {
		const depth = entries[start].depth;
		for (let i = start - 1; i >= 0; i--) {
			if (entries[i].depth === depth) {
				return katamari_4.Option.some(entries[i]);
			}
			if (entries[i].depth < depth) {
				break;
			}
		}
		return katamari_4.Option.none();
	};
	const normalizeEntries = (entries) => {
		katamari_4.Arr.each(entries, (entry, i) => {
			previousSiblingEntry(entries, i).each((matchingEntry) => {
				cloneListProperties(entry, matchingEntry);
			});
		});
	};
	exports.normalizeEntries = normalizeEntries;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('listModel/ParseLists', ['require', 'exports', '@ephox/katamari', '@ephox/sugar', 'listModel/Entry', 'listModel/Util'], function(require, exports, katamari_5, sugar_4, Entry_1, Util_2) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const parseItem = (depth, itemSelection, selectionState, item) => {
		return sugar_4.Traverse.firstChild(item).filter(Util_2.isList).fold(() => {
			// Update selectionState (start)
			itemSelection.each((selection) => {
				if (sugar_4.Compare.eq(selection.start, item)) {
					selectionState.set(true);
				}
			});
			const currentItemEntry = Entry_1.createEntry(item, depth, selectionState.get());
			// Update selectionState (end)
			itemSelection.each((selection) => {
				if (sugar_4.Compare.eq(selection.end, item)) {
					selectionState.set(false);
				}
			});
			const childListEntries = sugar_4.Traverse.lastChild(item)
				.filter(Util_2.isList)
				.map((list) => parseList(depth, itemSelection, selectionState, list))
				.getOr([]);
			return currentItemEntry.toArray().concat(childListEntries);
		}, (list) => parseList(depth, itemSelection, selectionState, list));
	};
	const parseList = (depth, itemSelection, selectionState, list) => {
		return katamari_5.Arr.bind(sugar_4.Traverse.children(list), (element) => {
			const parser = Util_2.isList(element) ? parseList : parseItem;
			const newDepth = depth + 1;
			return parser(newDepth, itemSelection, selectionState, element);
		});
	};
	const parseLists = (lists, itemSelection) => {
		const selectionState = katamari_5.Cell(false);
		const initialDepth = 0;
		return katamari_5.Arr.map(lists, (list) => ({
			sourceList: list,
			entries: parseList(initialDepth, itemSelection, selectionState, list),
		}));
	};
	exports.parseLists = parseLists;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('listModel/ListsIndendation', ['require', 'exports', '@ephox/katamari', '@ephox/sugar', 'api/Events', 'core/Selection', 'core/TextBlock', 'listModel/ComposeList', 'listModel/Entry', 'listModel/Indentation', 'listModel/NormalizeEntries', 'listModel/ParseLists', 'listModel/Util'], function(require, exports, katamari_6, sugar_5, Events_1, Selection, TextBlock_1, ComposeList_1, Entry_2, Indentation_1, NormalizeEntries_1, ParseLists_1, Util_3) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const outdentedComposer = (editor, entries) => {
		return katamari_6.Arr.map(entries, (entry) => {
			const content = sugar_5.Fragment.fromElements(entry.content);
			return sugar_5.Element.fromDom(TextBlock_1.createTextBlock(editor, content.dom()));
		});
	};
	const indentedComposer = (editor, entries) => {
		NormalizeEntries_1.normalizeEntries(entries);
		return ComposeList_1.composeList(editor.contentDocument, entries).toArray();
	};
	const composeEntries = (editor, entries) => {
		return katamari_6.Arr.bind(katamari_6.Arr.groupBy(entries, Entry_2.isIndented), (entries) => {
			const groupIsIndented = katamari_6.Arr.head(entries).map(Entry_2.isIndented).getOr(false);
			return groupIsIndented ? indentedComposer(editor, entries) : outdentedComposer(editor, entries);
		});
	};
	const indentSelectedEntries = (entries, indentation) => {
		katamari_6.Arr.each(katamari_6.Arr.filter(entries, Entry_2.isSelected), (entry) => Indentation_1.indentEntry(indentation, entry));
	};
	const getItemSelection = (editor) => {
		const selectedListItems = katamari_6.Arr.map(Selection.getSelectedListItems(editor), sugar_5.Element.fromDom);
		return katamari_6.Options.lift2(katamari_6.Arr.find(selectedListItems, katamari_6.Fun.not(Util_3.hasFirstChildList)), katamari_6.Arr.find(katamari_6.Arr.reverse(selectedListItems), katamari_6.Fun.not(Util_3.hasFirstChildList)), (start, end) => ({ start, end }));
	};
	const listIndentation = (editor, lists, indentation) => {
		const entrySets = ParseLists_1.parseLists(lists, getItemSelection(editor));
		katamari_6.Arr.each(entrySets, (entrySet) => {
			indentSelectedEntries(entrySet.entries, indentation);
			const composedLists = composeEntries(editor, entrySet.entries);
			katamari_6.Arr.each(composedLists, (composedList) => {
				Events_1.fireListEvent(editor, indentation === 'Indent' /* Indent */ ? 'IndentList' /* IndentList */ : 'OutdentList' /* OutdentList */, composedList.dom());
			});
			sugar_5.InsertAll.before(entrySet.sourceList, composedLists);
			sugar_5.Remove.remove(entrySet.sourceList);
		});
	};
	exports.listIndentation = listIndentation;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('core/SplitList', ['require', 'exports', 'tinymce/core/api/dom/DOMUtils', 'core/NodeType', 'core/TextBlock', 'tinymce/core/api/util/Tools'], function(require, exports, DOMUtils_1, NodeType, TextBlock_2, Tools_2) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const DOM = DOMUtils_1.default.DOM;
	const splitList = function(editor, ul, li) {
		let tmpRng, fragment, bookmarks, node, newBlock;
		const removeAndKeepBookmarks = function(targetNode) {
			Tools_2.default.each(bookmarks, function(node) {
				targetNode.parentNode.insertBefore(node, li.parentNode);
			});
			DOM.remove(targetNode);
		};
		bookmarks = DOM.select('span[data-mce-type="bookmark"]', ul);
		newBlock = TextBlock_2.createTextBlock(editor, li);
		tmpRng = DOM.createRng();
		tmpRng.setStartAfter(li);
		tmpRng.setEndAfter(ul);
		fragment = tmpRng.extractContents();
		for (node = fragment.firstChild; node; node = node.firstChild) {
			if (node.nodeName === 'LI' && editor.dom.isEmpty(node)) {
				DOM.remove(node);
				break;
			}
		}
		if (!editor.dom.isEmpty(fragment)) {
			DOM.insertAfter(fragment, ul);
		}
		DOM.insertAfter(newBlock, ul);
		if (NodeType.isEmpty(editor.dom, li.parentNode)) {
			removeAndKeepBookmarks(li.parentNode);
		}
		DOM.remove(li);
		if (NodeType.isEmpty(editor.dom, ul)) {
			DOM.remove(ul);
		}
	};
	exports.splitList = splitList;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('core/DlIndentation', ['require', 'exports', '@ephox/sugar', 'core/SplitList', '@ephox/katamari'], function(require, exports, sugar_6, SplitList, katamari_7) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const outdentDlItem = (editor, item) => {
		if (sugar_6.Compare.is(item, 'dd')) {
			sugar_6.Replication.mutate(item, 'dt');
		} else if (sugar_6.Compare.is(item, 'dt')) {
			sugar_6.Traverse.parent(item).each((dl) => SplitList.splitList(editor, dl.dom(), item.dom()));
		}
	};
	const indentDlItem = (item) => {
		if (sugar_6.Compare.is(item, 'dt')) {
			sugar_6.Replication.mutate(item, 'dd');
		}
	};
	const dlIndentation = (editor, indentation, dlItems) => {
		if (indentation === 'Indent' /* Indent */) {
			katamari_7.Arr.each(dlItems, indentDlItem);
		} else {
			katamari_7.Arr.each(dlItems, (item) => outdentDlItem(editor, item));
		}
	};
	exports.dlIndentation = dlIndentation;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('core/Range', ['require', 'exports', 'tinymce/core/api/dom/RangeUtils', 'core/NodeType'], function(require, exports, RangeUtils_1, NodeType) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const getNormalizedPoint = (container, offset) => {
		if (NodeType.isTextNode(container)) {
			return { container, offset };
		}
		const node = RangeUtils_1.default.getNode(container, offset);
		if (NodeType.isTextNode(node)) {
			return {
				container: node,
				offset: offset >= container.childNodes.length ? node.data.length : 0,
			};
		} else if (node.previousSibling && NodeType.isTextNode(node.previousSibling)) {
			return {
				container: node.previousSibling,
				offset: node.previousSibling.data.length,
			};
		} else if (node.nextSibling && NodeType.isTextNode(node.nextSibling)) {
			return {
				container: node.nextSibling,
				offset: 0,
			};
		}
		return { container, offset };
	};
	exports.getNormalizedPoint = getNormalizedPoint;
	const normalizeRange = (rng) => {
		const outRng = rng.cloneRange();
		const rangeStart = getNormalizedPoint(rng.startContainer, rng.startOffset);
		outRng.setStart(rangeStart.container, rangeStart.offset);
		const rangeEnd = getNormalizedPoint(rng.endContainer, rng.endOffset);
		outRng.setEnd(rangeEnd.container, rangeEnd.offset);
		return outRng;
	};
	exports.normalizeRange = normalizeRange;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('actions/Indendation', ['require', 'exports', '@ephox/katamari', '@ephox/sugar', 'listModel/ListsIndendation', 'core/DlIndentation', 'core/Range', 'core/Selection'], function(require, exports, katamari_8, sugar_7, ListsIndendation_1, DlIndentation_1, Range, Selection) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const selectionIndentation = (editor, indentation) => {
		const lists = katamari_8.Arr.map(Selection.getSelectedListRoots(editor), sugar_7.Element.fromDom);
		const dlItems = katamari_8.Arr.map(Selection.getSelectedDlItems(editor), sugar_7.Element.fromDom);
		let isHandled = false;
		if (lists.length || dlItems.length) {
			const bookmark = editor.selection.getBookmark();
			ListsIndendation_1.listIndentation(editor, lists, indentation);
			DlIndentation_1.dlIndentation(editor, indentation, dlItems);
			editor.selection.moveToBookmark(bookmark);
			editor.selection.setRng(Range.normalizeRange(editor.selection.getRng()));
			editor.nodeChanged();
			isHandled = true;
		}
		return isHandled;
	};
	const indentListSelection = (editor) => {
		return selectionIndentation(editor, 'Indent' /* Indent */);
	};
	exports.indentListSelection = indentListSelection;
	const outdentListSelection = (editor) => {
		return selectionIndentation(editor, 'Outdent' /* Outdent */);
	};
	exports.outdentListSelection = outdentListSelection;
	const flattenListSelection = (editor) => {
		return selectionIndentation(editor, 'Flatten' /* Flatten */);
	};
	exports.flattenListSelection = flattenListSelection;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('core/Bookmark', ['require', 'exports', 'tinymce/core/api/dom/DOMUtils', 'core/Range'], function(require, exports, DOMUtils_2, Range) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const DOM = DOMUtils_2.default.DOM;
	/**
     * Returns a range bookmark. This will convert indexed bookmarks into temporary span elements with
     * index 0 so that they can be restored properly after the DOM has been modified. Text bookmarks will not have spans
     * added to them since they can be restored after a dom operation.
     *
     * So this: <p><b>|</b><b>|</b></p>
     * becomes: <p><b><span data-mce-type="bookmark">|</span></b><b data-mce-type="bookmark">|</span></b></p>
     *
     * @param  {DOMRange} rng DOM Range to get bookmark on.
     * @return {Object} Bookmark object.
     */
	const createBookmark = function(rng) {
		const bookmark = {};
		const setupEndPoint = function(start) {
			let offsetNode, container, offset;
			container = rng[start ? 'startContainer' : 'endContainer'];
			offset = rng[start ? 'startOffset' : 'endOffset'];
			if (container.nodeType === 1) {
				offsetNode = DOM.create('span', { 'data-mce-type': 'bookmark' });
				if (container.hasChildNodes()) {
					offset = Math.min(offset, container.childNodes.length - 1);
					if (start) {
						container.insertBefore(offsetNode, container.childNodes[offset]);
					} else {
						DOM.insertAfter(offsetNode, container.childNodes[offset]);
					}
				} else {
					container.appendChild(offsetNode);
				}
				container = offsetNode;
				offset = 0;
			}
			bookmark[start ? 'startContainer' : 'endContainer'] = container;
			bookmark[start ? 'startOffset' : 'endOffset'] = offset;
		};
		setupEndPoint(true);
		if (!rng.collapsed) {
			setupEndPoint();
		}
		return bookmark;
	};
	exports.createBookmark = createBookmark;
	const resolveBookmark = function(bookmark) {
		function restoreEndPoint(start) {
			let container, offset, node;
			const nodeIndex = function(container) {
				let node = container.parentNode.firstChild, idx = 0;
				while (node) {
					if (node === container) {
						return idx;
					}
					// Skip data-mce-type=bookmark nodes
					if (node.nodeType !== 1 || node.getAttribute('data-mce-type') !== 'bookmark') {
						idx++;
					}
					node = node.nextSibling;
				}
				return -1;
			};
			container = node = bookmark[start ? 'startContainer' : 'endContainer'];
			offset = bookmark[start ? 'startOffset' : 'endOffset'];
			if (!container) {
				return;
			}
			if (container.nodeType === 1) {
				offset = nodeIndex(container);
				container = container.parentNode;
				DOM.remove(node);
				if (!container.hasChildNodes() && DOM.isBlock(container)) {
					container.appendChild(DOM.create('br'));
				}
			}
			bookmark[start ? 'startContainer' : 'endContainer'] = container;
			bookmark[start ? 'startOffset' : 'endOffset'] = offset;
		}
		restoreEndPoint(true);
		restoreEndPoint();
		const rng = DOM.createRng();
		rng.setStart(bookmark.startContainer, bookmark.startOffset);
		if (bookmark.endContainer) {
			rng.setEnd(bookmark.endContainer, bookmark.endOffset);
		}
		return Range.normalizeRange(rng);
	};
	exports.resolveBookmark = resolveBookmark;
});
define('core/Util', ['require', 'exports'], function(require, exports) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	exports.isCustomList = (list) => /\btox\-/.test(list.className);
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('actions/ToggleList', ['require', 'exports', 'tinymce/core/api/dom/BookmarkManager', 'tinymce/core/api/util/Tools', 'core/Bookmark', 'core/NodeType', 'core/Selection', 'actions/Indendation', 'api/Events', 'core/Util', 'core/ListAction'], function(require, exports, BookmarkManager_1, Tools_3, Bookmark, NodeType, Selection, Indendation_1, Events_2, Util_4, ListAction_1) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const updateListStyle = function(dom, el, detail) {
		const type = detail['list-style-type'] ? detail['list-style-type'] : null;
		dom.setStyle(el, 'list-style-type', type);
	};
	const setAttribs = function(elm, attrs) {
		Tools_3.default.each(attrs, function(value, key) {
			elm.setAttribute(key, value);
		});
	};
	const updateListAttrs = function(dom, el, detail) {
		setAttribs(el, detail['list-attributes']);
		Tools_3.default.each(dom.select('li', el), function(li) {
			setAttribs(li, detail['list-item-attributes']);
		});
	};
	const updateListWithDetails = function(dom, el, detail) {
		updateListStyle(dom, el, detail);
		updateListAttrs(dom, el, detail);
	};
	const removeStyles = (dom, element, styles) => {
		Tools_3.default.each(styles, (style) => dom.setStyle(element, { [style]: '' }));
	};
	const getEndPointNode = function(editor, rng, start, root) {
		let container, offset;
		container = rng[start ? 'startContainer' : 'endContainer'];
		offset = rng[start ? 'startOffset' : 'endOffset'];
		// Resolve node index
		if (container.nodeType === 1) {
			container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
		}
		if (!start && NodeType.isBr(container.nextSibling)) {
			container = container.nextSibling;
		}
		while (container.parentNode !== root) {
			if (NodeType.isTextBlock(editor, container)) {
				return container;
			}
			if (/^(TD|TH)$/.test(container.parentNode.nodeName)) {
				return container;
			}
			container = container.parentNode;
		}
		return container;
	};
	const getSelectedTextBlocks = function(editor, rng, root) {
		const textBlocks = [], dom = editor.dom;
		const startNode = getEndPointNode(editor, rng, true, root);
		const endNode = getEndPointNode(editor, rng, false, root);
		let block;
		const siblings = [];
		for (let node = startNode; node; node = node.nextSibling) {
			siblings.push(node);
			if (node === endNode) {
				break;
			}
		}
		Tools_3.default.each(siblings, function(node) {
			if (NodeType.isTextBlock(editor, node)) {
				textBlocks.push(node);
				block = null;
				return;
			}
			if (dom.isBlock(node) || NodeType.isBr(node)) {
				if (NodeType.isBr(node)) {
					dom.remove(node);
				}
				block = null;
				return;
			}
			const nextSibling = node.nextSibling;
			if (BookmarkManager_1.default.isBookmarkNode(node)) {
				if (NodeType.isTextBlock(editor, nextSibling) || (!nextSibling && node.parentNode === root)) {
					block = null;
					return;
				}
			}
			if (!block) {
				block = dom.create('p');
				node.parentNode.insertBefore(block, node);
				textBlocks.push(block);
			}
			block.appendChild(node);
		});
		return textBlocks;
	};
	const hasCompatibleStyle = function(dom, sib, detail) {
		const sibStyle = dom.getStyle(sib, 'list-style-type');
		let detailStyle = detail ? detail['list-style-type'] : '';
		detailStyle = detailStyle === null ? '' : detailStyle;
		return sibStyle === detailStyle;
	};
	const applyList = function(editor, listName, detail = {}) {
		const rng = editor.selection.getRng(true);
		let bookmark;
		let listItemName = 'LI';
		const root = Selection.getClosestListRootElm(editor, editor.selection.getStart(true));
		const dom = editor.dom;
		if (dom.getContentEditable(editor.selection.getNode()) === 'false') {
			return;
		}
		listName = listName.toUpperCase();
		if (listName === 'DL') {
			listItemName = 'DT';
		}
		bookmark = Bookmark.createBookmark(rng);
		Tools_3.default.each(getSelectedTextBlocks(editor, rng, root), function(block) {
			let listBlock, sibling;
			sibling = block.previousSibling;
			if (sibling && NodeType.isListNode(sibling) && sibling.nodeName === listName && hasCompatibleStyle(dom, sibling, detail)) {
				listBlock = sibling;
				block = dom.rename(block, listItemName);
				sibling.appendChild(block);
			} else {
				listBlock = dom.create(listName);
				block.parentNode.insertBefore(listBlock, block);
				listBlock.appendChild(block);
				block = dom.rename(block, listItemName);
			}
			removeStyles(dom, block, [
				'margin', 'margin-right', 'margin-bottom', 'margin-left', 'margin-top',
				'padding', 'padding-right', 'padding-bottom', 'padding-left', 'padding-top',
			]);
			updateListWithDetails(dom, listBlock, detail);
			mergeWithAdjacentLists(editor.dom, listBlock);
		});
		editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
	};
	const isValidLists = function(list1, list2) {
		return list1 && list2 && NodeType.isListNode(list1) && list1.nodeName === list2.nodeName;
	};
	const hasSameListStyle = function(dom, list1, list2) {
		const targetStyle = dom.getStyle(list1, 'list-style-type', true);
		const style = dom.getStyle(list2, 'list-style-type', true);
		return targetStyle === style;
	};
	const hasSameClasses = function(elm1, elm2) {
		return elm1.className === elm2.className;
	};
	const shouldMerge = function(dom, list1, list2) {
		return isValidLists(list1, list2) && hasSameListStyle(dom, list1, list2) && hasSameClasses(list1, list2);
	};
	const mergeWithAdjacentLists = function(dom, listBlock) {
		let sibling, node;
		sibling = listBlock.nextSibling;
		if (shouldMerge(dom, listBlock, sibling)) {
			while ((node = sibling.firstChild)) {
				listBlock.appendChild(node);
			}
			dom.remove(sibling);
		}
		sibling = listBlock.previousSibling;
		if (shouldMerge(dom, listBlock, sibling)) {
			while ((node = sibling.lastChild)) {
				listBlock.insertBefore(node, listBlock.firstChild);
			}
			dom.remove(sibling);
		}
	};
	exports.mergeWithAdjacentLists = mergeWithAdjacentLists;
	const updateList = function(editor, list, listName, detail) {
		if (list.nodeName !== listName) {
			const newList = editor.dom.rename(list, listName);
			updateListWithDetails(editor.dom, newList, detail);
			Events_2.fireListEvent(editor, ListAction_1.listToggleActionFromListName(listName), newList);
		} else {
			updateListWithDetails(editor.dom, list, detail);
			Events_2.fireListEvent(editor, ListAction_1.listToggleActionFromListName(listName), list);
		}
	};
	const toggleMultipleLists = function(editor, parentList, lists, listName, detail) {
		if (parentList.nodeName === listName && !hasListStyleDetail(detail)) {
			Indendation_1.flattenListSelection(editor);
		} else {
			const bookmark = Bookmark.createBookmark(editor.selection.getRng(true));
			Tools_3.default.each([parentList].concat(lists), function(elm) {
				updateList(editor, elm, listName, detail);
			});
			editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
		}
	};
	const hasListStyleDetail = function(detail) {
		return 'list-style-type' in detail;
	};
	const toggleSingleList = function(editor, parentList, listName, detail) {
		if (parentList === editor.getBody()) {
			return;
		}
		if (parentList) {
			if (parentList.nodeName === listName && !hasListStyleDetail(detail) && !Util_4.isCustomList(parentList)) {
				Indendation_1.flattenListSelection(editor);
			} else {
				const bookmark = Bookmark.createBookmark(editor.selection.getRng(true));
				updateListWithDetails(editor.dom, parentList, detail);
				const newList = editor.dom.rename(parentList, listName);
				mergeWithAdjacentLists(editor.dom, newList);
				editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
				Events_2.fireListEvent(editor, ListAction_1.listToggleActionFromListName(listName), newList);
			}
		} else {
			applyList(editor, listName, detail);
			Events_2.fireListEvent(editor, ListAction_1.listToggleActionFromListName(listName), parentList);
		}
	};
	const toggleList = function(editor, listName, detail) {
		const parentList = Selection.getParentList(editor);
		const selectedSubLists = Selection.getSelectedSubLists(editor);
		detail = detail ? detail : {};
		if (parentList && selectedSubLists.length > 0) {
			toggleMultipleLists(editor, parentList, selectedSubLists, listName, detail);
		} else {
			toggleSingleList(editor, parentList, listName, detail);
		}
	};
	exports.toggleList = toggleList;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('core/NormalizeLists', ['require', 'exports', 'tinymce/core/api/dom/DOMUtils', 'tinymce/core/api/util/Tools', 'core/NodeType'], function(require, exports, DOMUtils_3, Tools_4, NodeType) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const DOM = DOMUtils_3.default.DOM;
	const normalizeList = function(dom, ul) {
		let sibling;
		const parentNode = ul.parentNode;
		// Move UL/OL to previous LI if it's the only child of a LI
		if (parentNode.nodeName === 'LI' && parentNode.firstChild === ul) {
			sibling = parentNode.previousSibling;
			if (sibling && sibling.nodeName === 'LI') {
				sibling.appendChild(ul);
				if (NodeType.isEmpty(dom, parentNode)) {
					DOM.remove(parentNode);
				}
			} else {
				DOM.setStyle(parentNode, 'listStyleType', 'none');
			}
		}
		// Append OL/UL to previous LI if it's in a parent OL/UL i.e. old HTML4
		if (NodeType.isListNode(parentNode)) {
			sibling = parentNode.previousSibling;
			if (sibling && sibling.nodeName === 'LI') {
				sibling.appendChild(ul);
			}
		}
	};
	exports.normalizeList = normalizeList;
	const normalizeLists = function(dom, element) {
		Tools_4.default.each(Tools_4.default.grep(dom.select('ol,ul', element)), function(ul) {
			normalizeList(dom, ul);
		});
	};
	exports.normalizeLists = normalizeLists;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('core/Delete', ['require', 'exports', '@ephox/katamari', '@ephox/sugar', 'tinymce/core/api/dom/RangeUtils', 'tinymce/core/api/dom/TreeWalker', 'tinymce/core/api/util/VK', 'actions/Indendation', 'actions/ToggleList', 'core/Bookmark', 'core/NodeType', 'core/NormalizeLists', 'core/Range', 'core/Selection'], function(require, exports, katamari_9, sugar_8, RangeUtils_2, TreeWalker_1, VK_1, Indendation_2, ToggleList, Bookmark, NodeType, NormalizeLists, Range, Selection) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const findNextCaretContainer = function(editor, rng, isForward, root) {
		let node = rng.startContainer;
		const offset = rng.startOffset;
		if (NodeType.isTextNode(node) && (isForward ? offset < node.data.length : offset > 0)) {
			return node;
		}
		const nonEmptyBlocks = editor.schema.getNonEmptyElements();
		if (node.nodeType === 1) {
			node = RangeUtils_2.default.getNode(node, offset);
		}
		const walker = new TreeWalker_1.default(node, root);
		// Delete at <li>|<br></li> then jump over the bogus br
		if (isForward) {
			if (NodeType.isBogusBr(editor.dom, node)) {
				walker.next();
			}
		}
		while ((node = walker[isForward ? 'next' : 'prev2']())) {
			if (node.nodeName === 'LI' && !node.hasChildNodes()) {
				return node;
			}
			if (nonEmptyBlocks[node.nodeName]) {
				return node;
			}
			if (NodeType.isTextNode(node) && node.data.length > 0) {
				return node;
			}
		}
	};
	const hasOnlyOneBlockChild = function(dom, elm) {
		const childNodes = elm.childNodes;
		return childNodes.length === 1 && !NodeType.isListNode(childNodes[0]) && dom.isBlock(childNodes[0]);
	};
	const unwrapSingleBlockChild = function(dom, elm) {
		if (hasOnlyOneBlockChild(dom, elm)) {
			dom.remove(elm.firstChild, true);
		}
	};
	const moveChildren = function(dom, fromElm, toElm) {
		let node, targetElm;
		targetElm = hasOnlyOneBlockChild(dom, toElm) ? toElm.firstChild : toElm;
		unwrapSingleBlockChild(dom, fromElm);
		if (!NodeType.isEmpty(dom, fromElm, true)) {
			while ((node = fromElm.firstChild)) {
				targetElm.appendChild(node);
			}
		}
	};
	const mergeLiElements = function(dom, fromElm, toElm) {
		let node, listNode;
		const ul = fromElm.parentNode;
		if (!NodeType.isChildOfBody(dom, fromElm) || !NodeType.isChildOfBody(dom, toElm)) {
			return;
		}
		if (NodeType.isListNode(toElm.lastChild)) {
			listNode = toElm.lastChild;
		}
		if (ul === toElm.lastChild) {
			if (NodeType.isBr(ul.previousSibling)) {
				dom.remove(ul.previousSibling);
			}
		}
		node = toElm.lastChild;
		if (node && NodeType.isBr(node) && fromElm.hasChildNodes()) {
			dom.remove(node);
		}
		if (NodeType.isEmpty(dom, toElm, true)) {
			dom.$(toElm).empty();
		}
		moveChildren(dom, fromElm, toElm);
		if (listNode) {
			toElm.appendChild(listNode);
		}
		const contains = sugar_8.Compare.contains(sugar_8.Element.fromDom(toElm), sugar_8.Element.fromDom(fromElm));
		const nestedLists = contains ? dom.getParents(fromElm, NodeType.isListNode, toElm) : [];
		dom.remove(fromElm);
		katamari_9.Arr.each(nestedLists, (list) => {
			if (NodeType.isEmpty(dom, list) && list !== dom.getRoot()) {
				dom.remove(list);
			}
		});
	};
	const mergeIntoEmptyLi = function(editor, fromLi, toLi) {
		editor.dom.$(toLi).empty();
		mergeLiElements(editor.dom, fromLi, toLi);
		editor.selection.setCursorLocation(toLi);
	};
	const mergeForward = function(editor, rng, fromLi, toLi) {
		const dom = editor.dom;
		if (dom.isEmpty(toLi)) {
			mergeIntoEmptyLi(editor, fromLi, toLi);
		} else {
			const bookmark = Bookmark.createBookmark(rng);
			mergeLiElements(dom, fromLi, toLi);
			editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
		}
	};
	const mergeBackward = function(editor, rng, fromLi, toLi) {
		const bookmark = Bookmark.createBookmark(rng);
		mergeLiElements(editor.dom, fromLi, toLi);
		const resolvedBookmark = Bookmark.resolveBookmark(bookmark);
		editor.selection.setRng(resolvedBookmark);
	};
	const backspaceDeleteFromListToListCaret = function(editor, isForward) {
		const dom = editor.dom, selection = editor.selection;
		const selectionStartElm = selection.getStart();
		const root = Selection.getClosestListRootElm(editor, selectionStartElm);
		const li = dom.getParent(selection.getStart(), 'LI', root);
		if (li) {
			const ul = li.parentNode;
			if (ul === editor.getBody() && NodeType.isEmpty(dom, ul)) {
				return true;
			}
			const rng = Range.normalizeRange(selection.getRng());
			const otherLi = dom.getParent(findNextCaretContainer(editor, rng, isForward, root), 'LI', root);
			if (otherLi && otherLi !== li) {
				editor.undoManager.transact(() => {
					if (isForward) {
						mergeForward(editor, rng, otherLi, li);
					} else {
						if (NodeType.isFirstChild(li)) {
							Indendation_2.outdentListSelection(editor);
						} else {
							mergeBackward(editor, rng, li, otherLi);
						}
					}
				});
				return true;
			} else if (!otherLi) {
				if (!isForward && rng.startOffset === 0 && rng.endOffset === 0) {
					editor.undoManager.transact(() => {
						Indendation_2.flattenListSelection(editor);
					});
					return true;
				}
			}
		}
		return false;
	};
	const removeBlock = function(dom, block, root) {
		const parentBlock = dom.getParent(block.parentNode, dom.isBlock, root);
		dom.remove(block);
		if (parentBlock && dom.isEmpty(parentBlock)) {
			dom.remove(parentBlock);
		}
	};
	const backspaceDeleteIntoListCaret = function(editor, isForward) {
		const dom = editor.dom;
		const selectionStartElm = editor.selection.getStart();
		const root = Selection.getClosestListRootElm(editor, selectionStartElm);
		const block = dom.getParent(selectionStartElm, dom.isBlock, root);
		if (block && dom.isEmpty(block)) {
			const rng = Range.normalizeRange(editor.selection.getRng());
			const otherLi = dom.getParent(findNextCaretContainer(editor, rng, isForward, root), 'LI', root);
			if (otherLi) {
				editor.undoManager.transact(function() {
					removeBlock(dom, block, root);
					ToggleList.mergeWithAdjacentLists(dom, otherLi.parentNode);
					editor.selection.select(otherLi, true);
					editor.selection.collapse(isForward);
				});
				return true;
			}
		}
		return false;
	};
	const backspaceDeleteCaret = function(editor, isForward) {
		return backspaceDeleteFromListToListCaret(editor, isForward) || backspaceDeleteIntoListCaret(editor, isForward);
	};
	const backspaceDeleteRange = function(editor) {
		const selectionStartElm = editor.selection.getStart();
		const root = Selection.getClosestListRootElm(editor, selectionStartElm);
		const startListParent = editor.dom.getParent(selectionStartElm, 'LI,DT,DD', root);
		if (startListParent || Selection.getSelectedListItems(editor).length > 0) {
			editor.undoManager.transact(function() {
				editor.execCommand('Delete');
				NormalizeLists.normalizeLists(editor.dom, editor.getBody());
			});
			return true;
		}
		return false;
	};
	const backspaceDelete = function(editor, isForward) {
		return editor.selection.isCollapsed() ? backspaceDeleteCaret(editor, isForward) : backspaceDeleteRange(editor);
	};
	exports.backspaceDelete = backspaceDelete;
	const setup = function(editor) {
		editor.on('keydown', function(e) {
			if (e.keyCode === VK_1.default.BACKSPACE) {
				if (backspaceDelete(editor, false)) {
					e.preventDefault();
				}
			} else if (e.keyCode === VK_1.default.DELETE) {
				if (backspaceDelete(editor, true)) {
					e.preventDefault();
				}
			}
		});
	};
	exports.setup = setup;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('api/Api', ['require', 'exports', 'core/Delete'], function(require, exports, Delete) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const get = function(editor) {
		return {
			backspaceDelete(isForward) {
				Delete.backspaceDelete(editor, isForward);
			},
		};
	};
	exports.get = get;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('api/Commands', ['require', 'exports', 'actions/ToggleList', 'actions/Indendation'], function(require, exports, ToggleList, Indendation_3) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const queryListCommandState = function(editor, listName) {
		return function() {
			const parentList = editor.dom.getParent(editor.selection.getStart(), 'UL,OL,DL');
			return parentList && parentList.nodeName === listName;
		};
	};
	const register = function(editor) {
		editor.on('BeforeExecCommand', function(e) {
			const cmd = e.command.toLowerCase();
			if (cmd === 'indent') {
				Indendation_3.indentListSelection(editor);
			} else if (cmd === 'outdent') {
				Indendation_3.outdentListSelection(editor);
			}
		});
		editor.addCommand('InsertUnorderedList', function(ui, detail) {
			ToggleList.toggleList(editor, 'UL', detail);
		});
		editor.addCommand('InsertOrderedList', function(ui, detail) {
			ToggleList.toggleList(editor, 'OL', detail);
		});
		editor.addCommand('InsertDefinitionList', function(ui, detail) {
			ToggleList.toggleList(editor, 'DL', detail);
		});
		editor.addCommand('RemoveList', () => {
			Indendation_3.flattenListSelection(editor);
		});
		editor.addQueryStateHandler('InsertUnorderedList', queryListCommandState(editor, 'UL'));
		editor.addQueryStateHandler('InsertOrderedList', queryListCommandState(editor, 'OL'));
		editor.addQueryStateHandler('InsertDefinitionList', queryListCommandState(editor, 'DL'));
	};
	exports.register = register;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('core/Keyboard', ['require', 'exports', 'tinymce/core/api/util/VK', 'api/Settings', 'core/Delete', 'actions/Indendation'], function(require, exports, VK_2, Settings, Delete, Indendation_4) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const setupTabKey = function(editor) {
		editor.on('keydown', function(e) {
			// Check for tab but not ctrl/cmd+tab since it switches browser tabs
			if (e.keyCode !== VK_2.default.TAB || VK_2.default.metaKeyPressed(e)) {
				return;
			}
			editor.undoManager.transact(() => {
				if (e.shiftKey ? Indendation_4.outdentListSelection(editor) : Indendation_4.indentListSelection(editor)) {
					e.preventDefault();
				}
			});
		});
	};
	const setup = function(editor) {
		if (Settings.shouldIndentOnTab(editor)) {
			setupTabKey(editor);
		}
		Delete.setup(editor);
	};
	exports.setup = setup;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('ui/Buttons', ['require', 'exports', 'tinymce/core/api/util/Tools', 'core/NodeType', 'core/Util'], function(require, exports, Tools_5, NodeType, Util_5) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	const findIndex = function(list, predicate) {
		for (let index = 0; index < list.length; index++) {
			const element = list[index];
			if (predicate(element)) {
				return index;
			}
		}
		return -1;
	};
	const listState = function(editor, listName) {
		return function(buttonApi) {
			const nodeChangeHandler = (e) => {
				const tableCellIndex = findIndex(e.parents, NodeType.isTableCellNode);
				const parents = tableCellIndex !== -1 ? e.parents.slice(0, tableCellIndex) : e.parents;
				const lists = Tools_5.default.grep(parents, NodeType.isListNode);
				buttonApi.setActive(lists.length > 0 && lists[0].nodeName === listName && !Util_5.isCustomList(lists[0]));
			};
			editor.on('NodeChange', nodeChangeHandler);
			return () => editor.off('NodeChange', nodeChangeHandler);
		};
	};
	const register = function(editor) {
		const hasPlugin = function(editor, plugin) {
			const plugins = editor.settings.plugins ? editor.settings.plugins : '';
			return Tools_5.default.inArray(plugins.split(/[ ,]/), plugin) !== -1;
		};
		const exec = (command) => () => editor.execCommand(command);
		if (!hasPlugin(editor, 'advlist')) {
			editor.ui.registry.addToggleButton('numlist', {
				icon: 'ordered-list',
				active: false,
				tooltip: 'Numbered list',
				onAction: exec('InsertOrderedList'),
				onSetup: listState(editor, 'OL'),
			});
			editor.ui.registry.addToggleButton('bullist', {
				icon: 'unordered-list',
				active: false,
				tooltip: 'Bullet list',
				onAction: exec('InsertUnorderedList'),
				onSetup: listState(editor, 'UL'),
			});
		}
	};
	exports.register = register;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('Plugin', ['require', 'exports', 'tinymce/core/api/PluginManager', 'api/Api', 'api/Commands', 'core/Keyboard', 'ui/Buttons'], function(require, exports, PluginManager_1, Api, Commands, Keyboard, Buttons) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	function default_1() {
		PluginManager_1.default.add('lists', function(editor) {
			Keyboard.setup(editor);
			Buttons.register(editor);
			Commands.register(editor);
			return Api.get(editor);
		});
	}
	exports.default = default_1;
});
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
define('Main', ['require', 'exports', 'Plugin'], function(require, exports, Plugin_1) {
	'use strict';
	Object.defineProperty(exports, '__esModule', { value: true });
	Plugin_1.default();
});
// *****
// DO NOT EXPORT ANYTHING
// IF YOU DO ROLLUP WILL LEAVE A GLOBAL ON THE PAGE
// *****
// # sourceMappingURL=list.js.map
