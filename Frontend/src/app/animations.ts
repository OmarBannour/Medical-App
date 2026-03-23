import { animate, style, transition, trigger } from '@angular/animations';

export const fadeSlideInOut = trigger('fadeSlideInOut', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('0.4s ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
  ])
]);

export const formAnimation = trigger('formAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
  ])
]);
