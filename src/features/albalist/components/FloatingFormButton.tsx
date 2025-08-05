'use client';

import FloatingButton from '@common/button/FloatingButton';
import FloatingButtonContainer from '@common/button/FloatingButtonContainer';

const FloatingFormButton = () => (
  <FloatingButtonContainer>
    <FloatingButton href="/addform" text="폼 만들기" type="addForm" />
  </FloatingButtonContainer>
);

export default FloatingFormButton;
