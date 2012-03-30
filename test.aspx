<%@ Page Language="C#" %>

<!DOCTYPE html>
<html>
<head>
	<title>JS loading</title>
	<link rel="stylesheet" media="screen" type="text/css" href="/scripts/static/colorpicker/css/colorpicker.css" />

	<style>
		#redball { background-color: Red; width: 100px; height: 100px;}
	</style>

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script>!window.jQuery && document.write(unescape('%3Cscript src="/scripts/static/jquery-1.7.1.min.js"%3E%3C/script%3E'))</script>
	<script data-main="config.js" src="/scripts/static/require.js"></script>

</head>
<body>

	Initial body text
	<script>
		log("Initial body text");
	</script>
	<script>require("redball")</script>
	<div id="redball" data-js-require="redball"></div>
	Slowing down page rendering<br />
	<%
		Response.Flush();
		System.Threading.Thread.Sleep(1000);
	%>
	Finished coming back<br /><br />

	<p id="colorpicker" data-require-js="myColorPicker" data-require-css="static/colorpicker/css/colorpicker"></p>
	

	<div class="fb-like" data-href="http://newsletter.local/jsloading.aspx" data-send="true" data-width="450" data-show-faces="false" style="width:450px;style:40px;display:block">FB DIV</div>


	Some content after Facebook Slowing down a little bit more

	<%
		Response.Flush();
		System.Threading.Thread.Sleep(1000);
	%>
	
	<div id="fb-root" data-require-js="//connect.facebook.net/en_US/all.js#xfbml=1"></div>
</body>
</html>
