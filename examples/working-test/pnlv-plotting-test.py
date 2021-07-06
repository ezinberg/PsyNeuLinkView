import psyneulink as pnl

input = pnl.ProcessingMechanism(name='input')
mid = pnl.ProcessingMechanism(name='mid', function=pnl.Linear(slope=2))
output = pnl.ProcessingMechanism(name='output', function=pnl.Linear(slope=2))

comp = pnl.Composition(
    pathways=[input, mid, output]
)

# f = open('/Users/ezrazinberg/Desktop/code/psynl/PsyNeuLinkView/examples/working-test/output.txt', 'w')
with open('/Users/ezrazinberg/Desktop/code/psynl/PsyNeuLinkView/examples/working-test/script_output.txt', 'w') as f:
    print("file: " + str(f), file=f, flush=True)
    print("comp.name: " + comp.name, file=f, flush=True)


# comp.run(10, 1, 2, 3, 4, 5, 10, 7)
# comp.run(inputs=[10, 1, 2, 3, 4, 5, 10, 7])
# comp.run(inputs=[1], num_trials=3)
# print(comp.run(inputs=[1], num_trials=3))


# PsyNeuLinkView Graphics Info 
pnlv_graphics_spec = {
}
