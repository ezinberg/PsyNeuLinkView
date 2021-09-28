from queue import Queue
import numpy as np
import grpc
from concurrent import futures
import redbaron
import json
import sys
import os
from xml.etree.cElementTree import fromstring
from collections import defaultdict
import ast_parse
import threading
import warnings
import copy


f = None

my_env = os.environ

sys.path.append(os.getenv('PATH'))

if len(sys.argv) > 1:
    try:
        sys.path.append(sys.argv[1])
    except:
        raise ValueError("error appending arg to path")

import sys
import psyneulink as pnl
from psyneulink.core.rpc import graph_pb2, graph_pb2_grpc


def print_to_file(text):
    with open("/Users/ezrazinberg/Desktop/code/psynl/PsyNeuLinkView/src/py/debug_out.txt", 'a') as f:
        f.write(str(text) + "\n")
        f.flush()


serve_conditions = {
    0:'INITIALIZATION',
    1:'VALIDATION',
    2:'EXECUTION',
    3:'PROCESSING',
    4:'LEARNING',
    5:'CONTROL',
    6:'SIMULATION',
    7:'TRIAL',
    8:'RUN'
}

class Container():
    def __init__(self):
        self.localvars = locals()
        self.pnl_objects = {
            'compositions': {},
            'components': {}
        }
        self.graphics_spec = {

        }
        self.filepath = None
        self.AST = None
        self.shared_queue = Queue()
        self.shared_queue_lock = threading.RLock()

    @property
    def hashable_pnl_objects(self):
        return {
            'compositions': [i for i in self.pnl_objects['compositions']],
            'components': [i for i in self.pnl_objects['components']]
        }

class GraphServer(graph_pb2_grpc.ServeGraphServicer):
    def LoadCustomPnl(self, request, context):
        filepath = request.path
        sys.path.append(filepath)
        return graph_pb2.NullArgument()

    def LoadGraphics(self, request, context):
        filepath = request.path
        load_style(filepath)
        graphics = pnl_container.graphics_spec
        return graph_pb2.StyleJSON(styleJSON=json.dumps(graphics))

    def LoadScript(self, request, context):

        filepath = request.path
        loadScript(filepath)
        return graph_pb2.ScriptCompositions(compositions=pnl_container.hashable_pnl_objects['compositions'])

    def GetCompositions(self, request, context):
        return graph_pb2.ScriptCompositions(compositions=pnl_container.hashable_pnl_objects['compositions'])

    def GetComponents(self, request, context):
        name = request.name
        return graph_pb2.ScriptComponents(
            components=[i.name for i in pnl_container.pnl_objects['compositions'][name].mechanisms]
        )

    def GetLoggableParameters(self, request, context):
        name = request.name
        parameter_list = list(pnl_container.pnl_objects['components'][name].loggable_items.keys())
        return graph_pb2.ParameterList(
            parameters = parameter_list
        )

    def GetJSON(self, request, context):
        graph_name = request.name
        gv = get_gv_json(graph_name)
        graphics = pnl_container.graphics_spec
        return graph_pb2.GraphJSON(objectsJSON=json.dumps(gv),
                                   styleJSON=json.dumps(graphics))

    def UpdateStylesheet(self, request_iterator, context):
        for request in request_iterator:
            update_graphics_dict(json.loads(request.styleJSON))
        return graph_pb2.NullArgument()

    def HealthCheck(self, request, context):
        return graph_pb2.HealthStatus(status='Okay')

    
    # Forks thread that runs run_composition. Thread writes to 
    # pnl_container.shared_queue, which is repeatedly checked below in the while loop.
    def RunComposition(self, request, context):

        thread = threading.Thread(target=run_composition,
                                  args=[
                                      pnl_container.hashable_pnl_objects['compositions'][-1],
                                      request.inputs,
                                      request.servePrefs
                                  ])
        thread.daemon = True
        thread.start()

        while True:
            if not pnl_container.shared_queue.empty():
                e =  pnl_container.shared_queue.get()
                if isinstance(e, graph_pb2.Entry):
                    yield e
            else:
                if not thread.is_alive():
                    break

pnl_container = Container()

def expand_path(filepath):
    if '~' in filepath:
        homedir = os.path.expanduser('~')
        filepath = homedir + filepath[1:]
        # print_to_file("filepath expanded to: " + filepath)
    return filepath

def get_current_composition():
    # gets currently selected composition. currently just takes the last one in the list of instantiated comps.
    # needs to be improved
    return list(pnl_container.pnl_objects['compositions'].values())[-1]

def handle_serve_prefs(composition, servePrefs):
    # turn on RPC communication for all selected parameters
    comp = get_current_composition()

    for servePref in servePrefs.servePrefSet:
        if not servePref.componentName in comp.nodes:
            warnings.warn(f'Component {servePref.componentName} is not in composition {comp.name} with nodes {comp.nodes}. Skipping Component.')
        else:
            node = comp.nodes[servePref.componentName]
            if not servePref.parameterName in node.loggable_items:
                warnings.warn(
                    f'Parameter {servePref.parameterName} is not a loggable item of {node.name}. Skipping Parameter.')
            else:
                node.set_delivery_conditions(servePref.parameterName,
                                             pnl.LogCondition.__dict__[serve_conditions[servePref.condition]])

def run_composition(composition, inputs, servePrefs):
    formatted_inputs = {}
    handle_serve_prefs(composition, servePrefs)
    con = pnl.Context(
        execution_id = None,
        rpc_pipeline = pnl_container.shared_queue
    )
    comp = get_current_composition()
    for key in inputs.keys():
        rows = inputs[key].rows
        cols = inputs[key].cols
        formatted_inputs[comp.nodes[key]] = np.array(inputs[key].data).reshape((rows, cols))
    comp.run(inputs = formatted_inputs, context = con)


def get_new_pnl_objects(namespace):
    compositions = {}
    for cat in pnl.CompositionRegistry:
        for comp_name in pnl.CompositionRegistry[cat][1]:
            compositions.update({comp_name:pnl.CompositionRegistry[cat][1][comp_name]})
    components = {i.name: i for i in namespace.values() if isinstance(i, pnl.Mechanism)}
    pnl_container.pnl_objects['compositions'].update(compositions)
    pnl_container.pnl_objects['components'].update(components)
    return compositions, components

def get_graphics_dict(namespace):
    if 'pnlv_graphics_spec' in namespace:
        pnl_container.graphics_spec = namespace['pnlv_graphics_spec']

def load_style(filepath):

    filepath = expand_path(filepath)

    with open(filepath, 'r') as fi:
        fi.seek(0)
        file = fi.read()

    # file = open(filepath, 'r').read()
    ast = redbaron.RedBaron(file)
    gdict = ast.find('assign',lambda x: x.find('name','pnlv_graphics_spec'))
    namespace = {}
    if gdict:
        exec(gdict.dumps(), namespace)
        pnl_container.graphics_spec = namespace['pnlv_graphics_spec']
    else:
        pnl_container.graphics_spec = {}

def loadScript(filepath):

    filepath = expand_path(filepath)

    pnl_container.filepath = filepath

    try:
        with open(filepath, 'r') as f:

            # reset cursor to start of file for multiple reads
            f.seek(0)

            pnl_container.AST = f.read()

            # if pnl_container.AST.isspace() or (pnl_container.AST == ""):
            #     print_to_file("Source file for AST is empty or has already been read")
            # if pnl_container.AST == None:
            #     print_to_file("pnl_container.AST is None")
    
    except:
        e = sys.exc_info()[0]
        print_to_file("error reading ast from file: " + str(e))
        print_to_file("filepath: " + filepath + '\n')

    dg = ast_parse.DependencyGraph(pnl_container.AST, pnl)
    namespace = {}
    dg.execute_ast(namespace)

    # print_to_file(namespace)

    get_new_pnl_objects(namespace)
    # (composition, components) = get_new_pnl_objects(namespace)
    # print_to_file(str(composition) + "  " + str(components))

    get_graphics_dict(namespace)
    return pnl_container.hashable_pnl_objects['compositions']

def update_graphics_dict(styleSheet):

    # reads the file immediately before updating script
    # so that the AST written back to the script includes any 
    # changes made since the script was read on start
    
    # filepath = pnl_container.filepath
    # try:
    #     with open(filepath, 'r') as f:

    #         # reset cursor to start of file for multiple reads
    #         f.seek(0)

    #         pnl_container.AST = f.read()

    #         if pnl_container.AST.isspace() or (pnl_container.AST == ""):
    #             print_to_file("Source file for AST is empty or has already been read")
    #         if pnl_container.AST == None:
    #             print_to_file("pnl_container.AST is None")
    
    # except:
    #     e = sys.exc_info()[0]
    #     print_to_file("error reading ast from file: " + str(e))
    #     print_to_file("filepath: " + filepath + '\n')



    ast = redbaron.RedBaron(pnl_container.AST)
    gdict = ast.find('assign',lambda x: x.find('name','pnlv_graphics_spec'))
    stylesheet_str = json.dumps(styleSheet, indent=4)
    if gdict:
        gdict.value = stylesheet_str
        ast = ast.dumps()
    else:
        ast = ast.dumps() + f'\n# PsyNeuLinkView Graphics Info \npnlv_graphics_spec = {stylesheet_str}\n'
    
    old_ast = copy.deepcopy(pnl_container.AST)

    # if str(old_ast) == str(ast):
    #     print_to_file("old_ast and ast are SAME")
    # else:
    #     print_to_file("old_ast and ast are DIFFERENT")

    # print_to_file("old ast:\n" + str(old_ast))
    # print_to_file("new ast:\n" + str(ast))

    pnl_container.AST = ast

    with open(pnl_container.filepath, 'w') as script:
        script.write(ast)

def get_gv_json(name):
    def etree_to_dict(t):
        d = {t.tag: {} if t.attrib else None}
        children = list(t)
        if children:
            dd = defaultdict(list)
            for dc in map(etree_to_dict, children):
                for k, v in dc.items():
                    dd[k].append(v)
            d = {t.tag: {k:v[0] if len(v) == 1 else v for k, v in dd.items()}}
        if t.attrib:
            d[t.tag].update(('@' + k, v) for k, v in t.attrib.items())
        if t.text:
            text = t.text.strip()
            if children or t.attrib:
                if text:
                  d[t.tag]['#text'] = text
            else:
                d[t.tag] = text
        return d

    def correct_dict(svg_dict):
        for i in list(svg_dict.keys()):
            if '{http://www.w3.org/2000/svg}' in i:
                svg_dict[i.replace('{http://www.w3.org/2000/svg}', '')] = svg_dict[i]
                if isinstance(svg_dict[i], dict):
                    correct_dict(svg_dict[i])
                elif isinstance(svg_dict[i], list):
                    for j in svg_dict[i]:
                        if isinstance(j, dict):
                            correct_dict(j)
                del svg_dict[i]
            elif '@' == i[0]:
                svg_dict[i[1:]] = svg_dict[i]
                del svg_dict[i]

    def parse_corrected_dict(corrected_dict):
        objects = []
        edges = []
        for i in corrected_dict['svg']['g']['g']:
            if i['class'] == 'node':
                objects.append(i)
            elif i['class'] == 'edge':
                tail_str, head_str = i['title'].split('->')

                print_to_file(tail_str + ", " + head_str)
                print_to_file(json.dumps(objects, indent=4))

                del i['title']
                # i['tail'] = [i for i in range(len(objects)) if objects[i]['title'] == tail_str][0]
                # i['head'] = [i for i in range(len(objects)) if objects[i]['title'] == head_str][0]

                i['tail'] = [i for i in range(len(objects)) if objects[i]['title'] in tail_str][0]
                i['head'] = [i for i in range(len(objects)) if objects[i]['title'] in head_str][0]

                edges.append(i)
        return {
            'objects':objects,
            'edges':edges
        }

    comp = name
    pnl_container.pnl_objects['compositions'][comp]._analyze_graph()
    gv = pnl_container.pnl_objects['compositions'][comp].show_graph(output_fmt='gv',
                                                                    show_learning=True,
                                                                    show_controller=True
                                                                    )
   
    gv_all = pnl_container.pnl_objects['compositions'][comp].show_graph(output_fmt='gv',
                                                                    show_learning=True,
                                                                    show_controller=True,
                                                                    show_node_structure='ALL'
                                                                    )

    gv_svg = gv.pipe(format='svg')

    gv_all_svg = gv_all.pipe(format='svg')


    gv_svg_dict = etree_to_dict(fromstring(gv_svg.decode()))
    
    gv_all_svg_dict = etree_to_dict(fromstring(gv_all_svg.decode()))
    

    correct_dict(gv_svg_dict)
    print_to_file("gv_svg_dict\n\n" + json.dumps(gv_svg_dict, indent=4) + "\n\n")

    correct_dict(gv_all_svg_dict)
    print_to_file("gv_all_svg_dict\n\n" + json.dumps(gv_all_svg_dict, indent=4))


    # gv_d = parse_corrected_dict(gv_svg_dict)

    gv_d = parse_corrected_dict(gv_all_svg_dict)

    gv_d['maxX'] = float(gv_svg_dict['svg']['width'].replace('pt',''))
    gv_d['maxY'] = float(gv_svg_dict['svg']['height'].replace('pt', ''))
    return gv_d



def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=2))
    graph_pb2_grpc.add_ServeGraphServicer_to_server(GraphServer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print('PYTHON SERVER READY')
    server.wait_for_termination()


if __name__ == '__main__':
    serve()