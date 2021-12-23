module("luci.controller.owrt_web_digital_inputs", package.seeall)

function index()
	entry({"admin", "services", "owrt_web_digital_inputs"}, firstchild(), _("owrt_web_digital_inputs"), 60)
	entry({"admin", "services", "owrt_web_digital_inputs", "status"}, view("owrt_web_digital_inputs/status"), _("owrt_web_status"), 10)
	entry({"admin", "services", "owrt_web_digital_inputs", "settings"}, view("owrt_web_digital_inputs/settings"), _("owrt_web_settings"), 30)
end
