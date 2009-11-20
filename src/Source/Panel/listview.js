// $Id: $
/**
 * Class: Jx.ListView
 *
 * Extends: <Jx.Widget>
 *
 * Events:
 *
 * License:
 * Copyright (c) 2009, DM Solutions Group.
 *
 * This file is licensed under an MIT style license
 */
Jx.ListView = new Class({
    Family: 'Jx.Widget',
    Extends: Jx.Widget,

    options: {
        template: '<ul class="jxListView jxList"></ul>',
        /**
         * Option: listOptions
         * control the behaviour of the list, see <Jx.List>
         */
        listOptions: {
            hover: true,
            press: true,
            select: true
        }
    },

    classes: new Hash({
        domObj: 'jxListView',
        listObj: 'jxList'
    }),

    /**
     * APIMethod: render
     */
    render: function () {
        this.parent();

        if (this.options.selection) {
            this.selection = this.options.selection;
        } else if (this.options.select) {
            this.selection = new Jx.Selection(this.options);
            this.ownsSelection = true;
        }

        this.list = new Jx.List(this.listObj, this.options.listOptions, this.selection);

    },

    cleanup: function() {
        if (this.ownsSelection) {
            this.selection.destroy();
        }
        this.list.destroy();
    },

    add: function(item, where) {
        this.list.add(item, where);
        return this;
    },

    remove: function(item) {
        this.list.remove(item);
        return this;
    },

    replace: function(item, withItem) {
        this.list.replace(item, withItem);
        return this;
    }
});