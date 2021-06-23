from psyneulink import *
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
rep_in = TransferMechanism(size=10, name='REP_IN')
rel_in = TransferMechanism(size=11, name='REL_IN')
rep_hidden = TransferMechanism(size=4, function=Logistic, name='REP_HIDDEN')
rel_hidden = TransferMechanism(size=5, function=Logistic, name='REL_HIDDEN')
rep_out = TransferMechanism(size=10, function=Logistic, name='REP_OUT')
prop_out = TransferMechanism(size=12, function=Logistic, name='PROP_OUT')
qual_out = TransferMechanism(size=13, function=Logistic, name='QUAL_OUT')
act_out = TransferMechanism(size=14, function=Logistic, name='ACT_OUT')

# Construct Composition
comp = Composition(name='Rumelhart Semantic Network')
comp.add_backpropagation_learning_pathway(pathway=[rel_in, rel_hidden])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, rep_out])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, prop_out])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, qual_out])
comp.add_backpropagation_learning_pathway(pathway=[rel_hidden, act_out])
comp.add_backpropagation_learning_pathway(pathway=[rep_in, rep_hidden, rel_hidden])
gv = comp.show_graph(
        # output_fmt='gv',
        show_learning=True,
        show_controller=True)

# PsyNeuLinkView Graphics Info 
pnlv_graphics_spec = {
    "Window Settings": {
        "Width": "",
        "Height": ""
    },
    "Canvas Settings": {
        "Width": 78.61,
        "Height": 48.72,
        "Zoom": 276,
        "xScroll": 68,
        "yScroll": 65
    },
    "Graph Settings": {
        "Scale": 0.31,
        "Components": {
            "Nodes": {
                "mid": {
                    "x": 32,
                    "y": 20.49
                },
                "input": {
                    "x": 18.97,
                    "y": 37.14
                },
                "output": {
                    "x": 34.7,
                    "y": 42.72
                },
                "REP_IN-1": {
                    "x": 85.21,
                    "y": 28.72
                },
                "MappingProjection from REP_IN-1[RESULT] to REP_HIDDEN-1[InputPort-0]": {
                    "x": 75.67,
                    "y": 33.43
                },
                "Learning Mechanism for MappingProjection from REP_IN-1[RESULT] to REP_HIDDEN-1[InputPort-0]": {
                    "x": 84.54,
                    "y": 74.45
                },
                "Target-8": {
                    "x": 55.28,
                    "y": 56.17
                },
                "Comparator-8": {
                    "x": 53.11,
                    "y": 60.73
                },
                "Target-7": {
                    "x": 77.07,
                    "y": 56.17
                },
                "Comparator-7": {
                    "x": 74.63,
                    "y": 60.73
                },
                "Target-6": {
                    "x": 11.57,
                    "y": 56.17
                },
                "Comparator-6": {
                    "x": 10.6,
                    "y": 60.73
                },
                "Target-5": {
                    "x": 34.43,
                    "y": 56.17
                },
                "Comparator-5": {
                    "x": 32.93,
                    "y": 60.73
                },
                "REL_IN-1": {
                    "x": 85.51,
                    "y": 65.22
                },
                "MappingProjection from REL_IN-1[RESULT] to REL_HIDDEN-1[InputPort-0]": {
                    "x": 66.15,
                    "y": 74.45
                },
                "Learning Mechanism for MappingProjection from REL_IN-1[RESULT] to REL_HIDDEN-1[InputPort-0]": {
                    "x": 64.6,
                    "y": 69.78
                },
                "REL_HIDDEN-1": {
                    "x": 40.64,
                    "y": 47
                },
                "Learning Mechanism for MappingProjection from REP_HIDDEN-1[RESULT] to REL_HIDDEN-1[InputPort-0]": {
                    "x": 14.98,
                    "y": 69.78
                },
                "MappingProjection from REL_HIDDEN-1[RESULT] to REP_OUT-1[InputPort-0]": {
                    "x": 25.57,
                    "y": 51.53
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN-1[RESULT] to REP_OUT-1[InputPort-0]": {
                    "x": 25.18,
                    "y": 65.25
                },
                "MappingProjection from REL_HIDDEN-1[RESULT] to PROP_OUT-1[InputPort-0]": {
                    "x": 1.58,
                    "y": 51.53
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN-1[RESULT] to PROP_OUT-1[InputPort-0]": {
                    "x": 5.1,
                    "y": 65.25
                },
                "MappingProjection from REL_HIDDEN-1[RESULT] to QUAL_OUT-1[InputPort-0]": {
                    "x": 69.57,
                    "y": 51.53
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN-1[RESULT] to QUAL_OUT-1[InputPort-0]": {
                    "x": 66.2,
                    "y": 65.25
                },
                "MappingProjection from REL_HIDDEN-1[RESULT] to ACT_OUT-1[InputPort-0]": {
                    "x": 48.03,
                    "y": 51.53
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN-1[RESULT] to ACT_OUT-1[InputPort-0]": {
                    "x": 44.99,
                    "y": 65.25
                },
                "MappingProjection from REP_HIDDEN-1[RESULT] to REL_HIDDEN-1[InputPort-0]": {
                    "x": 36.57,
                    "y": 42.48
                },
                "REP_HIDDEN-1": {
                    "x": 59.98,
                    "y": 37.95
                },
                "REP_OUT-1": {
                    "x": 31.23,
                    "y": 56.17
                },
                "PROP_OUT-1": {
                    "x": 8.12,
                    "y": 56.17
                },
                "QUAL_OUT-1": {
                    "x": 73.59,
                    "y": 56.17
                },
                "ACT_OUT-1": {
                    "x": 52.05,
                    "y": 56.17
                },
                "REP_IN-2": {
                    "x": 85.19,
                    "y": 19.5
                },
                "MappingProjection from REP_IN-2[RESULT] to REP_HIDDEN-2[InputPort-0]": {
                    "x": 75.81,
                    "y": 25.41
                },
                "Learning Mechanism for MappingProjection from REP_IN-2[RESULT] to REP_HIDDEN-2[InputPort-0]": {
                    "x": 84.74,
                    "y": 77.95
                },
                "Target-13": {
                    "x": 55.55,
                    "y": 54.53
                },
                "Comparator-13": {
                    "x": 53.52,
                    "y": 60.44
                },
                "Target-12": {
                    "x": 77.19,
                    "y": 54.53
                },
                "Comparator-12": {
                    "x": 74.83,
                    "y": 60.44
                },
                "Target-11": {
                    "x": 12.28,
                    "y": 54.53
                },
                "Comparator-11": {
                    "x": 11.51,
                    "y": 60.44
                },
                "Target-10": {
                    "x": 35.23,
                    "y": 54.53
                },
                "Comparator-10": {
                    "x": 33.72,
                    "y": 60.44
                },
                "REL_IN-2": {
                    "x": 85.57,
                    "y": 66.21
                },
                "MappingProjection from REL_IN-2[RESULT] to REL_HIDDEN-2[InputPort-0]": {
                    "x": 66.26,
                    "y": 77.95
                },
                "Learning Mechanism for MappingProjection from REL_IN-2[RESULT] to REL_HIDDEN-2[InputPort-0]": {
                    "x": 64.78,
                    "y": 72.11
                },
                "REL_HIDDEN-2": {
                    "x": 41.06,
                    "y": 42.92
                },
                "Learning Mechanism for MappingProjection from REP_HIDDEN-2[RESULT] to REL_HIDDEN-2[InputPort-0]": {
                    "x": 16,
                    "y": 72.11
                },
                "MappingProjection from REL_HIDDEN-2[RESULT] to REP_OUT-2[InputPort-0]": {
                    "x": 26.19,
                    "y": 48.76
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN-2[RESULT] to REP_OUT-2[InputPort-0]": {
                    "x": 26.13,
                    "y": 66.28
                },
                "MappingProjection from REL_HIDDEN-2[RESULT] to PROP_OUT-2[InputPort-0]": {
                    "x": 2.47,
                    "y": 48.76
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN-2[RESULT] to PROP_OUT-2[InputPort-0]": {
                    "x": 6.25,
                    "y": 66.28
                },
                "MappingProjection from REL_HIDDEN-2[RESULT] to QUAL_OUT-2[InputPort-0]": {
                    "x": 69.87,
                    "y": 48.76
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN-2[RESULT] to QUAL_OUT-2[InputPort-0]": {
                    "x": 66.61,
                    "y": 66.28
                },
                "MappingProjection from REL_HIDDEN-2[RESULT] to ACT_OUT-2[InputPort-0]": {
                    "x": 48.51,
                    "y": 48.76
                },
                "Learning Mechanism for MappingProjection from REL_HIDDEN-2[RESULT] to ACT_OUT-2[InputPort-0]": {
                    "x": 45.85,
                    "y": 66.28
                },
                "MappingProjection from REP_HIDDEN-2[RESULT] to REL_HIDDEN-2[InputPort-0]": {
                    "x": 37.11,
                    "y": 37.08
                },
                "REP_HIDDEN-2": {
                    "x": 60.2,
                    "y": 31.24
                },
                "REP_OUT-2": {
                    "x": 32.11,
                    "y": 54.53
                },
                "PROP_OUT-2": {
                    "x": 8.91,
                    "y": 54.53
                },
                "QUAL_OUT-2": {
                    "x": 73.79,
                    "y": 54.53
                },
                "ACT_OUT-2": {
                    "x": 52.43,
                    "y": 54.53
                }
            }
        }
    }
}
