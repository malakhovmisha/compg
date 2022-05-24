---
to: <%= cwd %>/<%= name %>/<%= name %>.jsx
---
<%_ children = childrenArr.split(',').filter((a) => a) _%>
import React from 'react';
import PropTypes from 'prop-types';
<%_ for(var i = 0; i < children.length; i++) { _%>
    <%_ childName = children[i] _%>
import { <%= childName %> } from '../<%= childName %>/<%= childName %>';
<%_ } _%>
import styles from './<%= name %>Styles.css';

export const <%= name %> = ({ someProp }) => {
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

<%= name %>.propTypes = {
    someProp: PropTypes.string
};
