import time

filepath = "/Users/ezrazinberg/Desktop/code/psynl/PsyNeuLinkView/examples/working-test/pnlv-plotting-test.py"

t = time.time()
with open(filepath, 'r') as f:
    res = f.read()
print(str(time.time() - t) + " secs")
print(res)