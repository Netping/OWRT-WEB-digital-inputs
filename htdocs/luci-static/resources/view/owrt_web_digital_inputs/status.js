'use strict';
'require ui';
'require uci';
'require poll';
'require rpc';

return L.view.extend({
	uciConfig: 'diginsensorconf',
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,
	load: function() {
		return Promise.all([
			uci.load(this.uciConfig)
		]);
	},
	rpcCall: rpc.declare({
		object: 'owrt_digital_inputs',
		method: 'get_state',
		params: [ 'name' ],
		expect: {}
	}),
	updateTable: (id, result, items, tdesc) => {
		const statuses = {
			'-2': _('owrt_web_status_notpolled'),
			'-1': _('owrt_web_status_unknown'),
			'0': _('owrt_web_status_norm'),
			'1': _('owrt_web_status_timeout'),
			'2': _('owrt_web_status_error')
		}
		items.forEach((item) => {
			if (item.dataset.id === id) {
				item.querySelector('td[data-id="state"]').replaceChildren(E('span',
					`${tdesc[result.state]}`
				));
				item.querySelector('td[data-id="status"]').replaceChildren(E('span',
					{ 'class': `sensor__status sensor__status--${result.status}` },
					`${statuses[result.status]}`
				));
			}
		});
	},
	render: function(html) {
		const sensors = uci.sections(this.uciConfig, 'sensor').filter((e) =>
			(String(e['.name']).includes('prototype') || String(e['.name']).includes('globals')) === false);

		let items = [];
		let rows = E([]);
		for (const item in sensors) {
			const sensor = sensors[item];
			const sensorId = sensor['.name'];
			let row = E('tr', {
				'data-id': sensorId,
				'class' : 'sensor'
			}, [
				E('td', { 'data-id': 'description' }, [
					E('div', { 'class': 'sensor__name' }, sensor.description),
				]),
				E('td', {}, (sensor.snmp_addr) ? _('owrt_web_remote') : _('owrt_web_local')),
				E('td', { 'data-id': 'state' }, '&#9711'),
				E('td', { 'data-id': 'status' }, '&#9711')
			]);
			items.push(row);
			rows.appendChild(row);
		}

		sensors.forEach((sensor) => {
			const id = sensor['.name'];
			const name = sensor['name'];
			const period = sensor['period'];
			const tdesc = {
				"0": sensor.toff_desc,
				"1": sensor.ton_desc
			}
			poll.add(() =>
				L.resolveDefault(this.rpcCall(name))
					.then((result) => {
						if (result === 4) {
							poll.stop();
							return;
						}
						this.updateTable(id, result, items, tdesc);
					})
			, period);
		});

		let body = E([
			E('link', { 'rel': 'stylesheet', 'href': L.resource('view/owrt_web_digital_inputs/assets/styles.css') }),
			E('h2', _('owrt_web_sensors_status')),
			E('div', { 'class': ''}, [
				E('table', { 'class': 'sensors-table' }, [
					E('tr', { 'class' : '' }, [
						E('th', { 'class' : 'sensors-table__name' }, _('owrt_web_name')),
						E('th', { 'class' : 'sensors-table__type' }, _('owrt_web_type')),
						E('th', { 'class' : 'sensors-table__state' }, _('owrt_web_state')),
						E('th', { 'class' : 'sensors-table__status' }, _('owrt_web_status'))
					]
				), rows ])
			]),
		]);

	return body;
  }
});
