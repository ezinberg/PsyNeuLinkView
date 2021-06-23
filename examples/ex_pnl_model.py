import math
import psyneulink as pnl

t1 = pnl.TransferMechanism(name='t1')
t2 = pnl.TransferMechanism(name='t2')
t3 = pnl.TransferMechanism(name='t3')

c = pnl.Composition(name='comp')
c.add_linear_processing_pathway([
    t1,
    t2,
    t3
])

pnlv_graphics_spec = {
    'graph': {
        'fillProportion':1,
        'components': {
            't1':{
                'x':0,
                'y':0,
                'color':'yellow'
            }
        }
    }
}