import { reduceMotion } from 'themes/glitch/util/initial_state';
import ReducedMotion from './reduced_motion';
import Motion from 'react-motion/lib/Motion';

export default reduceMotion ? ReducedMotion : Motion;
