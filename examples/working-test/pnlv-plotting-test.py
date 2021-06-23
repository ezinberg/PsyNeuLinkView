import psyneulink as pnl

input = pnl.ProcessingMechanism(name='input')
mid = pnl.ProcessingMechanism(name='mid', function=pnl.Linear(slope=2))
output = pnl.ProcessingMechanism(name='output', function=pnl.Linear(slope=2))

comp = pnl.Composition(
    pathways=[input, mid, output]
)

# comp.run(10, 1, 2, 3, 4, 5, 10, 7)
# comp.run(inputs=[10, 1, 2, 3, 4, 5, 10, 7])
comp.run(inputs=[1], num_trials=3)
# print(comp.run(inputs=[1], num_trials=3))

# PsyNeuLinkView Graphics Info 
# pnlv_graphics_spec = {
#     "Window Settings": {
#         "Width": "",
#         "Height": ""
#     },
#     "Canvas Settings": {
#         "Width": 78.61,
#         "Height": 62.12,
#         "Zoom": 1,
#         "xScroll": 0,
#         "yScroll": 0
#     },
#     "Graph Settings": {
#         "Scale": null,
#         "Components": {
#             "Nodes": {
#                 "output-63": {
#                     "x": null,
#                     "y": null
#                 },
#                 "input-63": {
#                     "x": null,
#                     "y": null
#                 },
#                 "mid-63": {
#                     "x": null,
#                     "y": null
#                 }
#             }
#         }
#     }
# }

# PsyNeuLinkView Graphics Info 
pnlv_graphics_spec = {
    "Window Settings": {
        "Width": "",
        "Height": ""
    },
    "Canvas Settings": {
        "Width": 77.97,
        "Height": 48.72,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 0
    },
    "Graph Settings": {
        "Scale": 2.12,
        "Components": {
            "Nodes": {
                "input-168": {
                    "x": 43.54,
                    "y": 16.5
                },
                "mid-168": {
                    "x": 44.38,
                    "y": 44.18
                },
                "output-168": {
                    "x": 42.98,
                    "y": 70.78
                }
            }
        }
    }
}
