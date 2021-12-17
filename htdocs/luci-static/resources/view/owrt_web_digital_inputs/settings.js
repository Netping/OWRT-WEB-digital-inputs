'use strict';
'require form';
'require ui';
'require uci';

return L.view.extend({
	handleReset: null,
	load: function() {
		return Promise.all([
			uci.load('diginsensorconf')
		]);
  },
  render: function() {
	let map, section, option;

	function handleDelete(map, id) {
		uci.remove('diginsensorconf', id);
		map.render();
		ui.hideModal();
	}

	function handleAdd(m) {
		let id = uci.add(m.config, 'sensor');
		uci.set(m.config, id, 'name');
		m.render();
	};

	map = new form.Map('diginsensorconf', _('msg_sensors'));
	section = map.section(form.TypedSection, 'sensor');
	section.filter = (name) => (name !== 'prototype');
	section.addremove = false;
	section.anonymous = true;
	section.nodescriptions = true;

	option = section.option(form.DummyValue);
	option.render = L.bind((view, id) => {
		const name = uci.get(map.config, id).name;
		let sectionElement = E('div', { 'class': 'digital-inputs-section' }, [
			E('div', { 'class': 'digital-inputs-section__title' }, [ name ]),
			E('div', { 'class': 'digital-inputs-section__controls' }, [
				E('button', {
					'class': 'btn cbi-button-remove',
					'click': ui.createHandlerFn(view, handleDelete, map, id),
				}, [ _('msg_delete') ])
			])
		])
		return E([], [ sectionElement ]);
	});

	option = section.option(form.Value, 'name', _('msg_name'));
	option.datatype = 'string';
	option.default = _('msg_new');
	option.rmempty = false;

	option = section.option(form.Value, 'description', _('msg_description'));
	option.datatype = 'string';
	option.rmempty = false;

	option = section.option(form.Value, 'ton_desc', _('msg_ton_desc'));
	option.datatype = 'string';
	option.rmempty = false;

	option = section.option(form.Value, 'toff_desc', _('msg_toff_desc'));
	option.datatype = 'string';
	option.rmempty = false;

	option = section.option(form.ListValue, 'template', _('msg_template'));
	option.load = (id) =>
		Promise.all([uci.get(map.config, id).template])
			.then((result) => (result[0] === 'Empty') ? 'local' : result[0]);

	option.value('local', _('msg_local'));
	option.value('SNMP', _('msg_smnp'));
	option.rmempty = false;

	option = section.option(form.Value, 'snmp_addr', _('msg_snmp_addr'));
	option.depends('template', 'SNMP');
	option.datatype = 'host';
	option.rmempty = false;

	option = section.option(form.Value, 'snmp_port', _('msg_snmp_port'));
	option.depends('template', 'SNMP');
	option.datatype = 'port';
	option.rmempty = false;

	option = section.option(form.Value, 'community', _('msg_snmp_community'));
	option.depends('template', 'SNMP');
	option.datatype = 'string';
	option.rmempty = false;

	option = section.option(form.Value, 'oid', _('msg_snmp_oid'));
	option.depends('template', 'SNMP');
	option.rmempty = false;
	option.validate = (id, value) => ((value.match(/^[a-zA-Z\d+\.]+$/g)) === null) ? _('msg_error_oid') : true;

	option = section.option(form.Value, 'timeout', _('msg_snmp_timeout'));
	option.depends('template', 'SNMP');
	option.datatype = 'range(1,120)';
	option.rmempty = false;

	option = section.option(form.Value, 'period', _('msg_period'));
	option.datatype = 'min(1)';
	option.rmempty = false;

	section = map.section(form.NamedSection, '__add');
	section.rawhtml  = true;
	section.unspecified = true;
	section.nocreate = true;
	section.render = L.bind((view, id) =>
		E('div', { 'class': 'digital-inputs-section__add' }, [
			E('button', {
				'class': 'btn cbi-button-add',
				'click': ui.createHandlerFn(view, handleAdd, map, id)
			}, [ _('msg_add_sensor') ])
		]
	));
	map.render().then((form) => {
		view.prepend(form);
		view.append(E('link', { 'rel': 'stylesheet', 'href': L.resource('view/owrt_web_digital_inputs/assets/styles.css') }));
	});
  }
});
