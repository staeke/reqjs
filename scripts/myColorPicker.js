require("static/colorpicker/css/colorpicker", null,  { type: "css" });
require(["jquery", "jquery.colorpicker"], function () {
	$(function () {
		log("Color picker here I come");
		$('#colorpicker').ColorPicker({ flat: true });
	});
});