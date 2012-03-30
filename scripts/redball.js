define("redball", function () {
	require(["jquery"], function ($) {

		//Attach event handler via $(document).on to have it run early
		log("Attaching redball jQuery handler");
		$(document).on("click", "#redball", function () {
			log("Running redball click handler");
			$(this).css("background-color", "green");
		});

		//For normal (semi-late) running, use document.ready
		$(function () {
			log("Changing redball background");
			$("#redball").css("background-color", "blue");
		});
	});
});