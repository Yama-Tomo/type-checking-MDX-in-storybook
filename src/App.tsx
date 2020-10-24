import { HelloWorld } from '~/components/HelloWorld';
import { StyledFC } from '~/types/styled-compnents';
import React from 'react';
import styled from 'styled-components';

/* -------------------- DOM -------------------- */
const UiComponent: StyledFC = (props) => (
  <main {...props}>
    <HelloWorld />
  </main>
);

/* ------------------- Style ------------------- */
const StyledUiComponent: StyledFC = styled(UiComponent)`
  margin: 1rem;
`;

/*---------------------------------------------- */
export default StyledUiComponent;
