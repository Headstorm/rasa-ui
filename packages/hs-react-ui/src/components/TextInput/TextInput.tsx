import React, { InputHTMLAttributes, ReactNode, SyntheticEvent, TextareaHTMLAttributes, useCallback } from 'react';
import styled, { StyledComponentBase } from 'styled-components';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import debounce from 'lodash.debounce';
import { Div, TextArea, Input as InputElement } from '../../htmlElements';
import { useColors } from '../../context';

const Container = styled(Div)`
  ${({ isValid }: { isValid?: boolean }) => {
    const { destructive, grayMedium, background } = useColors();
    return `
      border 2px solid ${isValid === false ? destructive : grayMedium};
      min-width: 10rem;
      position: relative;
      display: flex;
      flex-flow: row;
      border-radius: 0.25em;
      background-color: ${background};
  `;
  }}
`;

const TextInputContainer = styled(InputElement)`
  ${() => {
    const { transparent } = useColors();
    return `
      border: 0 none;
      flex-grow: 1;
      outline: 0 none;
      height: 2em;
      font-size: 1em;
      padding: 0.5rem;
      background-color: ${transparent};
  `;
  }}
`;

const TextAreaInputContainer = styled(TextArea)`
  ${({ multiLineIsResizable }: TextInputProps) => {
    const { transparent } = useColors();
    return `
      border: 0 none;
      flex-grow: 1;
      outline: 0 none;
      font-size: 1em;
      min-height: 2em;
      min-width: 0px;
      padding: .5rem;
      background-color: ${transparent};
      resize: ${multiLineIsResizable ? 'both' : 'none'};
    `;
  }}
`;

const IconContainer = styled(Div)`
  ${() => {
    const { grayMedium } = useColors();
    return `
      padding: 0.5em;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${grayMedium};
      cursor: pointer;
    `;
  }}
`;

const ErrorContainer = styled(Div)`
  ${() => {
    const { destructive } = useColors();
    return `
      position: absolute;
      top: calc(100% + 0.25em);
      color: ${destructive};
      font-size: 0.75rem;
    `;
  }}
`;

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement> & {
  iconPrefix?: string | ReactNode;
  onClear?: (event: SyntheticEvent) => void;
  onChange?: (event: SyntheticEvent) => void;
  debouncedOnChange?: (event: SyntheticEvent) => void;
  isValid?: boolean;
  isMultiline?: boolean;
  errorMessage?: string;
  debounceInterval?: number;
  multiLineIsResizable?: boolean;
  StyledContainer?: string & StyledComponentBase<any, {}>;
  StyledInput?: string & StyledComponentBase<any, {}>;
  StyledIconContainer?: string & StyledComponentBase<any, {}>;
  nativeInputHTMLAttributes?: string;
};

const createIcon = (
  StyledIconContainer: string & StyledComponentBase<any, {}>,
  iconPrefix: ReactNode,
) => {
  if (typeof iconPrefix === 'string') {
    return (
      <StyledIconContainer>
        <Icon size="16px" path={iconPrefix} />
      </StyledIconContainer>
    );
  }

  return <StyledIconContainer>{iconPrefix}</StyledIconContainer>;
};

const defaultCallback = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

const TextInput = ({
  debouncedOnChange = defaultCallback,
  debounceInterval = 8,
  errorMessage,
  iconPrefix,
  isMultiline,
  isValid,
  multiLineIsResizable,
  onChange = defaultCallback,
  onClear,
  StyledContainer = Container,
  StyledIconContainer = IconContainer,
  StyledInput, // Not defaulting here due to the issue with <input as="textarea" />
  ...nativeInputHTMLAttributes
}: TextInputProps) => {
  // Debounce the change function using useCallback so that the function is not initialized each time it renders
  const debouncedChange = useCallback(debounce(debouncedOnChange, debounceInterval), []);

  // Determine the correct input type. Using a single input and the 'as' keyword
  // to display as a text area disables the ability to set cols/rows
  let InputComponent: string & StyledComponentBase<any, {}> = TextInputContainer;
  if (StyledInput) {
    InputComponent = StyledInput;
  } else if (isMultiline) {
    InputComponent = TextAreaInputContainer;
  }

  return (
    <StyledContainer isValid={isValid}>
      {iconPrefix && createIcon(StyledIconContainer, iconPrefix)}
      {/*
        // @ts-ignore */}
      <InputComponent
        value={nativeInputHTMLAttributes.value || nativeInputHTMLAttributes.defaultValue}
        onChange={(e: SyntheticEvent) => {
          e.persist();
          onChange(e);
          debouncedChange(e);
        }}
        multiLineIsResizable={multiLineIsResizable}
        {...nativeInputHTMLAttributes}
      />
      {onClear && (
        <StyledIconContainer onClick={onClear}>
          <Icon path={mdiClose} size="1em" />
        </StyledIconContainer>
      )}
      {isValid === false && errorMessage && <ErrorContainer>{errorMessage}</ErrorContainer>}
    </StyledContainer>
  );
};

TextInput.Container = Container;
TextInput.Input = TextInputContainer;
TextInput.IconContainer = IconContainer;
TextInput.TextArea = TextAreaInputContainer;

export default TextInput;
