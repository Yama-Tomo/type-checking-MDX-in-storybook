import { StyledFC } from '~/types/styled-compnents';
import React from 'react';
import styled from 'styled-components';

/* -------------------- DOM -------------------- */
type Props = {
  size?: 'small' | 'medium' | 'large';
  color?: string;
};

const UiComponent: StyledFC<Props> = (props) => (
  <div className={props.className}>
    <span>hello world</span>
  </div>
);

/* ------------------- Style ------------------- */
const StyledUiComponent: StyledFC<Props> = styled(UiComponent)`
  font-size: ${(props) => fontSize(props)};
  ${(props) => (props.color ? `color: ${props.color};` : '')}
`;

const fontSize = (props: Props) => {
  if (props.size === 'small') {
    return '1rem';
  }

  if (props.size === 'medium') {
    return '1.5rem';
  }

  return '2rem';
};

/*---------------------------------------------- */
export { StyledUiComponent as HelloWorld };
