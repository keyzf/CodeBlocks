var htmleditor = null;
var csseditor = null;
var jseditor = null;
var CurrentActive=null;

var EditorProgramChange = false;

var xGlobalCSSCodeStyleNames = "innerbox_A,innerbox_A_center_tool";
var xGlobalCSSCode = "\n\
.innerbox_A { \n\
		display: -moz-inline-stack;\n\
		display: inline-block;\n\
		zoom: 1;\n\
		vertical-align: middle;\n\
		padding: 5px;\n\
		margin: 0px;\n\
		border: 1px dotted #999; \n\
}\n\
\n\
.innerbox_A_center_tool {\n\
		display: -moz-inline-stack;\n\
		display: inline-block;\n\
		zoom: 1;\n\
		vertical-align: middle;\n\
		padding: 0px;\n\
		margin: 0px;\n\
		width: 0px;\n\
		height: 100%; \n\
		overflow: hidden; \n\
}\n";

var xHTMLCode = '<div class="innerbox_A">\n\
    Some content line<br />\n\
    Some content Some content<br />\n\
    Some content Some\n\
    </div><div class="innerbox_A_center_tool">&nbsp;</div>';

var xCSSWidth = 220;
var xCSSHeight = 150;

var xCSSCode = '##ElementName { \n\
	top:#ElementToppx;\n\
	left:#ElementLeftpx;\n\
	width:#ElementWidthpx;\n\
	height:#ElementHeightpx;\n\
	z-index:#ElementZIndex;\n\
	position:absolute;\n\
	/* -webkit-transform: rotate(5deg); /* Safari and Chrome */\n\
	border-radius: 12.5px;\n\
	background: blue;\n\
	color: white;\n\
	padding: 5px;\n\
	text-align: center;\n\
    box-shadow:\n\
        0px 0px 2px 0px rgba(0,0,0,.5) inset,\n\
        0px 5px 10px 0px rgba(255,255,255,1) inset,\n\
        0px 6px 5px -3px rgba(0,0,0,.5),\n\
        0px 25px 40px -20px rgba(0,0,0,1); }';

var xJSCode = '$.hide();\n\
$.slideDown("slow");';

var ElementNames =  [];
var ElementHTML =   [];
var ElementCSS =    [];
var ElementGlobalCSS =    [];
var ElementGlobalCSSCursor = {row:0, column:0};
var ElementGlobalCSSNames = [];
var originalGlobalCSSContent = "";

var originalGlobalHeadContent = "";

var ElementJS =     [];
var ElementJSDS   = [];

var ElementGlobalHeadCursor = {row:0, column:0};

var ElementHTMLCursor = [];
var ElementCSSCursor = [];
var ElementJSCursor = [];

var codehasChanged = false;


//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
// code links
//
// ace editor
// http://ace.ajax.org/#nav=higlighter
// http://stackoverflow.com/questions/15599597/how-to-load-ace-editor
//
//
// widget stuff
//http://learn.jquery.com/jquery-ui/widget-factory/how-to-use-the-widget-factory/
//https://gist.github.com/andybuchanan/2370489 example




//.focus ( function () { $(this).find('input').select(); $(this).select();


//------------------------------------------------------------------------------------------------------------------
function validateDivName(DivName) {
        var patt=/[^0-9a-zA-Z_-]/
        if(!DivName.match(patt)){
            return true;
        }else{
            return false;
        }
    }

//------------------------------------------------------------------------------------------------------------------
function replaceAll(string, token, newtoken)
{
	if (typeof string =="undefined") { string=""; };
    if(token!=newtoken)
    while(string.indexOf(token) > -1) {
        string = string.replace(token, newtoken);
    }
    return string;
}


//------------------------------------------------------------------------------------------------------------------
function NewElement(ElLeft,ElTop,ElWidth,ElHeight,BaseName,BaseHTML,BaseCSS,BaseJS)
{
	var ElementCount = 0;
	var NewElementName = BaseName+"_0";

	$("#designspace_frame").contents().find("#designspace").children(".FormElement").each(function(idx,itm) {
		ElementCount++;
	});

	NewElementName = BaseName+"_"+(ElementCount+1);

	while ($("#"+NewElementName).length > 0)
	{
		ElementCount++;
		NewElementName = BaseName+"_"+(ElementCount+1);
    }


	// find the z-index of the top-most item
	var maxZindex = 0;
	$("#designspace_frame").contents().find("#designspace").children(".FormElement").each(function(idx,itm) {
		var z = parseInt($(itm).css('z-index'));
		if(isNaN(z)) z = 0;
		if(z > maxZindex) maxZindex = z;
	});

	//make new z-index+1
	ElementJSDS[NewElementName] = false;

	//load default to options
	ElementHTML[NewElementName] = BaseHTML;
	ElementHTMLCursor[NewElementName] = {row:0, column:0};

	var TempCSS = BaseCSS;
	TempCSS = TempCSS.replace("#ElementName",NewElementName);

	TempCSS = TempCSS.replace("#ElementTop",ElTop);
	TempCSS = TempCSS.replace("#ElementLeft",ElLeft);
	TempCSS = TempCSS.replace("#ElementWidth",ElWidth);
	TempCSS = TempCSS.replace("#ElementHeight",ElHeight);
	TempCSS = TempCSS.replace("#ElementZIndex",(maxZindex+1));

	ElementCSS[NewElementName] = TempCSS;
	ElementCSSCursor[NewElementName] = {row:0, column:0};

	ElementGlobalCSS[NewElementName] = xGlobalCSSCode;
	ElementGlobalCSSNames[NewElementName] = xGlobalCSSCodeStyleNames;
	ElementJS[NewElementName] = BaseJS;
	ElementJSCursor[NewElementName] = {row:0, column:0};

	$("#all_form_elements").append('<option value="'+NewElementName+'">'+NewElementName+'</option>');
	setTimeout(function() {
		$("#all_form_elements").combobox('value', NewElementName);
	},50);

	//loop for global css styles, if not found insert
	var tempString = ace.edit("globalcsseditor").getSession().getValue();
	var str_array = ElementGlobalCSSNames[NewElementName].split(',');
	var str_found = false;

	for(var i = 0; i < str_array.length; i++)
	{
	   // Trim the excess whitespace.
	   //str_array[i] = str_array[i].replace(/^\s*/, "").replace(/\s*$/, "");
	   str_array[i] = str_array[i].trim();

	   //use this for whole word search don't need to be case sensitive as css is case sensitive
	   var re = new RegExp("\\b" + str_array[i] + "\\b", "g");
	   if (re.test(tempString)) { str_found = true; }

//	   console.log(re.test(tempString));

//	   if (tempString.toLowerCase().indexOf(str_array[i].toLowerCase()) != -1) { str_found = true; }
//	   console.log(str_array[i]+" "+(tempString.toLowerCase().indexOf(str_array[i].toLowerCase())));
	}
//	console.log(str_found);

	if (!str_found)
	{
		ace.edit("globalcsseditor").selection.clearSelection();
		ace.edit("globalcsseditor").navigateFileEnd();
		ace.edit("globalcsseditor").insert( ElementGlobalCSS[NewElementName] );
		ace.edit("globalcsseditor").resize(true);

		//remove style from head
		$("#designspace_frame").contents().find("#global_dynamic_class").remove();
		//add element style to head
		var style = $("<style />", {
					id  : "global_dynamic_class",
					type: 'text/css',
					html:  ace.edit("globalcsseditor").getSession().getValue()
		}).appendTo( $("#designspace_frame").contents().find("head") );
	}

	document.getElementById('designspace_frame').contentWindow.AddElement(NewElementName);
	document.getElementById('designspace_frame').contentWindow.ElementEditorReady(NewElementName);
}




//------------------------------------------------------------------------------------------------------------------
function loadCssFile(pathToFile) {
	var css = jQuery("<link>");
	css.attr({
		rel:  "stylesheet",
		type: "text/css",
		href: pathToFile
	});
	$("head").append(css);
}






//------------------------------------------------------------------------------------------------------------------
function getInteger(input) {
  if(!input) return "";

  var val = parseInt(input, 10);

  if(isNaN(val)) return "";
  else return val;
}

//------------------------------------------------------------------------------------------------------------------
function resizeControls()
{
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();


	$("#header").css({"left":"0px", "width": (windowWidth) + "px", "top" : "0px"});

	menuYoffset = $("#header").outerHeight();

	editorsWidth = Math.round(windowWidth* 0.30	);
	editorsHeight = Math.round( (windowHeight - (menuYoffset+40) ) / 3 );

	$("#htmleditor_div").css({"top": (menuYoffset+10)+"px", "left":"10px", "height":(editorsHeight-12)+"px", "width":(editorsWidth-12)+"px"});
	$("#htmleditor").css({"height":(editorsHeight-12)+"px", "width":(editorsWidth-12)+"px"});
	

	$("#csseditor_div").css({"top": ($("#htmleditor_div").position().top + $("#htmleditor_div").outerHeight() +10)+"px", "left":"10px", "height":(editorsHeight-12)+"px", "width":(editorsWidth-12)+"px"});
	$("#csseditor").css({"height":(editorsHeight-12)+"px", "width":(editorsWidth-12)+"px"});

	$("#jseditor_div").css({"top": ($("#csseditor_div").position().top + $("#csseditor_div").outerHeight() +10)+"px", "left":"10px", "height":(editorsHeight-12)+"px", "width":(editorsWidth-12)+"px"});
	$("#jseditor").css({"height":(editorsHeight-12)+"px", "width":(editorsWidth-12)+"px"});


	$("#editor_div").css({"top": ( menuYoffset+10)+"px", "left":(10+ $("#htmleditor_div").outerWidth() +10)+"px", "height": ((editorsHeight*3)-12+10+10)+"px", "width": (windowWidth - (editorsWidth+12+10+10+10+310) ) + "px"  });
	$("#designspace_frame").css({"height": ( (editorsHeight*3) + 10 - 5)+"px", "width": (windowWidth - (editorsWidth+12+10+10+10+310) ) + "px"  });

	$("#codeblocks_div").css({"top": (menuYoffset+10)+"px","height":((editorsHeight*3)+8+10)+"px"});
	
	ace.edit("htmleditor").resize();
	ace.edit("csseditor").resize();
	ace.edit("jseditor").resize();
}


//------------------------------------------------------------------------------------------------------------------
var LibrariesXML;

//------------------------------------------------------------------------------------------------------------------
function GetSelectedLibraries()
{
	//loop through the list and list checked items
	$( ".LibraryItem" ).each(function() {
		if ($(this).find(".CheckIcon").length)
		{
			var s = $(this).attr("id");
			while(s.charAt(0) != '_') { s = s.substr(1); } s = s.substr(1);

			console.log("library Item: "+ s );
			console.log($(LibrariesXML).find("item[id="+s+"]").find("ItemInclude").text() );
		}
	});
}

//------------------------------------------------------------------------------------------------------------------
function SetSelectedLibraries(LibID)
{
	//loop through the list and list checked items
	$( ".LibraryItem" ).each(function() {
		var s = $(this).attr("id");
		while(s.charAt(0) != '_') { s = s.substr(1); } s = s.substr(1);

		if (s==LibID) {
			$(this).find(".Libraryicon").append('<div class="CheckIcon"></div>');
		}
	});
}

//------------------------------------------------------------------------------------------------------------------
function SaveLibrariesXML(xml)
{
	LibrariesXML = xml;

	$(xml).find("group").each(function() {
		$("#libraries_div").append('<div id="" class="LibraryItemHeader">'+$(this).attr("name")+'</div>');

		$(this).find("item").each(function() {
			$("#libraries_div").append('<div id="libitem_'+$(this).attr("id")+'" class="LibraryItem"><div class="Libraryicon"><div class="shine"><img class="MenuImage" src="'+$(this).attr("image")+'" ></div></div>\n\
			<b>'+$(this).attr("name")+'</b> - '+$(this).find("ItemDescription").text()+'</div>');
		});
	});

	SetSelectedLibraries("jQuery");
	SetSelectedLibraries("JQueryUI");
	SetSelectedLibraries("TwitterBootstrap");

	$( ".LibraryItem" ).bind('click',function() {
		if ($(this).find(".CheckIcon").length)
		{
			$(this).find(".Libraryicon").find(".CheckIcon").remove();
		} else
		{
			$(this).find(".Libraryicon").append('<div class="CheckIcon"></div>');
		}

		GetSelectedLibraries();

		event.stopPropagation();
		return false;
	});

}

//------------------------------------------------------------------------------------------------------------------
function LoadLibrariesXML()
{
	$.ajax({
		type: "GET",
		url: "libraries.xml?q=430&time="+Math.round(+new Date()/1000),
		dataType: "xml",
		success: SaveLibrariesXML
	});
}



var CodeBlocksXML;

//------------------------------------------------------------------------------------------------------------------
function SaveCodeBlocksXML(xml)
{
	CodeBlocksXML = xml;

	$(xml).find("group").each(function() {
		$("#codeblocks_div").append('<div id="" class="CodeBlocksItemHeader">'+$(this).attr("name")+'</div>');

		$(this).find("item").each(function() {
			$("#codeblocks_div").append('<div class="CodeBlocksItem"><div id="codeblock_'+$(this).attr("id")+'" class="CodeBlocksicon"><div class="CodeBlocksshine"><img class="MenuImage" src="'+$(this).attr("image")+'" ></div></div>\n\
			<b>'+$(this).attr("name")+'</b> - '+$(this).find("ItemDescription").text()+'</div>');
		});
	});

	$( ".CodeBlocksItem .CodeBlocksicon" ).draggable({
		grid: [ 5,5 ],
		helper:'clone',
		iframeFix: true,

		appendTo: 'body',
		containment: 'window',
		zIndex: 1500,

		revert: 'invalid'
	});

	$( ".CodeBlocksItem" ).bind('click',function() {
		event.stopPropagation();
		return false;
	});


}

//------------------------------------------------------------------------------------------------------------------
function LoadCodeBlocksXML()
{
	$.ajax({
		type: "GET",
		url: "codeblocks.xml?q=430&time="+Math.round(+new Date()/1000),
		dataType: "xml",
		success: SaveCodeBlocksXML
	});
}



//------------------------------------------------------------------------------------------------------------------
$(document).ready(function() {
	$('#designspace_frame').attr("src","iframebegin.html");

	LoadLibrariesXML();
	LoadCodeBlocksXML();

	$('html').click(function() {
		//add all close calls here
		//need to add  event.stopPropagation(); into the show part

		$( "#libraries_div" ).hide('slide', { direction: 'up' }, 300, function() { $( "#libraries_btn" ).removeClass("topMenuSelected").addClass("aiButton"); } );
//		$( "#codeblocks_div" ).hide('slide', { direction: 'up' }, 300, function() { $( "#codeblocks_btn" ).removeClass("topMenuSelected").addClass("aiButton"); } );

	});

	$("#htmleditor_div_hint").show();
	$("#csseditor_div_hint").show();
	$("#jseditor_div_hint").show();

	$("#globaldialog").dialog({ autoOpen: false,  modal: true, resizable:false, minWidth:820, minHeight:600  });
	$("#globaldialog").dialog({
	buttons : {
		"Update" : function() {
			//remove style from head
			$("#designspace_frame").contents().find("#global_dynamic_class").remove();
			//add element style to head
			var style = $("<style />", {
						id  : "global_dynamic_class",
						type: 'text/css',
						html:  ace.edit("globalcsseditor").getSession().getValue()
			}).appendTo( $("#designspace_frame").contents().find("head") );
			ElementGlobalCSSCursor = ace.edit("globalcsseditor").getSession().selection.getCursor();

			$(this).dialog("close");
		}
	},
	beforeClose: function(event,ui){
        if (event.originalEvent && event.originalEvent.originalEvent && event.originalEvent.originalEvent.type == "click") {
			ace.edit("globalcsseditor").setValue( originalGlobalCSSContent );
        }
	}});

	$("#globalheaddialog").dialog({ autoOpen: false,  modal: true, resizable:false, minWidth:820, minHeight:600  });
	$("#globalheaddialog").dialog({
	buttons : {
		"Update" : function() {
			//remove style from head
			//$("#global_dynamic_class").remove();

			//add element style to head
			/*
			var style = $("<style />", {
						id  : "global_dynamic_class",
						type: 'text/css',
						html:  ace.edit("globalcsseditor").getSession().getValue()
			}).appendTo("head");
			*/
			ElementGlobalHeadCursor = ace.edit("globalheadeditor").getSession().selection.getCursor();

			$(this).dialog("close");
		}
	},
	beforeClose: function(event,ui){
        if (event.originalEvent && event.originalEvent.originalEvent && event.originalEvent.originalEvent.type == "click") {
			console.log("2:"+originalGlobalHeadContent);
			ace.edit("globalheadeditor").setValue( originalGlobalHeadContent );
        }
	}});



	$("#all_form_elements").combobox();

	var htmleditor = ace.edit("htmleditor");
	htmleditor.getSession().setUseWorker(false);
	htmleditor.setTheme("ace/theme/chrome");
	htmleditor.getSession().setMode("ace/mode/html");
	htmleditor.getSession().on('change', function() { codehasChanged=true;} );
	htmleditor.on('focus', function() {  $("#htmleditor_div_hint").fadeOut(250);   } );
	htmleditor.on('blur', function() {  $("#htmleditor_div_hint").fadeIn(250); } );

	var csseditor = ace.edit("csseditor");
	csseditor.getSession().setUseWorker(false);
	csseditor.setTheme("ace/theme/chrome");
	csseditor.getSession().setMode("ace/mode/css");
	csseditor.getSession().on('change', function() { codehasChanged=true;} );
	csseditor.on('focus', function() {  $("#csseditor_div_hint").fadeOut(250);   } );
	csseditor.on('blur', function() {  $("#csseditor_div_hint").fadeIn(250); } );

	var jseditor = ace.edit("jseditor");
	jseditor.getSession().setUseWorker(false);
	jseditor.setTheme("ace/theme/chrome");
	jseditor.getSession().setMode("ace/mode/javascript");
	jseditor.getSession().on('change', function() { codehasChanged=true;} );
	jseditor.on('focus', function() {  $("#jseditor_div_hint").fadeOut(250);   } );
	jseditor.on('blur', function() {  $("#jseditor_div_hint").fadeIn(250); } );


	var globalcsseditor = ace.edit("globalcsseditor");
	globalcsseditor.getSession().setUseWorker(false);
	globalcsseditor.setTheme("ace/theme/chrome");
	globalcsseditor.getSession().setMode("ace/mode/css");
	globalcsseditor.getSession().on('change', function() { GlobalCodehasChanged=true;} );
	globalcsseditor.on('focus', function() {  $("#globalcsseditor_div_hint").fadeOut(250);   } );
	globalcsseditor.on('blur', function() {  $("#globalcsseditor_div_hint").fadeIn(250); } );

	var globalheadeditor = ace.edit("globalheadeditor");
	globalheadeditor.getSession().setUseWorker(false);
	globalheadeditor.setTheme("ace/theme/chrome");
	globalheadeditor.getSession().setMode("ace/mode/html");
	globalheadeditor.getSession().on('change', function() { GlobalCodehasChanged=true;} );
	globalheadeditor.on('focus', function() {  $("#globalheadeditor_div_hint").fadeOut(250);   } );
	globalheadeditor.on('blur', function() {  $("#globalheadeditor_div_hint").fadeIn(250); } );

	$( "#apply_btn" ).bind('click',function() {
		document.getElementById('designspace_frame').contentWindow.updatehtml();
		document.getElementById('designspace_frame').contentWindow.updatecss();
		document.getElementById('designspace_frame').contentWindow.updatejs(true);
		document.getElementById('designspace_frame').contentWindow.SelectionBorder(CurrentActive,true);
		return false;
	});

	KeyboardJS.on('ctrl + enter', function() {
		document.getElementById('designspace_frame').contentWindow.updatehtml();
		document.getElementById('designspace_frame').contentWindow.updatecss();
		document.getElementById('designspace_frame').contentWindow.updatejs(true);
		document.getElementById('designspace_frame').contentWindow.SelectionBorder(CurrentActive,true);
	});

	$( "#showall_btn" ).bind('click',function() { $(".FormElement").children().show();  return false; });


	$( "#globaledit_btn" ).bind('click',function() {
		originalGlobalCSSContent = ace.edit("globalcsseditor").getSession().getValue();
		ace.edit("globalcsseditor").setValue( ace.edit("globalcsseditor").getSession().getValue() ); //fix because the editor is an persistent dialog, without this the update does not remain
		ace.edit("globalcsseditor").selection.clearSelection();
		ace.edit("globalcsseditor").moveCursorTo( ElementGlobalCSSCursor.row ,ElementGlobalCSSCursor.column );
		$("#globaldialog").dialog("open");
		return false;
	});

	$( "#globalhead_btn" ).bind('click',function() {
		originalGlobalHeadContent = ace.edit("globalheadeditor").getSession().getValue();
		console.log("1:"+originalGlobalHeadContent);
		ace.edit("globalheadeditor").setValue( ace.edit("globalheadeditor").getSession().getValue() ); //fix because the editor is an persistent dialog, without this the update does not remain
		ace.edit("globalheadeditor").selection.clearSelection();
		ace.edit("globalheadeditor_div_hint").moveCursorTo( ElementGlobalHeadCursor.row ,ElementGlobalHeadCursor.column );
		$("#globalheaddialog").dialog("open");
		return false;
	});

	$( "#element_popup_btn" ).bind('click',function(e) {
		if (CurrentActive!=null)
		{

			document.getElementById('designspace_frame').contentWindow.$('.FormElement').contextMenu({x: $( CurrentActive ).offset().left+40 , y: ($( CurrentActive ).offset().top+40) });
			e.preventDefault();
		}
		return false;
	});

	$( "#edit_element_btn" ).bind('click',function() {
		if (CurrentActive!=null)
		{
			document.getElementById('designspace_frame').contentWindow.$("#EditElementName").val( $(CurrentActive).attr("id") );
			document.getElementById('designspace_frame').contentWindow.$("#EditElementJSDS").prop('checked', ElementJSDS[$(CurrentActive).attr("id") ] );

			document.getElementById('designspace_frame').contentWindow.$("#editelementdialog").dialog("open");
		}
		return false;
	});

/* elect name="effects" id="effectTypes">
  .show('slide', { direction: 'down' }, 350); //.fadeIn('fast');
   Blind Bounce Clip Drop Explode Fold Highlight Puff Pulsate Scale Shake Size Slide
  */


	$( "#libraries_btn" ).bind('click',function() {
		$("#libraries_div").css("left", ($("#libraries_btn").offset().left-1)+"px");
		$("#libraries_div").css("top", ( $("#libraries_btn").offset().top + $("#libraries_btn").height() ) +"px");


		if ($("#libraries_div").is(":visible")) {
			$( "#libraries_div" ).hide('slide', { direction: 'up' }, 300, function() { $( "#libraries_btn" ).removeClass("topMenuSelected").addClass("aiButton"); } );
		} else
		{

			$( "#libraries_btn" ).removeClass("aiButton").addClass("topMenuSelected");
			$( "#libraries_div" ).show('slide', { direction: 'up' }, 300, function() {} );
		}
		event.stopPropagation();
		return false;
	});


	$("#all_form_elements").on('comboboxselect', function(event,ui) {
		if (ui.item.value != $(CurrentActive).attr("id"))
		{
			if (codehasChanged)	{
				document.getElementById('designspace_frame').contentWindow.updatehtml();
				document.getElementById('designspace_frame').contentWindow.updatecss();
				document.getElementById('designspace_frame').contentWindow.updatejs(false);
				codehasChanged=false;
			} //save last edited element

			console.log("update editors on combo for "+ui.item.value );
			EditorProgramChange = true;
			
			document.getElementById('designspace_frame').contentWindow.SelectionBorder(ui.item.value);
			
			ace.edit("htmleditor").setValue( ElementHTML[ui.item.value] );
			ace.edit("htmleditor").selection.clearSelection();
			ace.edit("htmleditor").moveCursorTo( ElementHTMLCursor[ui.item.value].row ,ElementHTMLCursor[ui.item.value].column );

			ace.edit("csseditor").setValue( ElementCSS[ui.item.value] );
			ace.edit("csseditor").selection.clearSelection();
			ace.edit("csseditor").moveCursorTo( ElementCSSCursor[ui.item.value].row ,ElementCSSCursor[ui.item.value].column );

			ace.edit("jseditor").setValue( ElementJS[ui.item.value] );
			ace.edit("jseditor").selection.clearSelection();
			ace.edit("jseditor").moveCursorTo( ElementJSCursor[ui.item.value].row ,ElementJSCursor[ui.item.value].column );

			EditorProgramChange = false;
		}
	});


   $("iframe").load(function () {
		var iframe = $(this).contents();

		iframe.find('#designspace').droppable(
		{
			tolerance: 'fit',
			iframeFix: false,

			drop : function(event,ui)
			{
				var id = ui.draggable.attr('id');
				var newPosX = ui.offset.left - $("#designspace_frame").offset().left;
				var newPosY = ui.offset.top - $("#designspace_frame").offset().top;

				if (id.substring(0,10) == "codeblock_")
				{
//					$( "#codeblocks_div" ).hide('slide', { direction: 'up' }, 300, function() { $( "#codeblocks_btn" ).removeClass("topMenuSelected").addClass("aiButton"); } );

					//find the id in the codeblocks xml and update the global insert variables accordingly
					var s = id;
					while(s.charAt(0) != '_') { s = s.substr(1); } s = s.substr(1);

					console.log($(CodeBlocksXML).find("item[id="+s+"]").find("CSSCodeStyleNames").text() );

					xGlobalCSSCodeStyleNames = $(CodeBlocksXML).find("item[id="+s+"]").find("CSSCodeStyleNames").text();
					xGlobalCSSCode = $(CodeBlocksXML).find("item[id="+s+"]").find("GlobalCSSCode").text();

					xHTMLCode = $(CodeBlocksXML).find("item[id="+s+"]").find("HTMLCode").text();

					xCSSWidth = $(CodeBlocksXML).find("item[id="+s+"]").attr("CSSWidth");
					xCSSHeight = $(CodeBlocksXML).find("item[id="+s+"]").attr("CSSHeight");

					xCSSCode = $(CodeBlocksXML).find("item[id="+s+"]").find("CSSCode").text();
					xJSCode = $(CodeBlocksXML).find("item[id="+s+"]").find("JSCode").text();


					if (codehasChanged)	{
						document.getElementById('designspace_frame').contentWindow.updatehtml();
						document.getElementById('designspace_frame').contentWindow.updatecss();
						document.getElementById('designspace_frame').contentWindow.updatejs(false);
						codehasChanged=false;
					} //save last edited element

					$(ui.draggable).draggable('option','revert','invalid');
					NewElement(newPosX,newPosY,xCSSWidth,xCSSHeight,"element",xHTMLCode,xCSSCode,xJSCode);
				}
			}
		});
	});



	resizeControls();
});




//------------------------------------------------------------------------------------------------------------------
$(window).resize(function(){
  $.doTimeout( 'resize', 150, function(){
	resizeControls()
  });
});

