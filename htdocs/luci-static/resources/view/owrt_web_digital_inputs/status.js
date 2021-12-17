'use strict';
'require ui';
'require uci';
'require rpc';

return L.view.extend({
  handleSaveApply: null,
  handleSave: null,
  handleReset: null,
  load: function() {
	return Promise.all([
		uci.load('diginsensorconf')
	]);
  },
  render: function(html) {
	const sensors = uci.sections('diginsensorconf', 'sensor').filter((e) => (e['.name'] !== 'prototype'));
	let items = [];
	let rows = E([]);
	for (const item in sensors) {
		const sensor = sensors[item];
		const sensorId = sensor['.name'];
		let row = E('tr', {
			'data-id': sensorId,
			'data-toff_desc': sensor.toff_desc,
			'data-ton_desc': sensor.ton_desc
		}, [
			E('td', {}, [
				E('div', { 'class': 'digital-inputs__description' }, sensor.description),
			]),
			E('td', {}, (sensor.snmp_addr) ? _('msg_remote') : _('msg_local')),
			E('td', {
				'data-id': `${sensorId}-state`
			}, '-'),
			E('td', {
				'data-id': `${sensorId}-status`
			}, '-')
		]);
		items.push(row);
		rows.appendChild(row);
	}
	const rpcCall = rpc.declare({
		object: 'owrt_digital_inputs',
		method: 'get_state',
		params: [ 'id_relay', 'time' ],
		expect: {}
	});
	sensors.forEach((sensor) => {
		const id = sensor['.name'];
		const period = sensor['period'];
		if (name !== 'prototype') {
			L.Poll.add(() =>
				L.resolveDefault(rpcCall(id))
					.then((result) => updateTable(id, result))
			, period);
		}
	});
	const updateTable = (id, result) => {
		items.forEach((item) => {
			let data = item.dataset;
			if (data.id === id) {
				item.querySelector(`td[data-id=${id}-state]`).replaceChildren(E('span', (result.state) ? _('msg_on') : _('msg_off')));
				item.querySelector(`td[data-id=${id}-status]`).replaceChildren(E('span', (result.status) ? data.toff_desc : data.ton_desc));
			}
		});
	};
	let body = E([
		E('link', { 'rel': 'stylesheet', 'href': L.resource('view/owrt_web_digital_inputs/assets/styles.css') }),
		E('h2', _('msg_sensors_status')),
		E('div', { 'class': ''}, [
			E('table', { 'class': 'digital-inputs__table' }, [
				E('tr', { 'class' : '' }, [
					E('th', {}, _('msg_name')),
					E('th', {}, _('msg_type')),
					E('th', {}, _('msg_state')),
					E('th', {}, _('msg_status'))
				]
			), rows ])
		]),
	]);
	return body;
  }
});
