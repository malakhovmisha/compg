---
to: <%= cwd %>/<%= h.changeCase.pascalCase(name) %>/<%= h.changeCase.pascalCase(name) %>Styles.ts
---
import styled from '@emotion/styled';

export const Container = styled.div(() => ({
    display: 'block'
}));
