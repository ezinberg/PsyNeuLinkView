import psyneulink as pnl

input = pnl.ProcessingMechanism(name='input')
mid = pnl.ProcessingMechanism(name='mid', function=pnl.Linear(slope=2))
output = pnl.ProcessingMechanism(name='output', function=pnl.Linear(slope=2))

comp = pnl.Composition(
    pathways=[input, mid, output]
)


# comp.run(10, 1, 2, 3, 4, 5, 10, 7)
print(comp.run(inputs=[10, 1, 2, 3, 4, 5, 10, 7]))
# comp.run(inputs=[1], num_trials=3)
# print(comp.run(inputs=[1], num_trials=3))



# PsyNeuLinkView Graphics Info 
pnlv_graphics_spec = {
    "Window Settings": {
        "Width": "",
        "Height": ""
    },
    "Canvas Settings": {
        "Width": 78.49,
        "Height": 48.72,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 0
    },
    "Graph Settings": {
        "Scale": 2.12,
        "Components": {
            "Nodes": {
                "input": {
                    "x": 75.7,
                    "y": 16.08
                },
                "mid": {
                    "x": 29.89,
                    "y": 29.69
                },
                "output": {
                    "x": 49.68,
                    "y": 49.07
                }
            }
        }
    }
}
