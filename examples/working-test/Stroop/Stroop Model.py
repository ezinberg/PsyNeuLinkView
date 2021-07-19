import psyneulink as pnl
import numpy as np

# CONSTRUCT THE MODEL ***********************************

# Construct the color naming pathway:
color_input = pnl.ProcessingMechanism(name='COLOR INPUT', size=2) # Note:  default function is Linear
color_input_to_hidden_wts = np.array([[2, -2], [-2, 2]])
color_hidden = pnl.ProcessingMechanism(name='COLOR HIDDEN', size=2, function=pnl.Logistic(bias=-4))
color_hidden_to_output_wts = np.array([[2, -2], [-2, 2]])
output = pnl.ProcessingMechanism(name='OUTPUT', size=2, function=pnl.Logistic)
color_pathway = [color_input, color_input_to_hidden_wts, color_hidden, color_hidden_to_output_wts, output]

# Construct the word reading pathway (using the same output_layer)
word_input = pnl.ProcessingMechanism(name='WORD INPUT', size=2)
word_input_to_hidden_wts = np.array([[3, -3], [-3, 3]])
word_hidden = pnl.ProcessingMechanism(name='WORD HIDDEN', size=2, function=pnl.Logistic(bias=-4))
word_hidden_to_output_wts = np.array([[3, -3], [-3, 3]])
word_pathway = [word_input, word_input_to_hidden_wts, word_hidden, word_hidden_to_output_wts, output]

# Construct the task specification pathways
task_input = pnl.ProcessingMechanism(name='TASK INPUT', size=2)
task = pnl.LCAMechanism(name='TASK', size=2, initial_value=[0.5,0.5])
task_color_wts = np.array([[4,4],[0,0]])
task_word_wts = np.array([[0,0],[4,4]])
task_color_pathway = [task_input, task, task_color_wts, color_hidden]
task_word_pathway = [task_input, task, task_word_wts, word_hidden]

# Construct the decision pathway:
decision = pnl.DDM(name='DECISION',
               input_format=pnl.ARRAY,
               function=pnl.DriftDiffusionAnalytical(drift_rate=(1.0),
                                                 threshold=(0.2645),
                                                 noise=(0.5),
                                                 starting_point=(0),
                                                 t0=0.15),
               output_ports=[pnl.DECISION_VARIABLE,
                              pnl.RESPONSE_TIME,
                              pnl.PROBABILITY_UPPER_THRESHOLD]
               )
decision_pathway = [output, decision]

# Reward Mechanism - should receive input from environment based on DECISION_VARIABLE of decision Mechanism
reward = pnl.TransferMechanism(name='reward')

# Construct the Composition:
# Stroop_model = Composition(name='Stroop Model', controller=control)
Stroop_model = pnl.Composition(name='Stroop Model - EVC')
Stroop_model.add_linear_processing_pathway(color_pathway)
Stroop_model.add_linear_processing_pathway(word_pathway)
Stroop_model.add_linear_processing_pathway(task_color_pathway)
Stroop_model.add_linear_processing_pathway(task_word_pathway)
Stroop_model.add_linear_processing_pathway(decision_pathway)
Stroop_model.add_node(reward)

# Assign Scheduler Conditions:
settling_time = 1
# scheduler = Scheduler(composition=Stroop_model)
Stroop_model.scheduler.add_condition(color_hidden, pnl.EveryNCalls(task, settling_time))
Stroop_model.scheduler.add_condition(word_hidden, pnl.EveryNCalls(task, settling_time))


# SHOW_GRAPH ***********************************

# Stroop_model.show_graph()


# RUN THE MODEL *********************************

# Label inputs
red = [1,0]
green = [0,1]
word = [0,1]
color = [1,0]

np.set_printoptions(precision=2)
global t
t = 0
def print_after():
    global t
    if t==0:
        return
    print(f'\nEnd of trial {t}:')
    print(f'\t\t\t\tcolor  word')
    print(f'\ttask:\t\t{task.value[0]}')
    print(f'\ttask gain:\t   {task.parameter_ports[pnl.GAIN].value}')
    print(f'\t\t\t\tred   green')
    print(f'\toutput:\t\t{output.value[0]}')
    print(f'\tdecision:\t{decision.value[0]}{decision.value[1]}')
    print(f'\tconflict:\t  {pnl.control._objective_mechanism.value[0]}')
    t += 1

task.log.set_log_conditions(pnl.VALUE)

task.initial_value = [0.5,0.5]
task.reset_stateful_function_when=pnl.AtPass(n=0)
# task.reset_stateful_function_when=AtTrialStart()

num_trials = 2
stimuli = {color_input:[red] * num_trials,
           word_input:[green] * num_trials,
           task_input:[color] * num_trials}
Stroop_model.run(inputs=stimuli,
                 # animate=True,
                #  animate={'show_controller':True,
                #           'show_cim':True},
                 call_after_trial=print_after
                 )
print(Stroop_model.results)
Stroop_model.log.print_entries()

# PsyNeuLinkView Graphics Info 
pnlv_graphics_spec = {
    "Window Settings": {
        "Width": "",
        "Height": ""
    },
    "Canvas Settings": {
        "Width": 78.75,
        "Height": 72.45,
        "Zoom": 100,
        "xScroll": 0,
        "yScroll": 0
    },
    "Graph Settings": {
        "Scale": 1.05,
        "Components": {
            "Nodes": {
                "DECISION": {
                    "x": 45.73,
                    "y": 81.96
                },
                "TASK INPUT": {
                    "x": 46.06,
                    "y": 13.65
                },
                "TASK": {
                    "x": 47.74,
                    "y": 36.92
                },
                "WORD INPUT": {
                    "x": 60.36,
                    "y": 15.59
                },
                "WORD HIDDEN": {
                    "x": 52.41,
                    "y": 49.42
                },
                "COLOR INPUT": {
                    "x": 31.9,
                    "y": 15.41
                },
                "COLOR HIDDEN": {
                    "x": 38.09,
                    "y": 49.24
                },
                "OUTPUT": {
                    "x": 46.02,
                    "y": 66.67
                },
                "reward": {
                    "x": 58.09,
                    "y": 77.22
                }
            }
        }
    }
}
