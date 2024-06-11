import React from 'react';
import { Link } from 'react-router-dom';

const CustomLinkContainer = React.forwardRef((props, ref) => (
  <Link ref={ref} {...props} />
));

export default CustomLinkContainer;
