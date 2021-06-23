const Attribute = require('attribute').Attribute;
const Category = require('category').Category;

class StyleSheet {
    constructor(json){
        this.stylesheet = this.generate_template();
    }

    generate_template(){
        var graph_settings = Category('Graph Settings'),
            graph_scale = Attribute('Scale', 100, graph_settings, true, 1),
            graph_zoom = Attribute('Zoom', 100, graph_settings, true, 2),
            graph_xscroll = Attribute('x Scroll', 50, graph_settings, true, 3),
            graph_yscroll = Attribute('y Scroll', 50, graph_settings, true, 4),
            graph_components = Category('Components', graph_settings, false, 5),
            graph_nodes = Category('Nodes', graph_components, false, 1),
            map = {
                'Graph Settings':graph_settings,
                'Graph Scale':graph_scale
            }
        ;
        return graph_settings;
    }

    json_to_StyleSheet(json){
        if ('Graph Settings' in json){
            if ('Scale' in json['Graph Settings']){

            }
        }
    }
}