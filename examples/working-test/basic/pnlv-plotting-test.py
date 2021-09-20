import psyneulink as pnl

input = pnl.ProcessingMechanism(name='input')
mid = pnl.ProcessingMechanism(name='mid', function=pnl.Linear(slope=2))
# hid = pnl.ProcessingMechanism(name='hid', function=pnl.Linear(slope=2))
# kid = pnl.ProcessingMechanism(name='kid', function=pnl.Linear(slope=2))
output = pnl.ProcessingMechanism(name='output', function=pnl.Linear(slope=2))

comp = pnl.Composition(
    pathways=[input, mid, output]
)


# comp.run(10, 1, 2, 3, 4, 5, 10, 7)
print(comp.run(inputs=[10, 1, 2, 3, 4, 5, 10, 7]))
# comp.run(inputs=[1], num_trials=3)
# print(comp.run(inputs=[1], num_trials=3))

comp.show_graph(show_node_structure='ALL')

# PsyNeuLinkView Graphics Info 
pnlv_graphics_spec = {
    "Window Settings": {
        "Width": "",
        "Height": ""
    },
    "Canvas Settings": {
        "Width": 78.68,
        "Height": 73.72,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 0
    },
    "Graph Settings": {
        "Scale": 3.21,
        "Components": {
            "Nodes": {
                "mid": {
                    "x": 44.44,
                    "y": 40.78
                },
                "input": {
                    "x": 42.59,
                    "y": -0.8
                },
                "output": {
                    "x": 41.83,
                    "y": 78.96
                }
            }
        }
    }
}
