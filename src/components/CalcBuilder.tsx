import * as React from 'react';
import { Input, InputLabel, Label } from './controls';
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

    const updateOperator = evt => {
        onUpdateState({
            path: ['config', propName, 'calc', 'operator'],
            newValue: evt.currentTarget.value,
        });
    };

    return (
        <>
            <Row>
                <Columns>
                    <InputLabel>min:</InputLabel>
                    <Input
                        data-name="min"
                        type="number"
                        value={min}
                        onChange={updateMinOrMax}
                    />
                    <InputLabel>max:</InputLabel>
                    <Input
                        data-name="max"
                        type="number"
                        value={max}
                        onChange={updateMinOrMax}
                    />
                </Columns>
            </Row>
            <Row>
                <Columns align="flex-start">
                    <Label>
                        <input
                            name={`${propName}-operator`}
                            type="radio"
                            checked={operator === 'add'}
                            value="add"
                            onChange={updateOperator}
                        />{' '}
                        <span>Add</span>
                    </Label>
                    <Label>
                        <input
                            name={`${propName}-operator`}
                            type="radio"
                            checked={operator === 'multiply'}
                            value="multiply"
                            onChange={updateOperator}
                        />{' '}
                        <span>Multiply</span>
                    </Label>
                </Columns>
            </Row>
        </>
    );
};

export default CalcBuilder;