const Setting = require('lib/models/Setting');

module.exports = async function(comp, dialogs, type) {
	const buttons = [];
	const sortItemOptions = Setting.enumOptions(type + '.sortOrder.field');

	const makeCheckboxText = function(selected, sign, label) {
		const s = sign === 'tick' ? '✓' : '⬤'
		return (selected ? (s + ' ') : '') + label;
	}

	for (let field in sortItemOptions) {
		if (!sortItemOptions.hasOwnProperty(field)) continue;
		buttons.push({
			text: makeCheckboxText(Setting.value(type + '.sortOrder.field') === field, 'bullet', sortItemOptions[field]),
			id: { name: type + '.sortOrder.field', value: field },
		});
	}

	buttons.push({
		text: makeCheckboxText(Setting.value(type + '.sortOrder.reverse'), 'tick', '[ ' + Setting.settingMetadata(type + '.sortOrder.reverse').label() + ' ]'),
		id: { name: type + '.sortOrder.reverse', value: !Setting.value(type + '.sortOrder.reverse') },
	});

	if (type === 'notes') {
		buttons.push({
			text: makeCheckboxText(Setting.value('uncompletedTodosOnTop'), 'tick', '[ ' + Setting.settingMetadata('uncompletedTodosOnTop').label() + ' ]'),
			id: { name: 'uncompletedTodosOnTop', value: !Setting.value('uncompletedTodosOnTop') },
		});

		buttons.push({
			text: makeCheckboxText(Setting.value('showCompletedTodos'), 'tick', '[ ' + Setting.settingMetadata('showCompletedTodos').label() + ' ]'),
			id: { name: 'showCompletedTodos', value: !Setting.value('showCompletedTodos') },
		});
	}

	const r = await dialogs.pop(comp, Setting.settingMetadata(type + '.sortOrder.field').label(), buttons, {
		style: {
			tipBoxView: {
				width: 50,
				maxHeight: 50,
			},

		},
	});
	if (!r) return;

	Setting.setValue(r.name, r.value);
}