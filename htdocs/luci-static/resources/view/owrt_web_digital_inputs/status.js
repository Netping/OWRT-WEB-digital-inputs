'use strict';
'require ui';
'require uci';
'require poll';
'require rpc';
'require fs';

let sensors, reloadInterval = 5, uciConfig = 'diginsensorconf';

const table = {
	updateData: (id, result, tdesc) => {
		const statuses = {
			'-2': _('owrt_web_status_notpolled'),
			'-1': _('owrt_web_status_unknown'),
			'0': _('owrt_web_status_norm'),
			'1': _('owrt_web_status_timeout'),
			'2': _('owrt_web_status_error')
		}
		table.getElement().querySelectorAll('tr').forEach((item) => {
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
	buildRows: (sensors) => {
		let rows = E([]);
		for (const item in sensors) {
			const sensor = sensors[item];
			const sensorId = sensor['.name'];
			let row = E('tr', {
				'data-id': sensorId,
				'class' : 'sensor'
			}, [
				E('td', { 'data-id': 'name' }, [
					E('div', { 'class': 'sensor__name' }, sensor.name),
				]),
				E('td', { 'data-id': 'description' }, [
					E('div', { 'class': 'sensor__description' }, sensor.description),
				]),
				E('td', {}, (sensor.snmp_addr) ? _('owrt_web_remote') : _('owrt_web_local')),
				E('td', { 'data-id': 'state' }, '&#9711'),
				E('td', { 'data-id': 'status' }, '&#9711')
			]);
			rows.appendChild(row);
		}
		return rows;
	},
	getElement: () => document.querySelector('table.sensors-table tbody'),
	renderRows: () => table.getElement().replaceChildren(table.buildRows(sensors))
}

const rpcGetState = rpc.declare({
	object: 'owrt_digital_inputs',
	method: 'get_state',
	params: [ 'name' ],
	expect: {}
});

let reloadCounter = 0;

const pollAction = () => {
	for (let index in sensors) {
		const sensor = sensors[index];
		const [ id, name, period ] = [ sensor['.name'], sensor['name'], sensor['period'] ];
		const tdesc = {
			"-1": _('owrt_web_status_unknown'),
			"0": sensor.toff_desc,
			"1": sensor.ton_desc
		}
		L.resolveDefault(rpcGetState(id))
			.then((result) => {
				if (typeof result !== 'object') {
					poll.stop();
					return;
				}
				table.updateData(id, result, tdesc);
			});
	}
	reloadCounter++;
	if (reloadCounter === reloadInterval) {
		reloadCounter = 0;
		loadConfiguration();
	}
}

const getSensors = (json) => {
	let sensors = [];
	const values = json.values;
	for (let value in values) {
		const item = values[value];
		if ((item['.name'].includes('prototype') || item['.name'].includes('globals')) === false) {
			sensors.push(item);
		}
	}
	return sensors;
}

const loadConfiguration = () => {
	if (poll.active()) {
		poll.remove(pollAction);
	};
	L.resolveDefault(fs.exec_direct('ubus', ['call', 'uci', 'get', "{'config':'diginsensorconf'}"], 'json'))
		.then(function(json) {
			sensors = getSensors(json);
			poll.add(pollAction, 1);
			table.renderRows();
		});
}

return L.view.extend({
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,
	load: function() {
		return L.resolveDefault(loadConfiguration())
	},
	render: function(rows) {
		const body = E([
			E('link', { 'rel': 'stylesheet', 'href': L.resource('view/owrt_web_digital_inputs/assets/styles.css') }),
			E('h2', _('owrt_web_sensors_status')),
			E('div', { 'class': ''}, [
				E('table', { 'class': 'sensors-table' }, [
					E('thead', [
						E('tr', { 'class' : '' }, [
							E('th', { 'class' : 'sensors-table__name' }, _('owrt_web_name')),
							E('th', { 'class' : 'sensors-table__description' }, _('owrt_web_description')),
							E('th', { 'class' : 'sensors-table__type' }, _('owrt_web_type')),
							E('th', { 'class' : 'sensors-table__state' }, _('owrt_web_state')),
							E('th', { 'class' : 'sensors-table__status' }, _('owrt_web_status'))
						])
					]),
					E('tbody', [ rows ])
				])
			]),
		]);
		return body;
  }
});
