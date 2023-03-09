import { FC, useState } from 'react';
import { Dropdown, Input } from '@firecamp/ui';
import { EAuthTypes, TPlainObject } from '@firecamp/types';
import { authUiFormState } from '../constants';
import { setInputType } from '../service';

const Hawk: FC<IHawk> = ({ auth = {}, onChange = () => {} }) => {
  const { Hawk } = EAuthTypes;
  const algorithmList = authUiFormState[Hawk].algorithmList as [];
  const inputList = authUiFormState[Hawk].inputList;
  const advancedInputList = authUiFormState[Hawk].advancedInputList;
  const [dirtyInputs, setDirtyInputs] = useState<TPlainObject>(
    inputList.reduce((p, n) => {
      return { ...p, [n.id]: false };
    }, {})
  );

  const _handleChange = (e: any, id: string) => {
    e.preventDefault();
    const value = e.target.value;
    if ((inputList.map((e) => e.id) || []).includes(id)) {
      setDirtyInputs((s) => ({ ...s, [id]: true }));
    }
    onChange(Hawk, { key: id, value });
    // console.log("value", value, id)
  };

  const _setAlgorithm = (algo: any) => {
    if (!algo) return;
    onChange(Hawk, {
      key: 'algorithm',
      value: algo,
    });
  };

  const _handleSubmit = (e: { preventDefault: () => any }) => {
    e && e.preventDefault();
  };

  return (
    <form className="fc-form grid" onSubmit={_handleSubmit}>
      {inputList.map((input, i) => {
        // console.log('isDirty', isDirty, "errorMsg", errorMsg)
        let errorMsg = '';
        if (dirtyInputs[input.id] && !auth?.[input.id]?.length) {
          errorMsg = `${input.name} can not be empty`;
        }
        return (
          <Input
            key={i}
            autoFocus={i === 0}
            label={input.name}
            type={setInputType(input.id)}
            placeholder={input.name}
            name={input.id}
            value={auth?.[input.id] || ''}
            error={errorMsg}
            onChange={(e) => _handleChange(e, input.id)}
            isEditor
          />
        );
      })}
      <label className="fc-form-field-group">
        Advanced
        <span>optional</span>
      </label>
      {advancedInputList.map((input, i) => {
        return (
          <Input
            key={i}
            label={input.name}
            type={setInputType(input.id)}
            placeholder={input.name}
            name={input.id}
            value={auth?.[input.id] || ''}
            onChange={(e) => _handleChange(e, input.id)}
            isEditor
          />
        );
      })}
      <div className="form-group">
        <label>Algorithm</label>
        <Dropdown
          selected={auth[Hawk]['algorithm'] || 'SHA256'} //default "SHA256
        >
          <Dropdown.Handler>
            <div className={'select-box-title'}>
              {auth[Hawk]['algorithm'] || 'SHA256'}
            </div>
          </Dropdown.Handler>
          <Dropdown.Options
            options={algorithmList}
            onSelect={(method) => {
              _setAlgorithm(method);
            }}
          />
        </Dropdown>
      </div>
    </form>
  );
};

export default Hawk;

interface IHawk {
  auth: any; // TODO: add interface
  onChange: (
    authType: string, // TODO: add enum
    updates: { key: string; value: any }
  ) => void;
}
