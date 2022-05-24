---
to: <%= cwd %>/<%= name %>/<%= name %>.tsx
---
<%_ children = childrenArr.split(',').filter((a) => a) _%>
import React, { FC } from 'react';
<%_ for(var i = 0; i < children.length; i++) { _%>
    <%_ childName = children[i] _%>
import { <%= childName %> } from '../<%= childName %>/<%= childName %>';
<%_ } _%>
import styles from './<%= name %>Styles.css';

type Props = {
    someProp?: string;
};

export const <%= name %>: FC<Props> = ({ someProp }) => {
    return (
        <div className={styles.<%= h.changeCase.camelCase(name) %>}>
            <%= name %>
            {someProp}
<%_ for(var i = 0; i < children.length; i++) { _%>
        <%_ childName = children[i] _%>
            <<%= childName %> />
<%_ } _%>
        </div>
    );
};
