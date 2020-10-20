import * as React from 'react';
import { Field, Radio, TextInput } from './controls';
import { Columns, Row } from './layout';

const CalcBuilder = ({ propName, operator, min, max, onUpdateState }) => {
    const updateMinOrMax = evt => {
        const target = evt.currentTarget;
        const minOrMax = target.dataset.name;
        onUpdateState({
            path: ['config', propName, 'calc', operator, minOrMax],
            newValue: target.value,
        });
    };

    const updateOperator = newValue => {
        onUpdateState({
            path: ['config', propName, 'calc', 'operator'],
            newValue,
        });
    };

    return (
        <>
            <Row>
                <Columns>
                    <Field label="Min">
                        <TextInput
                            data-name="min"
                            type="number"
                            value={min}
                            onChange={updateMinOrMax}
                        />
                    </Field>
                    <Field label="Max">
                        <TextInput
                            data-name="max"
                            type="number"
                            value={max}
                            onChange={updateMinOrMax}
                        />
                    </Field>
                </Columns>
            </Row>
            <Row>
                <Columns justify="flex-start">
                    <Field
                        label="Add"
                        labelOnRight
                        onClick={updateOperator.bind(this, 'add')}
                    >
                        <Radio checked={operator === 'add'} />
                    </Field>
                    <Field
                        label="Multiply"
                        labelOnRight
                        onClick={updateOperator.bind(this, 'multiply')}
                    >
                        <Radio checked={operator === 'multiply'} />
                    </Field>
                </Columns>
            </Row>
        </>
    );
};

export default CalcBuilder;
