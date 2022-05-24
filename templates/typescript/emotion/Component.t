---
to: <%= cwd %>/<%= name %>/<%= name %>.tsx
---
<%_ children = childrenArr.split(',').filter((a) => a) _%>
import React, { FC } from 'react';
<%_ for(var i = 0; i < children.length; i++) { _%>
    <%_ childName = children[i] _%>
import { <%= childName %> } from '../<%= childName %>/<%= childName %>';
<%_ } _%>
import { Container } from './<%= name %>Styles';

type Props = {
    someProp?: string;
};

export const <%= name %>: FC<Props> = ({ someProp }) => {
    return (
        <Container>
            <%= name %>
            {someProp}
<%_ for(var i = 0; i < children.length; i++) { _%>
        <%_ childName = children[i] _%>
            <<%= childName %> />
<%_ } _%>
        </Container>
    );
};
