// Theme configuration based on sample3.html design
export const lightTheme = {
  // Primary colors from login page and sample3.html
  colors: {
    lightBlue: 'rgb(46, 151, 197)',
    nearBlack: 'rgb(0, 1, 1)',
    purple: 'rgb(150, 129, 158)',
    orange: 'rgb(229, 151, 54)',
    darkTeal: 'rgb(52, 72, 87)',
    success: 'rgb(46, 204, 113)',
    warning: 'rgb(241, 196, 15)',
    danger: 'rgb(231, 76, 60)',
    info: 'rgb(52, 152, 219)',
  },
  
  // Background colors
  backgrounds: {
    primary: '#f5f7fa',
    secondary: '#ffffff',
    sidebar: '#ffffff',
  },
  
  // Text colors
  text: {
    primary: '#333333',
    secondary: '#666666',
  },
  
  // Border and shadows
  border: '#e0e0e0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Button gradient (from login page)
  buttonGradient: 'linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%)',
  
  // Alternative button gradient
  buttonGradientAlt: 'linear-gradient(to top, #00154c, #12376e, #23487f)',
};

export const darkTheme = {
  // Primary colors adjusted for dark mode
  colors: {
    lightBlue: 'rgb(70, 180, 230)',
    nearBlack: 'rgb(220, 225, 230)',
    purple: 'rgb(170, 150, 180)',
    orange: 'rgb(249, 180, 85)',
    darkTeal: 'rgb(72, 92, 107)',
    success: 'rgb(46, 204, 113)',
    warning: 'rgb(241, 196, 15)',
    danger: 'rgb(231, 76, 60)',
    info: 'rgb(52, 152, 219)',
  },
  
  // Background colors
  backgrounds: {
    primary: '#1a1d2e',
    secondary: '#252839',
    sidebar: '#252839',
  },
  
  // Text colors
  text: {
    primary: '#e0e0e0',
    secondary: '#a0a0a0',
  },
  
  // Border and shadows
  border: '#2d3142',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // Button gradient (from login page)
  buttonGradient: 'linear-gradient(45deg, rgb(70, 180, 230) 0%, rgb(52, 152, 219) 100%)',
  
  // Alternative button gradient
  buttonGradientAlt: 'linear-gradient(to top, #001a5c, #1a4080, #2d5a9f)',
};

export type Theme = typeof lightTheme;
