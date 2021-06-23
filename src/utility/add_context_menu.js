import React from 'react'
import { ContextMenu, Menu, MenuItem } from '@blueprintjs/core'

export default function add_context_menu(selector, menu_item_objects) {
  const sidebar_element = document.querySelector(selector)
  sidebar_element.oncontextmenu = (e) => {
    // prevent the browser's native context menu
    e.preventDefault()
    var context_menu_item_array = []
    menu_item_objects.forEach(
      function(item){
        context_menu_item_array.push(
          React.createElement(MenuItem,item)
        )
      }
    )
    // render a Menu without JSX...
    const menu = React.createElement(
      Menu,
      {}, // empty props
      context_menu_item_array
    )
    ContextMenu.show(menu, {
      left: e.clientX,
      top: e.clientY
    }, () => {
      // menu was closed; callback optional
    })
  }
};
