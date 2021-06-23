import psyneulink as pnl

composition = pnl.Composition(name="composition")

fnPop1 = pnl.IntegratorMechanism(
    name="fnPop1",
    function=pnl.FitzHughNagumoIntegrator(
        a_v=0.7,
        a_w=0.7,
        b_v=0.8,
        b_w=0.8,
        initial_v=-1.2,
        initial_w=-0.6,
        time_step_size=0.001,
    ),
)
fnPop2 = pnl.IntegratorMechanism(
    name="fnPop2",
    function=pnl.FitzHughNagumoIntegrator(
        a_v=0.7,
        a_w=0.7,
        b_v=0.8,
        b_w=0.8,
        initial_v=-1.2,
        initial_w=-0.6,
        time_step_size=0.001,
    ),
)
syn1 = pnl.TransferMechanism(name="syn1", function=pnl.Exponential)

composition.add_node(fnPop1)
composition.add_node(fnPop2)
composition.add_node(syn1)

composition.add_projection(
    projection=pnl.MappingProjection(
        name="MappingProjection from syn1[OutputPort-0] to fnPop1[InputPort-0]",
        function=pnl.LinearMatrix(matrix=[[1.0]]),
        matrix=[[1.0]],
    ),
    sender=syn1,
    receiver=fnPop1,
)
composition.add_projection(
    projection=pnl.MappingProjection(
        name="MappingProjection from fnPop1[OutputPort-0] to fnPop2[InputPort-0]",
        function=pnl.LinearMatrix(matrix=[[1.0]]),
        matrix=[[1.0]],
    ),
    sender=fnPop1,
    receiver=fnPop2,
)
# PsyNeuLinkView Graphics Info 
pnlv_graphics_spec = {
    "Window Settings": {
        "Width": "",
        "Height": ""
    },
    "Canvas Settings": {
        "Width": 79.04,
        "Height": 69.01,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 100
    },
    "Graph Settings": {
        "Scale": 3.7,
        "Components": {
            "Nodes": {
                "syn1": {
                    "x": 43.65,
                    "y": -2.55
                },
                "fnPop1": {
                    "x": 43.33,
                    "y": 39.89
                },
                "fnPop2": {
                    "x": 42.41,
                    "y": 78.18
                }
            }
        }
    }
}
