'use strict';
'require form';
'require ui';
'require uci';

return L.view.extend({
	uciConfig: 'diginsensorconf',
	handleReset: null,
	load: function() {
		return Promise.all([
			uci.load('diginsensorconf')
		]);
  },
	render: function() {
		let map, section, option;

		map = new form.Map(this.uciConfig, _('owrt_web_sensors'));

		section = map.section(form.GridSection, 'sensor');
		section.nodescriptions = true;
		section.addremove = true;
		section.anonymous = true;
		section.sortable  = true;
		section.addbtntitle = _('owrt_web_add_sensor');
		section.modaltitle = _('owrt_web_edit_sensor');

		section.filter = (name) =>
			(String(name).includes('prototype') || String(name).includes('globals')) === false;

		option = section.option(form.Value, 'name', _('owrt_web_name'));
		option.datatype = 'string';
		option.default = _('owrt_web_new');
		option.rmempty = false;

		option = section.option(form.Value, 'description', _('owrt_web_description'));
		option.datatype = 'string';
		option.rmempty = false;

		option = section.option(form.Value, 'ton_desc', _('owrt_web_ton_desc'));
		option.datatype = 'string';
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'toff_desc', _('owrt_web_toff_desc'));
		option.datatype = 'string';
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.ListValue, 'template', _('owrt_web_template'));
		option.readonly = true;
		option.value('SNMP');
		option.default = 'SNMP';

		option = section.option(form.Value, 'snmp_addr', _('owrt_web_snmp_addr'));
		option.depends('template', 'SNMP');
		option.datatype = 'host';
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'snmp_port', _('owrt_web_snmp_port'));
		option.depends('template', 'SNMP');
		option.datatype = 'port';
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'community', _('owrt_web_snmp_community'));
		option.depends('template', 'SNMP');
		option.datatype = 'string';
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'oid', _('owrt_web_snmp_oid'));
		option.depends('template', 'SNMP');
		option.rmempty = false;
		option.validate = (id, value) => ((value.match(/^[a-zA-Z\d+\.]+$/g)) === null) ? _('owrt_web_error_oid') : true;
		option.modalonly = true;

		option = section.option(form.Value, 'timeout', _('owrt_web_snmp_timeout'));
		option.depends('template', 'SNMP');
		option.datatype = 'range(1,120)';
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'period', _('owrt_web_period'));
		option.datatype = 'min(1)';
		option.rmempty = false;
		option.modalonly = true;

		map.render().then((form) => {
			view.prepend(form);
			view.append(E('link', { 'rel': 'stylesheet', 'href': L.resource('view/owrt_web_digital_inputs/assets/styles.css') }));
		});
	}
});
