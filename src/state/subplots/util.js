import React from 'react'

export function snakeCaseToUpperCamelCase(word) {
    return word.split('_').map(word=>word.charAt(0).toUpperCase() + word.slice(1)).join('')
}

export function generateDefaultName(state, plotType, counter=null){
    const prefix = snakeCaseToUpperCamelCase(plotType);
    counter = counter ?? state.mapPlotTypeToDefaultNameCounter[plotType];
    return `${prefix}-${counter}`
}

export function parseName(state, plotType, name, allowDuplicates){
    /**
     * validates legality of name and returns it including any necessary modifications
     */
    const nameSet = new Set([...Object.values(state.mapIdToName)]);
    if (name === '' || !name){
        name = generateDefaultName(state, plotType);
    }
    if (!allowDuplicates){
        if (nameSet.has(name)){
            const namePrefix = name;
            let nameSuffixCounter = 1;
            while (nameSet.has(name)){
                name = `${namePrefix}(${nameSuffixCounter})`;
                nameSuffixCounter += 1;
            }
        }
    }
    return name
}

export function getDefaultNameCounter(state, plotType, name){
    /**
     * checks if adding subplot with `name` should increment the default name counter for `plotType` and returns
     * the counter, including increment if necessary
     */
    let counter = state.mapPlotTypeToDefaultNameCounter[plotType];
    if (name == generateDefaultName(state, plotType)){
        counter += 1
    }
    return counter
}

export function parseNameOnEdit(id, state, plotType, name){
    /**
     * checks if newly entered name differs from name currently in store. if so, passes it to parseName
     */
    // skip parsing if name is empty or comprised only of spaces
    if (name.trim() === ""){}
    // null value for name means no edit, so don't parse in that case
    else if (name){
        let baseName = state.mapIdToName[id];
        if (baseName!==name){
            name = parseName(state, plotType, name)
        }
    }
    return name
}

export function parseDefaultNameCounterOnEdit(id, state, plotType, name){
    /**
     * checks if default name counter for `plotType` should be decremented due to a change in `name`
     */
    let baseCounter = state.mapPlotTypeToDefaultNameCounter[plotType];
    // null value for name means no edit, so don't parse in that case
    if (name){
        let baseName = state.mapIdToName[id];
        if (baseName!==name){
            if (name==generateDefaultName(state, plotType, baseCounter-1)){
                return baseCounter - 1
            }
        }
    }
    return baseCounter
}

export function parseLabelForEmptyName(plotType){
    let upperCamelCasePlotType = snakeCaseToUpperCamelCase(plotType);
    return (
    <span
        className={"empty-name-label"}
    >
        <em>
            {upperCamelCasePlotType}
        </em>
    </span>
    )
}