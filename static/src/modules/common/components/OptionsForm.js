import React from 'react';
import _ from 'lodash';

/**
 * This component provides a simple interface for rendering form checkbox
 * options. As such, it is intended for simple boolean controls. However,
 * it has some useful features:
 *  - nesting of options under "groups"
 *  - dependent options (one appears if another is "On", must be in same group)
 *  - ordering
 *  - create two radio buttons to represent a boolean option (this allows
 *    a special label for On and Off states)
 *
 * To use the component a map of options data is required, which looks like:
 *   optionsData: {
 *     'optionA': false,
 *     'optionB': true
 *   }
 *
 * A map of option definitions is also required, which looks like:
 *   optionsDef: {
 *     optionA: {
 *         label: 'Turn of Option A',
 *         group: 'My awesome group',
 *         order: 1
 *     },
 *     optionB: {
 *       label: 'Turn on Option B',
 *       group: 'My awesome group',
 *       dependsOn: 'optionA',
 *       order: 2
 *     }
 *   }
 *
 * Finally, a `changeHandler` is required for processing user interaction.
 * The changeHandler is a function which will be called with the option's
 * key when it is toggled.
 */
const OptionsForm = {
    makeControls: function(optionsData, optionsDef, changeHandler) {
        var _optionsData = _.map(optionsData, function(value, key) {
            return {
                key: key,
                value: value
            };
        });

        _optionsData = _.sortBy(_optionsData, function(value) {
            return (optionsDef[value.key].order);
        });

        // create and group rdo react components
        //
        var controlGroups = _.reduce(_optionsData, function(result, value) {
            var key = value.key;

            var shouldDisplay = true;
            if (optionsDef[key].shouldDisplay) {
                shouldDisplay = optionsDef[key].shouldDisplay();
            }

            if (optionsDef[key] === undefined || !shouldDisplay) {
                return result;
            }

            var groupingKey = optionsDef[key].group || key;
            if (result[groupingKey] === undefined) {
                result[groupingKey] = [];
            }

            var controlType = optionsDef[key].type || 'checkbox';
            var dependsOn = optionsDef[key].dependsOn && 'dependent-ctrl';
            var enabled = optionsData[key] && 'enabled-ctrl' || null;
            var className = [controlType, dependsOn, enabled].join(' ');

            function makeControl(checked, label) {
                return (
                    <div className={className}>
                        <label htmlFor={key}>
                            <input type={controlType}
                                name={optionsDef[key].group || key}
                                id={key}
                                checked={checked}
                                value={checked}
                                onChange={function() {
                                    return changeHandler(key);
                                }}/>
                            {label}
                        </label>
                    </div>
                );
            }

            var control = makeControl(optionsData[key], optionsDef[key].label);

            // Underlying controls are all boolean, but it is useful to display
            // radio buttons in some cases. However, only two radio buttons should
            // be displayed and their state are dependant on each other.
            if (controlType === 'radio') {

                var oppositeVal = null;

                // only flip value if boolean (i.e. keep nulls intact)
                if (_.isBoolean(optionsData[key])) {
                    oppositeVal = !optionsData[key];
                }

                var control = (
                    <div>
                        {makeControl(oppositeVal, optionsDef[key].labeloff)}
                        {control}
                    </div>
                );
            }

            result[groupingKey].push(control);
            return result;
        }, {});

        return _.map(controlGroups, function(_controls, key) {
            return (
                <div className='form-group'>
                    <h4>{key}</h4>
                    {_controls}
                </div>
            );
        });
    }
};

export default OptionsForm;
