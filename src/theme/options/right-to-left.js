import { useEffect } from 'react';
import PropTypes from 'prop-types';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

// ----------------------------------------------------------------------

export default function RTL({ children, themeDirection }) {
  useEffect(() => {
    document.dir = themeDirection;
  }, [themeDirection]);

  const cacheRtl = createCache({
    key: 'rtl',
    prepend: true,
    // https://github.com/styled-components/stylis-plugin-rtl/issues/35
  });

  if (themeDirection === 'rtl') {
    return <CacheProvider value={cacheRtl}>{children}</CacheProvider>;
  }

  return <>{children}</>;
}

RTL.propTypes = {
  children: PropTypes.node,
  themeDirection: PropTypes.oneOf(['rtl', 'ltr']),
};
