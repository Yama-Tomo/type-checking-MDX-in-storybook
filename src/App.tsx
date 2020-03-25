import React from 'react';
import styled from 'styled-components';
import HelloWorld from '~/components/HelloWorld';

/* -------------------- DOM -------------------- */
const UiComponent: React.FCX = (props) => (
  <main {...props}>
    <HelloWorld />
  </main>
);

/* ------------------- Style ------------------- */
const StyledUiComponent: React.FCX = styled(UiComponent)`
  margin: 1rem;
`;

/*---------------------------------------------- */
export default StyledUiComponent;
