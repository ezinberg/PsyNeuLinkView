# PsyNeuLinkView

PsyNeuLinkView (PNLV) is an application that provides a graphical user interface to the PsyNeuLink (PNL) Python library. This allows users to visualize and edit PNL compositions in a drag-and-drop format on a native desktop app. An open source project, PNLV is built with an Electron frontend that uses gRPC to interact with a Python server running a PNL script. 

PNLV currently supports the following features:
- View PNL compositions where the PNL script contains only one composition within its namespace.
- Edit layout of mechanisms within PNL compositions with drag-and-drop. User defined layout of nodes is autosaved into the PNL script so the arrangement is saved for future use.
- Run select PNL compositions with custom input.
- Monitor and plot the values of any parameter of the composition on configurable, tileable line plots.

Future planned features include:
- Run any PNL composition.
- Construct and modify PNL composition topology within the app.
- Additional output visualization types (heatmaps, multidimensional output, etc.).
- Double click node for more information (parameter values, etc).


# Set Up and Run

(NOTE: See #10 for important usage information)

1. Download code (https://github.com/ezinberg/PsyNeuLinkView)

2. Install dependencies
    1. Node.js (Must be on PATH)
    2. Yarn (Must be on PATH)
    3. Python3 (latest version recommended)
    4. PsyNeuLink
        - $ pip install psyneulink
    5. RedBaron
        - $ pip install redbaron

3. Set up dependencies. Navigate to top level PNLV directory and run:
    - $ yarn

4. Run application
    - **To run:**
        - **$ yarn electron-dev**
    - NOTE: a number of errors may be thrown due to internal electron errors or lint warnings. This should not affect functionality.

5. Initial setup 
    1. Navigate to Preferences menu (cmd/ctrl + , or Edit>Preferences)
    2. Under “Interpreter Path”, enter the path to your Python executable. You should see a green check icon if the interpreter is validated.

6. Load a composition
    1. Open a composition (cmd/ctrl + O or File>Open)
    2. Select pnlv-plotting-test.py from PsyNeuLinkView/examples/working-test/basic
    3. For pnlv-plotting-test.py, a simple 3 node graph should be rendered in the Construct tab. For Rumelhart Semantic Network.py, a more complex graph should load (will take a few seconds)
    4. Nodes can be dragged and repositioned
        - NOTE: Opening devtools (cmd/ctrl + I) while viewing the Construct tab may crash the app. Dragging nodes while the window is not at fullscreen may also cause this. When this error occurs, you may need to manually edit the PNL python script that was previously loaded such that the pnl_graphics_spec dictionary is initialized as an empty dict. Code to reposition nodes on window size change needs work. However, you can open devtools while viewing the Monitor tab.

7. Add and configure plots
    1. Switch to Monitor tab
    2. Drag and drop desired number of plots from the Line Plot option in the sidebar into the main window
    3. In the configuration panel at the bottom of the window, select the Line-Plot-1 tab (default plot name)
    4. Scroll down and select a component and a port within that component to be plotted
    5. Select the default color to change

8. Provide input to composition
    1. In the bottom configuration panel, select the Composition tab
    2. Click the upload button and upload the file input.json from PsyNeuLinkView/examples/working-test/basic

9. Run composition
    - Click green play icon in the control strip at the top of the window

10. Quit app
    - First, Cmd-Q or Electron>Quit psyneulinkview. Then Keyboard Interrupt at the terminal.
        - **NOTE: Do not use Keyboard Interrupt without quitting Electron first. Keyboard Interrupt at the terminal will only kill the Electron client process, and it will not kill the Python server process.** This will result in the old Python process remaining alive when attempting to reopen the app, leading to PNL registry side-effects and bugs.