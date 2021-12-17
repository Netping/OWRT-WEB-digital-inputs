module("luci.controller.owrt_web_digital_inputs", package.seeall)

function index()
	entry({"admin", "services", "owrt_web_digital_inputs"}, firstchild(), _("msg_title"), 60)
	entry({"admin", "services", "owrt_web_digital_inputs", "status"}, view("owrt_web_digital_inputs/status"), _("msg_status"), 10)
	entry({"admin", "services", "owrt_web_digital_inputs", "settings"}, view("owrt_web_digital_inputs/settings"), _("msg_settngs"), 20)
end
