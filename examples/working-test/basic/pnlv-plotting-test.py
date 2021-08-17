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

comp.show_graph()

# PsyNeuLinkView Graphics Info 
pnlv_graphics_spec = {
    "Window Settings": {
        "Width": "",
        "Height": ""
    },
    "Canvas Settings": {
        "Width": 78.51,
        "Height": 73.72,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 0
    },
    "Graph Settings": {
        "Scale": 1.95,
        "Components": {
            "Nodes": {
                "input": {
                    "x": 19.58,
                    "y": 28.03
                },
                "output": {
                    "x": 57.83,
                    "y": 71.46
                },
                "mid": {
                    "x": 41.68,
                    "y": 55.68
                }
            }
        }
    }
}
