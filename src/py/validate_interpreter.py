import os
import sys

# raise ValueError("validate_interpreter.py")

my_env = os.environ

sys.path.append(os.getenv('PATH'))

if len(sys.argv) > 1:
    try:
        sys.path.append(sys.argv[1])
    except:
        pass

import google
import redbaron
import psyneulink