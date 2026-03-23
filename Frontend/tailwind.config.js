module.exports = {


  content: [
    './src/**/*.html',
    './src/**/*.ts',
  ],
  theme: {
    extend: {
      animation: {
        ripple: 'ripple 600ms linear forwards',
        'checkmark-bounce': 'checkmarkBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'card-fade': 'cardFade 0.4s ease-out forwards'
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(40)', opacity: '0' }
        },
        checkmarkBounce: {
          '0%': { transform: 'scale(0) translateY(20px)', opacity: '0' },
          '70%': { transform: 'scale(1.1) translateY(-5px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        cardFade: {
          '0%': { opacity: '1', transform: 'translateX(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateX(100px) scale(0.95)' }
        }
      }
    }
  }
};
