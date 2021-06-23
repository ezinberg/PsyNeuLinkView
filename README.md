**OVERVIEW**

PsyNeuLinkView is a desktop app built with Electron and react/redux that serves as a graphical user interface for the 
PsyNeuLink python library. Currently, the app supports visualization, execution, and plotting of PsyNeuLink 
Compositions. All functionality is currently limited and experimental, with many improvements and expansions of 
functionality planned. 

**REQUIREMENTS**

node.js on path
    
    to install: 
        on Windows (via chocolatey): choco install nodejs
        on Mac/Linux (via homebrew): brew install node

yarn on path
    
    to install: 
        on Windowss (via chocolatey): choco install yarn
        on Mac/Linux (via homebrew): brew install node

Python 3.x with PsyNeuLink (pip install psyneulink), RedBaron (pip install redbaron) installed (does not need to be on path)
    
**INSTALLATION**

navigate to the top level of the PNLV repo in your terminal and execute the command:

    $ yarn

**RUNNING**

navigate to the top level of the PNLV repo in your terminal and execute the command:

    $ yarn electron-dev
    
**COMPILING**

navigate to the top level of the PNLV repo in your terminal and execute the command:

    $ yarn build # build for host OS
    $ yarn build -m # build for mac
    $ yarn build -w # build for win
    # yarn build -l # build for linux
    
NOTE: compiling for Mac requires Mac host