$.widget('dc.TBox', {
	options: {},

	_create: function () {
		this.instanceID = newid;

		this.element.attr('id',"element_"+newid);
		this.element.addClass('FormElement');
/*
.small {
    width: 60px;
    height: 60px;
    border-radius: 12.5px;
    box-shadow:
        0px 0px 2px 0px rgba(0,0,0,.5) inset,
        0px 5px 10px 0px rgba(255,255,255,1) inset,
        0px 6px 5px -3px rgba(0,0,0,.5),
        0px 25px 40px -20px rgba(0,0,0,1);
}
.small:hover {
    box-shadow:
        0px 0px 2px 0px rgba(0,0,0,.5) inset,
        0px 5px 10px 0px rgba(255,255,255,1) inset,
        0px 6px 5px -3px rgba(0,0,0,.5),
        0px 35px 40px -20px rgba(0,0,0,1);
}
*/

		this.element.css('border', '1px solid black');
		this.element.css('position', 'absolute');
		this.element.css('width', '100px');
		this.element.css('height', '40px');
		this.element.css('background', 'red');

		// find the z-index of the top-most item
		var maxZindex = 0;
		$('#designspace').children(".FormElement").each(function(idx,itm) {
			var z = parseInt($(itm).css('z-index'));
			if(isNaN(z)) z = 0;
			if(z > maxZindex) maxZindex = z;
		});
		//make new z-index+1
		this.element.css('z-index', maxZindex+1);



		this._setOptions({
			'top': this.options.top,
			'left': this.options.left
			/*
			,
			'width': this.options.width,
			'height': this.options.height,
			'color': this.options.color,
			'text': this.options.text
			*/
		});


		var ThisLast = this.element; setTimeout(function() {
										SelectionBorder(ThisLast,true);
									}, 100);

		this.element.click( function() {
			if (!isDragging)
			{
				SelectionBorder($(this),true);
			}
			return false;
		});

		this.element.bind("contextmenu", function(e) {
			if (!isDragging)
			{
				SelectionBorder($(this),true);
			}
		});

		this.element.bind( "dragstart", function(event, ui) {
			SelectionBorder($(this),false);
			ui.originalPosition.top = $("#designscroller").scrollTop()+$(this).position().top;
			ui.originalPosition.left = $("#designscroller").scrollLeft()+$(this).position().left;
		});

		this.element.resizable({
			grid: [ 5,5 ],
			animate: true,
			handles: "all",
			animateEasing: "easeInOutExpo",
			autoHide: true,
			helper: "ui-resizable-helper",
			start: function() { SelectionBorder($(this),false); },
			stop: function() { var ThisLast = $(this); setTimeout(function() { SelectionBorder(ThisLast,true);  }, 1000)  },
			resize: function( event, ui ) {
				/*
				var originalElement = $(this);
				var ScTop = $("#designscroller").scrollTop();
				var ScLeft = $("#designscroller").scrollLeft();

				var x1_1 = ScLeft + ui.position.left;
				var x2_1 = ScLeft + ui.position.left + ui.size.width;
				var y1_1 = ScTop  + ui.position.top;
				var y2_1 = ScTop  + ui.position.top + ui.size.height;
				*/
			}
		});

		this.element.draggable({
			grid: [ 5,5 ],
			containment: "#designspace",
			cursor: "move",
			revert: 'invalid',
			//stack: "#designspace div",
			start: function() {
				isDragging=true;
				$(this).css('opacity', '0.5');
			},
			stop: function(){
				isDragging=false;
				//$(this)._originalPosition = this._originalPosition || ui.originalPosition;
				//ui.helper.animate( $(this)._originalPosition );
				$(this).draggable('option','revert','invalid');
				$(this).css('opacity', '1.0');
				SelectionBorder($(this),true);
			},
			drag: function() {
			}
		});
	},

	_destroy: function () {
		this.element.removeClass('xlabel');
		this.element.empty();
	},

	_setOption: function (key, value) {
		var self = this,
		prev = this.options[key],
		fnMap = {
			'top': function () {
				self.element.css('top', value + 'px');
			},
			'left': function () {
				self.element.css('left', value + 'px');
			},
			'width': function () {
				self.element.css('width', value + 'px');
			},
			'height': function () {
				self.element.css('height', value + 'px');
			},
			'color': function () {
				self.element.css('background-color', value );
			},
			'text': function () {
				self.element.append(value+" "+newid);
			}
		};

		// base
		this._super(key, value);

		if (key in fnMap) {
			fnMap[key]();
			// Fire event
			this._triggerOptionChanged(key, prev, value);
		}
	},

	 _triggerOptionChanged: function (optionKey, previousValue, currentValue) {
		this._trigger('setOption', {type: 'setOption'}, {
			option: optionKey,
			previous: previousValue,
			current: currentValue
		});
	}
});
