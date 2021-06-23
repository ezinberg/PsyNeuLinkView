import pytest
import ast_parse
import psyneulink


class TestSuite:
    @pytest.mark.parametrize("filepath", [
        # './pnl_scripts/Adaptive Replay Model.py',
        # './pnl_scripts/Botvinick Model Composition.py',
        # './pnl_scripts/ColorMotionTask_SIMPLE.py',
        # './pnl_scripts/EVC-Gratton Composition.py',
        # './pnl_scripts/GreedyAgentModel_LLVM_TEST.py',
        # './pnl_scripts/LC Control Mechanism Composition.py',
        # './pnl_scripts/NeuroML Example.py',
        # './pnl_scripts/Rumelhart Semantic Network.py',
        # './pnl_scripts/StabilityFlexibility.py',
        # './pnl_scripts/bi-percepts.py',
        '/Users/ds70/PycharmProjects/autodiff_demonstration/autodiff_benchmark.py'
    ])
    def test_actual_scripts(self, filepath):
        src_str = open(filepath, 'r').read()
        dg = ast_parse.DependencyGraph(src_str, psyneulink)
        namespace = {}
        dg.execute_ast(namespace)
        psyneulink.clear_registry(psyneulink.MechanismRegistry)
        psyneulink.clear_registry(psyneulink.CompositionRegistry)
        psyneulink.clear_registry(psyneulink.FunctionRegistry)
        fresh_namespace = {}
        exec(dg.src_executed, fresh_namespace)
        for cat in psyneulink.CompositionRegistry:
            for comp_name in psyneulink.CompositionRegistry[cat][1]:
                psyneulink.CompositionRegistry[cat][1][comp_name].show_graph(output_fmt='gv')
