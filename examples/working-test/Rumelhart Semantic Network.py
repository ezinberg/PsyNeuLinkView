import psyneulink as pnl
import numpy as np
import typecheck as tc

# This script implements the following network, first described in Rumelhart and Todd
# (Rumelhart, D. E., & Todd, P. M. (1993). Learning and connectionist representations. Attention and performance XIV:
#  Synergies in experimental psychology, artificial intelligence, and cognitive neuroscience, 3-30).

# Semantic Network:

#  Represention  Property  Quality  Action
#           \________\_______/_______/
#                        |
#                 Relations_Hidden
#                   _____|_____
#                  /           \
#   Representation_Hidden  Relations_Input
#               /
#   Representation_Input

# Construct Mechanisms
rep_in = pnl.TransferMechanism(size=10, name='REP_IN')
rel_in = pnl.TransferMechanism(size=11, name='REL_IN')
rep_hidden = pnl.TransferMechanism(size=4, function=pnl.Logistic, name='REP_HIDDEN')
rel_hidden = pnl.TransferMechanism(size=5, function=pnl.Logistic, name='REL_HIDDEN')
rep_out = pnl.TransferMechanism(size=10, function=pnl.Logistic, name='REP_OUT')
prop_out = pnl.TransferMechanism(size=12, function=pnl.Logistic, name='PROP_OUT')
qual_out = pnl.TransferMechanism(size=13, function=pnl.Logistic, name='QUAL_OUT')
act_out = pnl.TransferMechanism(size=14, function=pnl.Logistic, name='ACT_OUT')

# Construct Composition
comp = pnl.Composition(name='Rumelhart Semantic Network')
comp.add_backpropagation_learning_pathway(pathway=[rel_in, rel_hidden])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, rep_out])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, prop_out])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, qual_out])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, act_out])
comp.add_backpropagation_learning_pathway(pathway=[rep_in, rep_hidden, rel_hidden])
# gv = comp.show_graph(
#         # output_fmt='gv',
#         show_learning=True,
#         show_controller=True)

# ['REL_IN', 'Target', 'Target-1', 'Target-2', 'Target-3', 'REP_IN']
ins = {'REL_IN': 1, 'Target': 2, 'Target-1': 3, 'Target-2': 4, 'Target-3': 5, 'REP_IN': 6}

print(comp.run(inputs=ins))


# PsyNeuLinkView Graphics Info 
pnlv_graphics_spec = {
    "Window Settings": {
        "Width": "",
        "Height": ""
    },
    "Canvas Settings": {
        "Width": 78.75,
        "Height": 48.72,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 0
    },
    "Graph Settings": {
        "Scale": 0.33,
        "Components": {
            "Nodes": {
                "MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 29.74,
                    "y": 29.08
                },
                "REP_IN": {
                    "x": 86.1,
                    "y": 17.65
                },
                "MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                    "x": 76.53,
                    "y": 23.84
                },
                "Learning Mechanism for MappingProjection from REP_IN[RESULT] to REP_HIDDEN[InputPort-0]": {
                    "x": 85.48,
                    "y": 79.82
                },
                "Target-3": {
                    "x": 55.52,
                    "y": 54.97
                },
                "Comparator-3": {
                    "x": 53.59,
                    "y": 61.16
                },
                "Target-2": {
                    "x": 77.5,
                    "y": 54.97
                },
                "Comparator-2": {
                    "x": 75.31,
                    "y": 61.16
                },
                "Target-1": {
                    "x": 11.47,
                    "y": 54.97
                },
                "Comparator-1": {
                    "x": 10.5,
                    "y": 61.16
                },
                "Target": {
                    "x": 34.53,
                    "y": 54.97
                },
                "Comparator": {
                    "x": 33.27,
                    "y": 61.16
                },
                "REL_IN": {
                    "x": 86.45,
                    "y": 67.41
                },
                "MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 66.71,
                    "y": 79.82
                },
                "Learning Mechanism for MappingProjection from REL_IN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 65.16,
                    "y": 73.6
                },
                "REL_HIDDEN": {
                    "x": 40.94,
                    "y": 42.5
                },
                "Learning Mechanism for MappingProjection from REP_HIDDEN[RESULT] to REL_HIDDEN[InputPort-0]": {
                    "x": 15.16,
                    "y": 73.6
                },
                "MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                    "x": 25.75,
                    "y": 48.72
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to REP_OUT[InputPort-0]": {
                    "x": 25.57,
                    "y": 67.38
                },
                "MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                    "x": 1.55,
                    "y": 48.72
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to PROP_OUT[InputPort-0]": {
                    "x": 5.11,
                    "y": 67.38
                },
                "MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                    "x": 70.18,
                    "y": 48.72
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to QUAL_OUT[InputPort-0]": {
                    "x": 66.91,
                    "y": 67.38
                },
                "MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                    "x": 48.46,
                    "y": 48.72
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN[RESULT] to ACT_OUT[InputPort-0]": {
                    "x": 45.83,
                    "y": 67.38
                },
                "REP_HIDDEN": {
                    "x": 60.56,
                    "y": 30.06
                },
                "REP_OUT": {
                    "x": 21.14,
                    "y": 10.53
                },
                "PROP_OUT": {
                    "x": 6.97,
                    "y": 7.38
                },
                "QUAL_OUT": {
                    "x": 71.03,
                    "y": 6.77
                },
                "ACT_OUT": {
                    "x": 51.94,
                    "y": 16.55
                }
            }
        }
    }
}
