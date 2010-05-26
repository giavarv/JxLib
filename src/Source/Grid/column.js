/*
---

name: Jx.Column

description: A representation of a single grid column

license: MIT-style license.

requires:
 - Jx.Widget

provides: [Jx.Column]

...
 */
// $Id$
/**
 * Class: Jx.Column
 *
 * Extends: <Jx.Object>
 *
 * The class used for defining columns for grids.
 *
 * Example:
 * (code)
 * (end)
 *
 * License:
 * Copyright (c) 2009, Jon Bomgardner.
 *
 * This file is licensed under an MIT style license
 */
Jx.Column = new Class({

	Family: 'Jx.Column',
    Extends: Jx.Widget,

    options: {
        /**
         * Option: renderMode
         * The mode to use in rendering this column to determine its width. 
         * Valid options include
         * 
         * fit - auto calculates the width for the best fit to the text. This 
         * 			is the default.
         * fixed - uses the value passed in the width option, doesn't 
         * 			auto calculate.
         * expand - uses the value in the width option as a minimum width and 
         * 			allows this column to expand and take up any leftover space. 
         * 			NOTE: there can be only 1 expand column in a grid. The 
         * 			Jx.Columns object will only take the first column with this 
         * 			option as the expanding column. All remaining columns marked 
         * 			"expand" will be treated as "fixed".
         */
        renderMode: 'fit',
        /**
         * Option: width
         * Determines the width of the column when using 'fixed' rendering mode
         * or acts as a minimum width when using 'expand' mode.
         */
        width: null,
        /**
         * Option: isEditable
         * allows/disallows editing of the column contents
         */
        isEditable: false,
        /**
         * Option: isSortable
         * allows/disallows sorting based on this column
         */
        isSortable: false,
        /**
         * Option: isResizable
         * allows/disallows resizing this column dynamically
         */
        isResizable: false,
        /**
         * Option: isHidden
         * determines if this column can be shown or not
         */
        isHidden: false,
        /**
         * Option: name
         * The name given to this column
         */
        name: '',
        /**
         * Option: template
         */
        template: null,
        /**
         * Option: renderer
         * an instance of a Jx.Grid.Renderer to use in rendering the content
         * of this column or a config object for creating one like so:
         *
         * (code)
         * {
         *     name: 'Text',
         *     options: { ... renderer options ... }
         * }
         */
        renderer: null
    },
    
    classes: $H({
    	domObj: 'jxGridCellContent'
    }),
    /**
     * Property: model
     * holds a reference to the model (an instance of <Jx.Store> or subclass)
     */
    model: null,

    parameters: ['options','grid'],

    /**
     * Constructor: Jx.Column
     * initializes the column object
     */
    init : function () {

        this.name = this.options.name;

        //adjust header for column
        if (!$defined(this.options.template)) {
            this.options.template = '<span class="jxGridCellContent">' + this.name.capitalize() + '</span>';
        }

        this.parent();
        if ($defined(this.options.grid) && this.options.grid instanceof Jx.Grid) {
            this.grid = this.options.grid;
        }

        //check renderer
        if (!$defined(this.options.renderer)) {
            //set a default renderer
            this.options.renderer = new Jx.Grid.Renderer.Text({
                textTemplate: '{' + this.name + '}'
            });
        } else {
            if (!(this.options.renderer instanceof Jx.Grid.Renderer)) {
                var t = Jx.type(this.options.renderer);
                if (t === 'object') {
                    this.options.renderer = new Jx.Grid.Renderer[this.options.renderer.name.capitalize()](
                            this.options.renderer.options);
                }
            }
        }

        this.options.renderer.setColumn(this);

        this.sortImg = new Element('img', {
            src: Jx.aPixel.src
        });

    },
    	
    /**
     * APIMethod: getHeaderHTML
     */
    getHeaderHTML : function () {
    	if (this.isSortable()) {
    		this.sortImg.inject(this.domObj);	
    	}
      return this.domObj;
    },

    setWidth: function(newWidth, asCellWidth) {
        asCellWidth = $defined(asCellWidth) ? asCellWidth : false;

        var delta = this.cellWidth - this.width;
        if (!asCellWidth) {
    	    this.width = parseInt(newWidth,10);
    	    this.cellWidth = this.width + delta;
    	    this.options.width = newWidth;
        } else {
            this.width = parseInt(newWidth,10) - delta;
            this.cellWidth = newWidth;
            this.options.width = this.width;
        }
      if (this.rule && parseInt(this.width,10) >= 0) {
          this.rule.style.width = parseInt(this.width,10) + "px";
      }
      if (this.cellRule && parseInt(this.cellWidth,10) >= 0) {
          this.cellRule.style.width = parseInt(this.cellWidth,10) + "px";
      }
    },
    
    getWidth: function () {
    	return this.width;
    },
    
    getCellWidth: function() {
      return this.cellWidth;
    },
    
    /**
     * APIMethod: calculateWidth
     * returns the width of the column.
     *
     * Parameters:
     * rowHeader - flag to tell us if this calculation is for the row header
     */
    calculateWidth : function (rowHeader) {
        //if this gets called then we assume that we want to calculate the width
    	rowHeader = $defined(rowHeader) ? rowHeader : false;
        var maxWidth;
        var maxCellWidth;
        
        var model = this.grid.getModel();
        model.first();
        if ((this.options.renderMode == 'fixed' || 
             this.options.renderMode == 'expand') && 
            model.valid) {
          var t = new Element('span', {
            'class': 'jxGridCellContent',
            html: 'a',
            styles: {
              width: this.options.width
            }
          });
          var s = this.measure(t,'jxGridCell');
          maxWidth = s.content.width;
          maxCellWidth = s.cell.width;
        } else {
            //calculate the width
            var oldPos = model.getPosition();
            maxWidth = maxCellWidth = 0;
            while (model.valid()) {
                //check size by placing text into a TD and measuring it.
                this.options.renderer.render();
                var text = document.id(this.options.renderer);
                var klass = 'jxGridCell';
                if (this.grid.row.useHeaders()
                        && this.options.name === this.grid.row
                        .getRowHeaderColumn()) {
                    klass = 'jxGridRowHead';
                }
                var s = this.measure(text, klass, rowHeader, model.getPosition());
                if (s.content.width > maxWidth) {
                    maxWidth = s.content.width;
                }
                if (s.cell.width > maxCellWidth) {
                  maxCellWidth = s.cell.width
                }
                if (model.hasNext()) {
                    model.next();
                } else {
                    break;
                }
            }

            //check the column header as well (unless this is the row header)
            if (!(this.grid.row.useHeaders() && 
                this.options.name === this.grid.row.getRowHeaderColumn())) {
                klass = 'jxGridColHead';
                if (this.isEditable()) {
                    klass += ' jxColEditable';
                }
                if (this.isResizable()) {
                    klass += ' jxColResizable';
                }
                if (this.isSortable()) {
                    klass += ' jxColSortable';
                }
                s = this.measure(this.domObj.clone(), klass);
                if (s.content.width > maxWidth) {
                    maxWidth = s.content.width;
                }
                if (s.cell.width > maxCellWidth) {
                  maxCellWidth = s.cell.width
                }
            }
        }
        
        this.width = maxWidth;
        this.cellWidth = maxCellWidth;
        model.moveTo(oldPos);
        return this.width;
    },
    /**
     * Method: measure
     * This method does the dirty work of actually measuring a cell
     *
     * Parameters:
     * text - the text to measure
     * klass - a string indicating and extra classes to add so that
     *          css classes can be taken into account.
     * rowHeader - 
     * row - 
     */
    measure : function (text, klass, rowHeader, row) {
        var d = new Element('span', {
            'class' : klass
        });
        text.inject(d);
        //d.setStyle('height', this.grid.row.getHeight(row));
        d.setStyles({
            'visibility' : 'hidden',
            'width' : 'auto'
        });
        
        d.inject(document.body, 'bottom');
        var s = d.measure(function () {
            //if not rowHeader, get size of innner span
            if (!rowHeader) {
                return {
                  content: this.getFirst().getContentBoxSize(),
                  cell: this.getFirst().getMarginBoxSize()
                }
            } else {
                return {
                  content: this.getMarginBoxSize(),
                  cell: this.getMarginBoxSize()
                }
            }
        });
        d.destroy();
        return s;
    },
    /**
     * APIMethod: isEditable
     * Returns whether this column can be edited
     */
    isEditable : function () {
        return this.options.isEditable;
    },
    /**
     * APIMethod: isSortable
     * Returns whether this column can be sorted
     */
    isSortable : function () {
        return this.options.isSortable;
    },
    /**
     * APIMethod: isResizable
     * Returns whether this column can be resized
     */
    isResizable : function () {
        return this.options.isResizable;
    },
    /**
     * APIMethod: isHidden
     * Returns whether this column is hidden
     */
    isHidden : function () {
        return this.options.isHidden;
    },
    /**
     * APIMethod: isAttached
     * returns whether this column is attached to a store.
     */
    isAttached: function () {
        return this.options.renderer.attached;
    },

    /**
     * APIMethod: getHTML
     * calls render method of the renderer object passed in.
     */
    getHTML : function () {
        this.options.renderer.render();
        return document.id(this.options.renderer);
    }

});