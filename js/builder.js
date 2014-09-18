var isDragging=false;
var ThisLast = null;

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
function setup_popup_menu()
{
	$.contextMenu({
		selector: '.FormElement',
		callback: function(key, options) {
			var m = "clicked: " + key;
			console.log(m);
		},
		animation:{duration: 150, show: "fadeIn", hide: "fadeOut"},
		zIndex:1000,
		show: function(opt) {
			console.log("show menu");
		},
		items: {

			"edit": {name: "Edit", icon: "edit",
						callback:function(key,options) {

							$("#EditElementName").val( $(parent.CurrentActive).attr("id") );
							$("#EditElementJSDS").prop('checked', parent.ElementJSDS[$(parent.CurrentActive).attr("id") ] );

							$("#editelementdialog").dialog("open");
						}
					},
			"clone": {name: "Clone", icon: "copy",
				callback:function(key,options){
					var OldActive = parent.CurrentActive;

					parent.NewElement(parent.CurrentActive.position().left+20, parent.CurrentActive.position().top+20,parent.xCSSWidth,parent.xCSSHeight,$(OldActive).attr("id")+"_clone",parent.xHTMLCode,parent.xCSSCode,parent.xJSCode);

					setTimeout(function() {
						parent.ElementJSDS[$(parent.CurrentActive).attr("id")] =  parent.ElementJSDS[$(OldActive).attr("id")];

						parent.ElementHTML[$(parent.CurrentActive).attr("id")]       =  parent.ElementHTML[$(OldActive).attr("id")];
						parent.ElementCSS[$(parent.CurrentActive).attr("id")]        =  parent.ElementCSS[$(OldActive).attr("id")].replace($(OldActive).attr("id"),$(parent.CurrentActive).attr("id"));

						parent.ElementCSS[$(parent.CurrentActive).attr("id")] = parent.ElementCSS[$(parent.CurrentActive).attr("id")].replace(/top:[^\s]*px/,"top:"+(parent.CurrentActive.position().top)+"px" );
						parent.ElementCSS[$(parent.CurrentActive).attr("id")] = parent.ElementCSS[$(parent.CurrentActive).attr("id")].replace(/left:[^\s]*px/,"left:"+(parent.CurrentActive.position().left)+"px" );

						parent.ElementJS[$(parent.CurrentActive).attr("id")]         =  parent.ElementJS[$(OldActive).attr("id")];
						parent.ElementHTMLCursor[$(parent.CurrentActive).attr("id")] =  parent.ElementHTMLCursor[$(OldActive).attr("id")];
						parent.ElementCSSCursor[$(parent.CurrentActive).attr("id")]  =  parent.ElementCSSCursor[$(OldActive).attr("id")];
						parent.ElementJSCursor[$(parent.CurrentActive).attr("id")]   =  parent.ElementJSCursor[$(OldActive).attr("id")];


						console.log("update editors on clone for "+$(parent.CurrentActive).attr("id") );
						parent.EditorProgramChange = true;

						parent.ace.edit("htmleditor").setValue( parent.ElementHTML[$(parent.CurrentActive).attr("id")] );
						parent.ace.edit("htmleditor").selection.clearSelection();
						parent.ace.edit("htmleditor").moveCursorTo( parent.ElementHTMLCursor[$(parent.CurrentActive).attr("id")].row ,parent.ElementHTMLCursor[$(parent.CurrentActive).attr("id")].column );

						parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(parent.CurrentActive).attr("id")] );
						parent.ace.edit("csseditor").selection.clearSelection();
						parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(parent.CurrentActive).attr("id")].row ,parent.ElementCSSCursor[$(parent.CurrentActive).attr("id")].column );

						parent.ace.edit("jseditor").setValue( parent.ElementJS[$(parent.CurrentActive).attr("id")] );
						parent.ace.edit("jseditor").selection.clearSelection();
						parent.ace.edit("jseditor").moveCursorTo( parent.ElementJSCursor[$(parent.CurrentActive).attr("id")].row ,parent.ElementJSCursor[$(parent.CurrentActive).attr("id")].column );

						parent.EditorProgramChange = false;

						updatehtml();
						updatecss();
						updatejs(false);

						parent.codehasChanged=false;

					},100);
				}
			},
			"sep2": "---------",
			"delete": {name: "Delete", icon: "delete",
				callback: function(key, options) {
					$("#deletedialog").dialog("open");
				}
			},
			"sep1": "---------",

			"sendback": {name: "Send Back",
				callback: function(key, options) {

					var zSelf = parseInt(parent.CurrentActive.css('z-index'));
					var xItem = parent.CurrentActive;

					// make all items with less z-index +1
					$('#designspace').children(".FormElement").each(function(idx,itm) {
						var z = parseInt($(itm).css('z-index'));
						if(isNaN(z)) z = 0;
						if(z < zSelf) {
							$(itm).css('z-index', z+1);
							parent.ElementCSS[$(itm).attr("id")] = parent.ElementCSS[$(itm).attr("id")].replace(/z-index:[^\s]*;/,"z-index:"+(z+1)+";" );
						}
					});

					// show the current item to 1
					// make the z-indices highest
					parent.ElementCSS[$(parent.CurrentActive).attr("id")] = parent.ElementCSS[$(parent.CurrentActive).attr("id")].replace(/z-index:[^\s]*;/,"z-index:1;" );
					parent.CurrentActive.css('z-index', '');

					console.log("update CSS editor on z-index front "+$(parent.CurrentActive).attr("id"));
					parent.EditorProgramChange = true;

					parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(parent.CurrentActive).attr("id")] );
					parent.ace.edit("csseditor").selection.clearSelection();
					parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(parent.CurrentActive).attr("id")].row ,parent.ElementCSSCursor[$(parent.CurrentActive).attr("id")].column );

					parent.EditorProgramChange = false;
					updatecss();
				}
			},
			"moveforward": {name: "Bring Forward",
				callback: function(key, options) {

					var zSelf = parseInt(parent.CurrentActive.css('z-index'));
					var xItem = parent.CurrentActive;

					// find the z-index of the top-most item
					var maxZindex = 0;
					$('#designspace').children(".FormElement").each(function(idx,itm) {
						//console.log($(itm).attr("id"));
						var z = parseInt($(itm).css('z-index'));
						if(isNaN(z)) z = 0;
						if(z > maxZindex) { xItem = itm; maxZindex = z; }
					});

					// make all items with more z-index -1
					$('#designspace').children(".FormElement").each(function(idx,itm) {
						var z = parseInt($(itm).css('z-index'));
						if(isNaN(z)) z = 0;
						if(z > zSelf) {
							$(itm).css('z-index', z-1);
							parent.ElementCSS[$(itm).attr("id")] = parent.ElementCSS[$(itm).attr("id")].replace(/z-index:[^\s]*;/,"z-index:"+(z-1)+";" );
						}
					});

					// make the z-indices highest
					parent.ElementCSS[$(parent.CurrentActive).attr("id")] = parent.ElementCSS[$(parent.CurrentActive).attr("id")].replace(/z-index:[^\s]*;/,"z-index:"+maxZindex+";" );
					parent.CurrentActive.css('z-index', '');

					console.log("update CSS editor on z-index front "+$(parent.CurrentActive).attr("id"));
					parent.EditorProgramChange = true;

					parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(parent.CurrentActive).attr("id")] );
					parent.ace.edit("csseditor").selection.clearSelection();
					parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(parent.CurrentActive).attr("id")].row ,parent.ElementCSSCursor[$(parent.CurrentActive).attr("id")].column );

					parent.EditorProgramChange = false;
					updatecss();



				}
			}

		}
	});
}


//------------------------------------------------------------------------------------------------------------------
function updatehtml()
{
	if (!parent.EditorProgramChange)
	{
		console.log("update html for: "+$(parent.CurrentActive).attr("id"));
		if (parent.CurrentActive!=null)
		{
			parent.ElementHTML[$(parent.CurrentActive).attr("id") ] = parent.ace.edit("htmleditor").getSession().getValue();
			parent.ElementHTMLCursor[$(parent.CurrentActive).attr("id")] = parent.ace.edit("htmleditor").getSession().selection.getCursor();
			$("#"+$(parent.CurrentActive).attr("id")+"").html(parent.ElementHTML[$(parent.CurrentActive).attr("id") ]);

			//destroy resizable then recreate has to be identical to the original one
			$("#"+$(parent.CurrentActive).attr("id")).resizable("destroy").resizable({
		grid: [ 5,5 ],
		handles: "all",
		animate: false,
		autoHide: true,
		start: function() {
			if ($(this).attr("id") != $(parent.CurrentActive).attr("id"))
			{
				if (parent.codehasChanged)	{ updatehtml(); updatecss(); updatejs(false); parent.codehasChanged=false;	} //save last edited element
				parent.$("#all_form_elements").combobox('value', $(this).attr("id") );

				console.log("update editors on resize start for "+$(this).attr("id"));
				parent.EditorProgramChange = true;

				parent.ace.edit("htmleditor").setValue( parent.ElementHTML[$(this).attr("id")] );
				parent.ace.edit("htmleditor").selection.clearSelection();
				parent.ace.edit("htmleditor").moveCursorTo( parent.ElementHTMLCursor[$(this).attr("id")].row ,parent.ElementHTMLCursor[$(this).attr("id")].column );

				parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(this).attr("id")] );
				parent.ace.edit("csseditor").selection.clearSelection();
				parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(this).attr("id")].row ,parent.ElementCSSCursor[$(this).attr("id")].column );

				parent.ace.edit("jseditor").setValue( parent.ElementJS[$(this).attr("id")] );
				parent.ace.edit("jseditor").selection.clearSelection();
				parent.ace.edit("jseditor").moveCursorTo( parent.ElementJSCursor[$(this).attr("id")].row ,parent.ElementJSCursor[$(this).attr("id")].column );

				parent.EditorProgramChange = false;
			}
			$(".FormElement").removeClass("FadeOutClass");
		},
		stop: function() {
			SelectionBorder($(this));

			parent.ElementCSS[$(this).attr("id")] = parent.ElementCSS[$(this).attr("id")].replace(/width:[^\s]*px/,"width:"+$(this).width()+"px" );
			parent.ElementCSS[$(this).attr("id")] = parent.ElementCSS[$(this).attr("id")].replace(/height:[^\s]*px/,"height:"+$(this).height()+"px" );

			$(this).css('width', '');
			$(this).css('height', '');

			console.log("update CSS editor on resize stop for "+$(this).attr("id"));
			parent.EditorProgramChange = true;

			parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(this).attr("id")] );
			parent.ace.edit("csseditor").selection.clearSelection();
			parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(this).attr("id")].row ,parent.ElementCSSCursor[$(this).attr("id")].column );

			parent.EditorProgramChange = false;
			updatecss();

			SelectionBorder($(this));
		}
	});
		}
	}
}




//------------------------------------------------------------------------------------------------------------------
function updatecss()
{
	if (!parent.EditorProgramChange)
	{
		console.log("update css for: "+$(parent.CurrentActive).attr("id"));
		if (parent.CurrentActive!=null)
		{
			parent.ElementCSS[$(parent.CurrentActive).attr("id") ] = parent.ace.edit("csseditor").getSession().getValue();
			parent.ElementCSSCursor[$(parent.CurrentActive).attr("id")] = parent.ace.edit("csseditor").getSession().selection.getCursor();

			//remove style from head
			$("#"+$(parent.CurrentActive).attr("id")+"_dynamic_class").remove();
			//add element style to head
			var style = $("<style />", {
						id  : $(parent.CurrentActive).attr("id")+"_dynamic_class",
						type: 'text/css',
						html: parent.ElementCSS[$(parent.CurrentActive).attr("id") ]
			}).appendTo("head");
			SelectionBorder(parent.CurrentActive);
		}
	}
}

//------------------------------------------------------------------------------------------------------------------
function updatejs(PlayJS)
{
	if (!parent.EditorProgramChange)
	{
		console.log("update js for: "+$(parent.CurrentActive).attr("id"));
		if (parent.CurrentActive!=null)
		{
			parent.ElementJS[$(parent.CurrentActive).attr("id") ] = parent.ace.edit("jseditor").getSession().getValue();
			parent.ElementJSCursor[$(parent.CurrentActive).attr("id")] = parent.ace.edit("jseditor").getSession().selection.getCursor();

			if ( (PlayJS) && (parent.ElementJSDS[$(parent.CurrentActive).attr("id") ]) )
			{
				//var xTemStr = replaceAll( parent.ElementJS[$(parent.CurrentActive).attr("id") ] ,"$.","$(\"#"+ $(parent.CurrentActive).attr("id")+"_content\").");
				var xTemStr = replaceAll( parent.ElementJS[$(parent.CurrentActive).attr("id") ] ,"$.","$(\"#"+ $(parent.CurrentActive).attr("id")+"\").");
				console.log(xTemStr);
				eval( xTemStr );
			}
		}
	}
}


//------------------------------------------------------------------------------------------------------------------
function AddElement(ElementID)
{
	//add element CSS to header
	var style = $("<style />", {
                id  : ElementID+"_dynamic_class",
                type: 'text/css',
                html: parent.ElementCSS[ElementID]
	}).appendTo("head");

	//insert element html to designspace
	$("#designspace").append("<div id=\""+ElementID+"\" Class=\"FormElement\">"+ parent.ElementHTML[ElementID] +"</div>");
}


//------------------------------------------------------------------------------------------------------------------
function ElementEditorReady(ElementID)
{
	SelectionBorder($("#"+ElementID));

	//load default code to editors
	console.log("update editors for firs time on "+ElementID);
	parent.EditorProgramChange = true;
	parent.ace.edit("htmleditor").setValue( parent.ElementHTML[ElementID] );
	parent.ace.edit("csseditor").setValue( parent.ElementCSS[ElementID] );
	parent.ace.edit("jseditor").setValue( parent.ElementJS[ElementID] );
	parent.EditorProgramChange = false;

	$("#"+ElementID).click( function() {
		if ($(this).attr("id") != $(parent.CurrentActive).attr("id"))
		{
			if (parent.codehasChanged)	{ updatehtml(); updatecss(); updatejs(false); parent.codehasChanged=false;	} //save last edited element
			parent.$("#all_form_elements").combobox('value', $(this).attr("id") );

			console.log("update editors on click for "+$(this).attr("id"));
			parent.EditorProgramChange = true;
			parent.ace.edit("htmleditor").setValue( parent.ElementHTML[$(this).attr("id")] );
			parent.ace.edit("htmleditor").selection.clearSelection();
			parent.ace.edit("htmleditor").moveCursorTo( parent.ElementHTMLCursor[$(this).attr("id")].row ,parent.ElementHTMLCursor[$(this).attr("id")].column );

			parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(this).attr("id")] );
			parent.ace.edit("csseditor").selection.clearSelection();
			parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(this).attr("id")].row ,parent.ElementCSSCursor[$(this).attr("id")].column );

			parent.ace.edit("jseditor").setValue( parent.ElementJS[$(this).attr("id")] );
			parent.ace.edit("jseditor").selection.clearSelection();
			parent.ace.edit("jseditor").moveCursorTo( parent.ElementJSCursor[$(this).attr("id")].row ,parent.ElementJSCursor[$(this).attr("id")].column );

			parent.EditorProgramChange = false;
		}

		if (!isDragging)
		{
			SelectionBorder($(this));
		}

		return false;
	});

	$("#"+ElementID).bind("contextmenu", function(e) {
		if (!isDragging)
		{
			if (parent.codehasChanged)	{ updatehtml(); updatecss(); updatejs(false); parent.codehasChanged=false;	} //save last edited element
			SelectionBorder($(this));

			console.log("update editors on right click for "+$(this).attr("id"));
			parent.EditorProgramChange = true;

			parent.ace.edit("htmleditor").setValue( parent.ElementHTML[$(this).attr("id")] );
			parent.ace.edit("htmleditor").selection.clearSelection();
			parent.ace.edit("htmleditor").moveCursorTo( parent.ElementHTMLCursor[$(this).attr("id")].row ,parent.ElementHTMLCursor[$(this).attr("id")].column );

			parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(this).attr("id")] );
			parent.ace.edit("csseditor").selection.clearSelection();
			parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(this).attr("id")].row ,parent.ElementCSSCursor[$(this).attr("id")].column );

			parent.ace.edit("jseditor").setValue( parent.ElementJS[$(this).attr("id")] );
			parent.ace.edit("jseditor").selection.clearSelection();
			parent.ace.edit("jseditor").moveCursorTo( parent.ElementJSCursor[$(this).attr("id")].row ,parent.ElementJSCursor[$(this).attr("id")].column );

			parent.EditorProgramChange = false;

		}
	});

	$("#"+ElementID).bind( "dragstart", function(event, ui) {

		if ($(this).attr("id") != $(parent.CurrentActive).attr("id"))
		{
			if (parent.codehasChanged)	{ updatehtml(); updatecss(); updatejs(false); parent.codehasChanged=false;	} //save last edited element

			parent.$("#all_form_elements").combobox('value', $(this).attr("id") );

			console.log("update editors on drag start for "+$(this).attr("id"));
			parent.EditorProgramChange = true;

			parent.ace.edit("htmleditor").setValue( parent.ElementHTML[$(this).attr("id")] );
			parent.ace.edit("htmleditor").selection.clearSelection();
			parent.ace.edit("htmleditor").moveCursorTo( parent.ElementHTMLCursor[$(this).attr("id")].row ,parent.ElementHTMLCursor[$(this).attr("id")].column );

			parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(this).attr("id")] );
			parent.ace.edit("csseditor").selection.clearSelection();
			parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(this).attr("id")].row ,parent.ElementCSSCursor[$(this).attr("id")].column );

			parent.ace.edit("jseditor").setValue( parent.ElementJS[$(this).attr("id")] );
			parent.ace.edit("jseditor").selection.clearSelection();
			parent.ace.edit("jseditor").moveCursorTo( parent.ElementJSCursor[$(this).attr("id")].row ,parent.ElementJSCursor[$(this).attr("id")].column );

			parent.EditorProgramChange = false;
		}

		$(".FormElement").removeClass("FadeOutClass");
		ui.originalPosition.top = $("#designscroller").scrollTop()+$(this).position().top;
		ui.originalPosition.left = $("#designscroller").scrollLeft()+$(this).position().left;
	});

	$("#"+ElementID).resizable({
		grid: [ 5,5 ],
		handles: "all",
		animate: false,
		autoHide: true,
		start: function() {
			if ($(this).attr("id") != $(parent.CurrentActive).attr("id"))
			{
				if (parent.codehasChanged)	{ updatehtml(); updatecss(); updatejs(false); parent.codehasChanged=false;	} //save last edited element
				parent.$("#all_form_elements").combobox('value', $(this).attr("id") );

				console.log("update editors on resize start for "+$(this).attr("id"));
				parent.EditorProgramChange = true;

				parent.ace.edit("htmleditor").setValue( parent.ElementHTML[$(this).attr("id")] );
				parent.ace.edit("htmleditor").selection.clearSelection();
				parent.ace.edit("htmleditor").moveCursorTo( parent.ElementHTMLCursor[$(this).attr("id")].row ,parent.ElementHTMLCursor[$(this).attr("id")].column );

				parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(this).attr("id")] );
				parent.ace.edit("csseditor").selection.clearSelection();
				parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(this).attr("id")].row ,parent.ElementCSSCursor[$(this).attr("id")].column );

				parent.ace.edit("jseditor").setValue( parent.ElementJS[$(this).attr("id")] );
				parent.ace.edit("jseditor").selection.clearSelection();
				parent.ace.edit("jseditor").moveCursorTo( parent.ElementJSCursor[$(this).attr("id")].row ,parent.ElementJSCursor[$(this).attr("id")].column );

				parent.EditorProgramChange = false;
			}
			$(".FormElement").removeClass("FadeOutClass");
		},
		stop: function() {
			SelectionBorder($(this));

			parent.ElementCSS[$(this).attr("id")] = parent.ElementCSS[$(this).attr("id")].replace(/width:[^\s]*px/,"width:"+$(this).width()+"px" );
			parent.ElementCSS[$(this).attr("id")] = parent.ElementCSS[$(this).attr("id")].replace(/height:[^\s]*px/,"height:"+$(this).height()+"px" );

			$(this).css('width', '');
			$(this).css('height', '');

			console.log("update CSS editor on resize stop for "+$(this).attr("id"));
			parent.EditorProgramChange = true;

			parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(this).attr("id")] );
			parent.ace.edit("csseditor").selection.clearSelection();
			parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(this).attr("id")].row ,parent.ElementCSSCursor[$(this).attr("id")].column );

			parent.EditorProgramChange = false;
			updatecss();

			SelectionBorder($(this));
		}
	});


	$("#"+ElementID).draggable({
		grid: [ 5,5 ],
		containment: "#designspace",
		cursor: "move",
		revert: 'invalid',
		start: function() {
			isDragging=true;
			$(this).addClass("DragItemClass");
		},
		stop: function(){
			isDragging=false;
			console.log("stop");

			$(this).draggable('option','revert','invalid');
			$(this).removeClass("DragItemClass");
			SelectionBorder($(this));

			parent.ElementCSS[$(this).attr("id")] = parent.ElementCSS[$(this).attr("id")].replace(/top:[^\s]*px/,"top:"+$(this).position().top+"px" );
			parent.ElementCSS[$(this).attr("id")] = parent.ElementCSS[$(this).attr("id")].replace(/left:[^\s]*px/,"left:"+$(this).position().left+"px" );

			$(this).css('top', '');
			$(this).css('left', '');

			console.log("update CSS editor on drag stop for "+$(this).attr("id"));
			parent.EditorProgramChange = true;

			parent.ace.edit("csseditor").setValue( parent.ElementCSS[$(this).attr("id")] );
			parent.ace.edit("csseditor").selection.clearSelection();
			parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[$(this).attr("id")].row ,parent.ElementCSSCursor[$(this).attr("id")].column );

			parent.EditorProgramChange = false;
			updatecss();
		},
		drag: function() {}
	});

}


//------------------------------------------------------------------------------------------------------------------
function SelectionBorder(element)
{
	if( Object.prototype.toString.call(element) == '[object String]' ) {
	   element = $("#"+element);
	}
	parent.CurrentActive = element;
	$(".FormElement").addClass("FadeOutClass");
	parent.CurrentActive.removeClass("FadeOutClass");
}


//------------------------------------------------------------------------------------------------------------------
$(document).ready(function() {

	$('html').click(function() {
		//add all close calls here
		//need to add  event.stopPropagation(); into the show part

		parent.$( "#libraries_div" ).hide('slide', { direction: 'up' }, 300, function() { parent.$( "#libraries_btn" ).removeClass("topMenuSelected").addClass("aiButton"); } );
//		parent.$( "#codeblocks_div" ).hide('slide', { direction: 'up' }, 300, function() { parent.$( "#codeblocks_btn" ).removeClass("topMenuSelected").addClass("aiButton"); } );

	});

	$("#designspace").droppable({
		tolerance: 'fit',
		drop : function(event,ui)		{		}
	});


	$("#designspace").click( function() {
		if (parent.codehasChanged)	{ updatehtml(); updatecss(); updatejs(false); parent.codehasChanged=false;	} //save last edited element
		$(".FormElement").removeClass("FadeOutClass");
		parent.ace.edit("htmleditor").setValue( "" );
		parent.ace.edit("csseditor").setValue( "" );
		parent.ace.edit("jseditor").setValue( "" );
		parent.CurrentActive = null;
		parent.$("#all_form_elements").combobox('value', "");
		parent.codehasChanged=false;
	});

	$("#designspace").gridBuilder({	color:'#bbb',  	secondaryColor:'#ccc',	vertical:10,  horizontal:10, gutter: 0});

	setup_popup_menu();

	$("#editelementdialog").dialog({ autoOpen: false,  modal: true, resizable:false, minWidth:400  });
	$("#editelementdialog").dialog({
		buttons : {
			"Confirm" : function() {

				var newname = $("#EditElementName").val();

				if (!validateDivName(newname))
				{
					$("#renameerrordialog").html("The element name has to only contain letters, numbers, dashe or underline.");
					$("#renameerrordialog").dialog("open");
				} else
				{
					// check if any other element share the name
					var SameNameFound = false;
					var xElementName = "";
					$('#designspace').children(".FormElement").each(function(idx,itm) {
						xElementName = $(itm).attr("id");
						console.log(xElementName+" == "+newname);

						if ( $(itm)[0].outerHTML == $(parent.CurrentActive)[0].outerHTML ) {} else
						{
							console.log( xElementName+"=="+newname );
							if (xElementName==newname) { SameNameFound=true;}

						}
					});

					if (SameNameFound)
					{
						$("#renameerrordialog").html("There is another element with that name already on the board.");
						$("#renameerrordialog").dialog("open");
					}
					else
					{
						$(".FormElement").removeClass("FadeOutClass");

						if($("#EditElementJSDS").is(':checked')){ parent.ElementJSDS[newname] = true; } else { parent.ElementJSDS[newname] = false; }
						oldname = $(parent.CurrentActive).attr("id");
						//$("#"+$(parent.CurrentActive).attr("id")+"_content").attr("id",newname+"_content");
						$(parent.CurrentActive).attr("id",newname);


						if (oldname!=newname) {
							parent.ElementCSS[newname] = parent.ElementCSS[oldname].replace(oldname,newname);
							parent.ElementCSSCursor[newname] = parent.ElementCSSCursor[oldname];

							console.log("update CSS editor on rename "+$(parent.CurrentActive).attr("id"));
							parent.EditorProgramChange = true;

							parent.ace.edit("csseditor").setValue( parent.ElementCSS[newname] );
							parent.ace.edit("csseditor").selection.clearSelection();
							parent.ace.edit("csseditor").moveCursorTo( parent.ElementCSSCursor[newname].row ,parent.ElementCSSCursor[newname].column );

							parent.EditorProgramChange = false;

							var index2 = parent.ElementJSDS.indexOf(oldname);
							parent.ElementJSDS.splice(index2,1);

							parent.$("#all_form_elements option[value='"+oldname+"']").remove();
							parent.$("#all_form_elements").append('<option value="'+newname+'">'+newname+'</option>');
							setTimeout(function() {
								parent.$("#all_form_elements").combobox('value', newname);
							},50);
						}

						updatecss();
						SelectionBorder(parent.CurrentActive);

						$(this).dialog("close");
					}
				}
			},
		"Cancel" : function() {
				$(this).dialog("close");
			}
		}
	});

	$("#renameerrordialog").dialog({ autoOpen: false,  modal: true, resizable:false  });
	$("#renameerrordialog").dialog({
		buttons : {
		"Continue" : function() {
				$(this).dialog("close");
			}
		}
	});

	$("#deletedialog").dialog({ autoOpen: false,  modal: true, resizable:false  });
	$("#deletedialog").dialog({
		buttons : {
			"Confirm" : function() {
				parent.$("#all_form_elements option[value='"+$(parent.CurrentActive).attr("id") +"']").remove();
				parent.$("#all_form_elements").combobox('value', "");

				$(parent.CurrentActive).remove();
				$(".FormElement").removeClass("FadeOutClass");

				parent.ace.edit("htmleditor").setValue( "" );
				parent.ace.edit("csseditor").setValue( "" );
				parent.ace.edit("jseditor").setValue( "" );
				parent.CurrentActive = null;
				$(this).dialog("close");
			},
		"Cancel" : function() {
				$(this).dialog("close");
			}
		}
	});


});